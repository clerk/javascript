import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VerifyFailure, type InstanceSettings, type Json, type SpecRef } from '../types.ts';

export type Leaves = Readonly<Record<string, Json>>;

type JsonObject = { readonly [key: string]: Json };

export interface StandardFile {
  readonly config: JsonObject;
  readonly environment: Leaves;
}

export const STANDARD_FILE = 'src/core/instances/base.json';

const standard = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'base.json'), 'utf8')) as StandardFile;

export const standardFile = (): StandardFile => standard;

export interface Settings {
  readonly key: string;
  readonly label: string;
  readonly declared: InstanceSettings | null;
  readonly askedBy: string | null;
}

export interface PlannedSpec extends SpecRef {
  readonly sourceHash: string;
}

export interface SettingsGroup {
  readonly settings: Settings;
  readonly specs: readonly PlannedSpec[];
}

export class SettingsRefused extends VerifyFailure {
  readonly param: string | null;
  readonly said: string;
  constructor(message: string, fix: string, refusal: { readonly param: string | null; readonly said: string } = { param: null, said: message }) {
    super('INSTANCE_MISCONFIGURED', message, fix);
    this.param = refusal.param;
    this.said = refusal.said;
  }
}

const isObject = (value: Json | undefined): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value);

export function flattenEnvironment(value: Json, path = '', out: Record<string, Json> = {}): Leaves {
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item !== 'object' || item === null)) out[path] = value.map(String).sort();
    else value.forEach((item, index) => flattenEnvironment(item, `${path}[${index}]`, out));
  } else if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) flattenEnvironment(child, path === '' ? key : `${path}.${key}`, out);
  } else {
    out[path] = value;
  }
  return out;
}

export interface EnvironmentDifference {
  readonly path: string;
  readonly expected: Json;
  readonly found: Json | undefined;
}

export interface EnvironmentComparison {
  readonly compared: number;
  readonly differing: readonly EnvironmentDifference[];
}

export function compareEnvironment(expected: Leaves, live: Json): EnvironmentComparison {
  const shown = flattenEnvironment(live);
  const differing = Object.entries(expected).flatMap(([path, want]): EnvironmentDifference[] => {
    const found = Object.hasOwn(shown, path) ? shown[path] : undefined;
    return JSON.stringify(found) === JSON.stringify(want) ? [] : [{ path, expected: want, found }];
  });
  return { compared: Object.keys(expected).length, differing };
}

export const describeDifference = (d: EnvironmentDifference, expectedBy = 'the file says'): string => `${d.path} is ${d.found === undefined ? 'absent' : JSON.stringify(d.found)}, and ${expectedBy} ${JSON.stringify(d.expected)}`;

function canonical(value: Json): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key]!)}`).join(',')}}`;
  return JSON.stringify(value);
}

function merge(base: JsonObject, over: JsonObject): JsonObject {
  const out: Record<string, Json> = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const under = out[key];
    out[key] = isObject(value) && isObject(under) ? merge(under, value) : value;
  }
  return out;
}

export function configLeaves(value: Json, path = '', out: Record<string, Json> = {}): Leaves {
  if (isObject(value) && Object.keys(value).length > 0) {
    for (const [key, child] of Object.entries(value)) configLeaves(child, path === '' ? key : `${path}.${key}`, out);
  } else {
    out[path] = value;
  }
  return out;
}

const unordered = (value: Json): Json => (Array.isArray(value) ? value.map(canonical).sort() : value);

export const sameLeaf = (a: Json | undefined, b: Json | undefined): boolean => a !== undefined && b !== undefined && canonical(unordered(a)) === canonical(unordered(b));

const keyOf = (config: JsonObject): string => createHash('sha256').update(canonical(config)).digest('hex').slice(0, 12);

export const STANDARD: Settings = { key: keyOf(standard.config), label: 'standard', declared: null, askedBy: null };

export const STANDARD_ENVIRONMENT_KEY = keyOf(standard.environment);

export const settingsFileOf = (specPath: string): string => specPath.replace(/\.e2e\.ts$/, '.settings.json');

export interface SpecText {
  readonly source: string;
  readonly declaration: string | null;
}

export function readSpecText(skillDir: string, specPath: string): SpecText {
  const file = join(skillDir, settingsFileOf(specPath));
  return { source: readFileSync(join(skillDir, specPath), 'utf8'), declaration: existsSync(file) ? readFileSync(file, 'utf8') : null };
}

export const sourceHash = (text: SpecText): string => createHash('sha256').update(JSON.stringify([text.source, text.declaration])).digest('hex');

const FORM = '{ "config": { "auth_multi_factor": { "required_for_sign_up": true } }, "environment": { "user_settings.sign_up.mfa.required": true } }';

export function straySettingsFile(skillDir: string): VerifyFailure | null {
  const specs = join(skillDir, 'specs');
  if (!existsSync(specs)) return null;
  const files = (readdirSync(specs, { recursive: true }) as string[]).map((name) => name.split(sep).join('/')).filter((name) => /\.jsonc?$/.test(name));
  const stray = files.sort().find((name) => !name.endsWith('.settings.json') || !existsSync(join(specs, name.replace(/\.settings\.json$/, '.e2e.ts'))));
  if (stray === undefined) return null;
  return new VerifyFailure('USAGE', `specs/${stray} is not the settings file of a spec, so no run reads it`, 'name a settings file after its spec file, with .settings.json in place of .e2e.ts, or delete it');
}

export function declaredIn(text: SpecText, specPath: string): InstanceSettings | null {
  const file = settingsFileOf(specPath);
  if (text.declaration === null) return null;
  const fail: (why: string) => never = (why) => {
    throw new VerifyFailure('USAGE', `${file}: ${why}`, `write the settings of ${specPath} as one JSON object, as in \`${FORM}\``);
  };
  let declared: Json;
  try {
    declared = JSON.parse(text.declaration) as Json;
  } catch (error) {
    return fail(`it is not JSON (${(error as Error).message})`);
  }
  if (!isObject(declared)) return fail('it is not a JSON object');
  const extra = Object.keys(declared).filter((name) => name !== 'config' && name !== 'environment');
  if (extra.length > 0) fail(`it has ${extra.join(', ')}, and only config and environment are read`);
  const { config, environment } = declared;
  if (!isObject(config) || Object.keys(config).length === 0) return fail('it needs a config object with the Platform API settings to change');
  if (!isObject(environment) || Object.keys(environment).length === 0) {
    return fail('it needs an environment object with at least one leaf of the instance\'s public environment that shows the change');
  }
  for (const [leaf, value] of Object.entries(environment)) {
    const scalar = (item: Json): boolean => typeof item !== 'object' || item === null;
    if (!(scalar(value) || (Array.isArray(value) && value.every(scalar)))) fail(`environment leaf ${leaf} is an object; write each leaf by its full dotted path, as in "user_settings.sign_up.mfa.required": true`);
  }
  return { config, environment };
}

const where = (askedBy: string | null): string => (askedBy === null ? 'the declaration' : askedBy);

const KEYS_LISTED = 12;
const listed = (keys: readonly string[]): string => `${keys.slice(0, KEYS_LISTED).join(', ')}${keys.length > KEYS_LISTED ? `, and ${keys.length - KEYS_LISTED} more` : ''}`;

function unpinned(leaf: string, value: Json, askedBy: string | null): VerifyFailure {
  const segments = leaf.split('.');
  let found: Json = standard.config;
  let depth = 0;
  while (depth < segments.length && isObject(found) && Object.hasOwn(found, segments[depth]!)) {
    found = found[segments[depth]!]!;
    depth += 1;
  }
  if (depth === segments.length && isObject(found)) {
    return new VerifyFailure(
      'INSTANCE_MISCONFIGURED',
      `${where(askedBy)} declares ${leaf} as ${JSON.stringify(value)}, and the standard file has an object there`,
      `declare the keys of \`${leaf}\` to change, each by its own name; the standard file has ${listed(Object.keys(found))} there`,
    );
  }
  const beside = isObject(found) ? `the standard file has ${listed(Object.keys(found))} ${depth === 0 ? 'at the top of `config`' : `under \`${segments.slice(0, depth).join('.')}\``}; ` : '';
  return new VerifyFailure(
    'INSTANCE_MISCONFIGURED',
    `${where(askedBy)} declares ${leaf}, and the standard file has no value to return it to`,
    `check the spelling against Clerk's Platform API config; ${beside}add the standard value of \`${leaf}\` to \`config\` in ${STANDARD_FILE}; a setting the Platform API config has no key for cannot be declared`,
  );
}

export function settingsOf(declared: InstanceSettings | null, askedBy: string | null): Settings {
  if (declared === null) return STANDARD;
  const pinned = configLeaves(standard.config);
  const leaves = configLeaves(declared.config);
  for (const [leaf, value] of Object.entries(leaves)) {
    if (!Object.hasOwn(pinned, leaf)) throw unpinned(leaf, value, askedBy);
  }
  const body = merge(standard.config, declared.config);
  if (canonical(body) === canonical(standard.config)) {
    throw new VerifyFailure('USAGE', `${where(askedBy)} declares only standard values (${Object.keys(leaves).join(', ')})`, `delete ${askedBy === null ? 'the settings file' : settingsFileOf(askedBy)}; a spec with none runs on the standard settings`);
  }
  for (const [leaf, value] of Object.entries(declared.environment)) {
    if (sameLeaf(standard.environment[leaf], value)) {
      throw new VerifyFailure(
        'USAGE',
        `${where(askedBy)} expects ${leaf} to be ${JSON.stringify(value)}, which is its standard value, so it cannot show that the change took effect`,
        'declare a leaf the setting changes, with the value it changes to',
      );
    }
  }
  const label = Object.entries(leaves).map(([leaf, value]) => `${leaf}=${JSON.stringify(value)}`).join(', ');
  return { key: keyOf(body), label, declared, askedBy };
}

export function configFor(settings: Settings): JsonObject {
  return settings.declared === null ? standard.config : merge(standard.config, settings.declared.config);
}

export function expectedEnvironment(settings: Settings): Leaves {
  const declared = Object.fromEntries(Object.entries(settings.declared?.environment ?? {}).map(([leaf, value]) => [leaf, Array.isArray(value) ? value.map(String).sort() : value]));
  return { ...standard.environment, ...declared };
}

export function planGroups(specs: readonly ({ readonly spec: SpecRef } & SpecText)[], applied: string | null): readonly SettingsGroup[] {
  const groups = new Map<string, { settings: Settings; specs: PlannedSpec[]; leafFrom: Map<string, string> }>();
  for (const { spec, ...text } of specs) {
    const settings = settingsOf(declaredIn(text, spec.path), spec.path);
    const planned: PlannedSpec = { ...spec, sourceHash: sourceHash(text) };
    const group = groups.get(settings.key);
    if (group === undefined) {
      groups.set(settings.key, { settings, specs: [planned], leafFrom: new Map(Object.keys(settings.declared?.environment ?? {}).map((leaf) => [leaf, spec.path])) });
      continue;
    }
    group.specs.push(planned);
    if (settings.declared === null || group.settings.declared === null) continue;
    const environment: Record<string, Json> = { ...group.settings.declared.environment };
    for (const [leaf, value] of Object.entries(settings.declared.environment)) {
      const first = group.leafFrom.get(leaf);
      if (first !== undefined && !sameLeaf(environment[leaf], value)) {
        throw new VerifyFailure(
          'USAGE',
          `${first} and ${spec.path} declare the same config and expect different values of ${leaf} (${JSON.stringify(environment[leaf])} and ${JSON.stringify(value)})`,
          'one config shows one environment: make the two declarations expect the same value',
        );
      }
      if (first === undefined) group.leafFrom.set(leaf, spec.path);
      environment[leaf] = value;
    }
    group.settings = { ...group.settings, declared: { config: group.settings.declared.config, environment } };
  }
  const ordered = [...groups.values()].map(({ settings, specs: files }): SettingsGroup => ({ settings, specs: files }));
  const rank = (group: SettingsGroup): number => (group.settings.key === applied ? 0 : group.settings.key === STANDARD.key ? 2 : 1);
  return ordered.map((group, index) => ({ group, index })).sort((a, b) => rank(a.group) - rank(b.group) || a.index - b.index).map(({ group }) => group);
}
