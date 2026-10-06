import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VerifyFailure, type InstanceSettings, type Json, type SpecRef } from '../types.ts';
import type { Leaves } from './definitions.ts';

type JsonObject = { readonly [key: string]: Json };

export interface StandardFile {
  readonly config: JsonObject;
  readonly environment: Leaves;
  readonly defaults: Leaves;
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

export const STANDARD_ENVIRONMENT_KEY = keyOf({ environment: standard.environment, defaults: standard.defaults });

export const sourceHash = (source: string): string => createHash('sha256').update(source).digest('hex');

const FORM = "export const instanceSettings: InstanceSettings = { config: { auth_multi_factor: { required_for_sign_up: true } }, environment: { 'user_settings.sign_up.mfa.required': true } };";

const unreadable = (specPath: string, why: string): VerifyFailure =>
  new VerifyFailure(
    'USAGE',
    `${specPath}: ${why}`,
    `write the settings once, as one plain literal: \`${FORM}\`. The tool reads it from the file's text and never runs the file, so no variable, spread, call, computed key, or \${} is allowed, and the word instanceSettings may appear nowhere else in the file`,
  );

const ESCAPES: Readonly<Record<string, string>> = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '/': '/', '\\': '\\', "'": "'", '"': '"', '`': '`' };
const MAX_NESTING = 32;

function hiddenAt(source: string, index: number): string | null {
  const substitutions: number[] = [];
  let inTemplate = false;
  let at = 0;
  while (at < index) {
    const char = source[at]!;
    if (inTemplate) {
      if (char === '\\') at += 2;
      else if (char === '$' && source[at + 1] === '{') {
        substitutions.push(0);
        inTemplate = false;
        at += 2;
      } else {
        inTemplate = char !== '`';
        at += 1;
      }
    } else if (char === '/') {
      const line = source[at + 1] === '/';
      if (!line && source[at + 1] !== '*') return 'a `/` before its instanceSettings export may start a regular expression, so the tool cannot tell whether the export is code; move the export above that line';
      const end = source.indexOf(line ? '\n' : '*/', at + 2);
      if (end === -1 || end >= index) return 'its instanceSettings export is inside a comment';
      at = end + (line ? 1 : 2);
    } else if (char === "'" || char === '"') {
      at += 1;
      while (source[at] !== char) {
        if (at >= index) return 'its instanceSettings export is inside a string';
        if (source[at] === '\n') return 'a string before its instanceSettings export never ends on its line';
        at += source[at] === '\\' ? 2 : 1;
      }
      at += 1;
    } else {
      const open = substitutions.length - 1;
      if (char === '`') inTemplate = true;
      else if (char === '{' && open >= 0) substitutions[open]! += 1;
      else if (char === '}' && open >= 0) {
        if (substitutions[open] === 0) {
          substitutions.pop();
          inTemplate = true;
        } else substitutions[open]! -= 1;
      }
      at += 1;
    }
  }
  return inTemplate || substitutions.length > 0 ? 'its instanceSettings export is inside a template string' : null;
}

function parseLiteral(source: string, start: number, fail: (why: string) => never): { readonly value: Json; readonly end: number; readonly next: number } {
  let at = start;

  const skip = (): void => {
    for (;;) {
      if (/\s/.test(source[at] ?? '')) at += 1;
      else if (source.startsWith('//', at)) {
        const end = source.indexOf('\n', at);
        at = end === -1 ? source.length : end;
      } else if (source.startsWith('/*', at)) {
        const end = source.indexOf('*/', at + 2);
        if (end === -1) fail('a comment inside instanceSettings never ends');
        at = end + 2;
      } else return;
    }
  };

  const text = (): string => {
    const quote = source[at]!;
    at += 1;
    let out = '';
    for (;;) {
      const char = source[at];
      if (char === undefined || (char === '\n' && quote !== '`')) fail('a string inside instanceSettings never ends');
      at += 1;
      if (char === quote) return out;
      if (quote === '`' && char === '$' && source[at] === '{') fail('instanceSettings holds a template string with ${}, which is not a plain value');
      if (char !== '\\') {
        out += char;
        continue;
      }
      const escaped = source[at];
      if (escaped === undefined) fail('a string inside instanceSettings never ends');
      at += 1;
      if (escaped === 'u' || escaped === 'x') {
        const braced = escaped === 'u' && source[at] === '{';
        const close = braced ? source.indexOf('}', at) : at + (escaped === 'u' ? 4 : 2);
        const hex = source.slice(braced ? at + 1 : at, close);
        if (close === -1 || !/^[0-9a-fA-F]+$/.test(hex) || Number.parseInt(hex, 16) > 0x10ffff) fail('a string inside instanceSettings has an escape that cannot be read');
        out += String.fromCodePoint(Number.parseInt(hex, 16));
        at = braced ? close + 1 : close;
      } else {
        const plain = ESCAPES[escaped];
        if (plain === undefined) fail(`a string inside instanceSettings has an escape this tool does not read (${JSON.stringify(`\\${escaped}`)}); it reads \\n \\t \\r \\b \\f \\/ \\\\ \\' \\" \\\` \\uXXXX \\xXX`);
        out += plain;
      }
    }
  };

  const key = (): string => {
    const char = source[at] ?? '';
    if (char === "'" || char === '"') return text();
    if (char === '[') fail('instanceSettings has a computed key; write the key itself');
    if (source.startsWith('...', at)) fail('instanceSettings has a spread; write every setting out');
    const name = /^[A-Za-z_$][\w$]*/.exec(source.slice(at, at + 200))?.[0];
    if (name === undefined) fail(`instanceSettings has something that is not a key at "${source.slice(at, at + 20).split('\n')[0]}"`);
    at += name.length;
    return name;
  };

  const value = (depth: number): Json => {
    skip();
    const char = source[at] ?? '';
    if ((char === '{' || char === '[') && depth > MAX_NESTING) fail(`instanceSettings nests more than ${MAX_NESTING} levels deep`);
    if (char === '{') {
      at += 1;
      const out: Record<string, Json> = {};
      for (;;) {
        skip();
        if (source[at] === '}') break;
        const name = key();
        if (name === '__proto__') fail('instanceSettings has a __proto__ key');
        if (Object.hasOwn(out, name)) fail(`instanceSettings sets ${name} twice`);
        skip();
        if (source[at] !== ':') fail(`instanceSettings gives ${name} no value of its own; write \`${name}: <value>\``);
        at += 1;
        out[name] = value(depth + 1);
        skip();
        if (source[at] === ',') at += 1;
        else if (source[at] !== '}') fail(`instanceSettings is not a plain literal after ${name}`);
      }
      at += 1;
      return out;
    }
    if (char === '[') {
      at += 1;
      const out: Json[] = [];
      for (;;) {
        skip();
        if (source[at] === ']') break;
        if (source.startsWith('...', at)) fail('instanceSettings has a spread; write every value out');
        out.push(value(depth + 1));
        skip();
        if (source[at] === ',') at += 1;
        else if (source[at] !== ']') fail('instanceSettings holds a list that is not a plain literal');
      }
      at += 1;
      return out;
    }
    if (char === "'" || char === '"' || char === '`') return text();
    const number = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?(?![\w$.])/.exec(source.slice(at, at + 64))?.[0];
    if (number !== undefined) {
      if (!Number.isFinite(Number(number))) fail(`instanceSettings holds ${number}, which is not a finite number`);
      at += number.length;
      return Number(number);
    }
    const word = /^(?:true|false|null)(?![\w$])/.exec(source.slice(at, at + 6))?.[0];
    if (word !== undefined) {
      at += word.length;
      return word === 'null' ? null : word === 'true';
    }
    return fail(`instanceSettings holds something that is not a plain value at "${source.slice(at, at + 24).split('\n')[0]}" (a variable, a shared constant, or a call)`);
  };

  const parsed = value(1);
  let end = at;
  for (;;) {
    skip();
    const suffix = /^(?:as\s+const|satisfies\s+[A-Za-z_$][\w$.]*)(?![\w$])/.exec(source.slice(at, at + 200))?.[0];
    if (suffix === undefined) break;
    at += suffix.length;
    end = at;
  }
  return { value: parsed, end, next: at };
}

const EXPORT = /^export\s+const\s+instanceSettings\s*(?::\s*[A-Za-z_$][\w$.]*\s*)?=/gm;
const CONTINUES = /^(?:[([.`+\-*/%&|^<>=?,]|!=|(?:in|instanceof|as|satisfies)(?![\w$]))/;

export function declaredIn(source: string, specPath: string): InstanceSettings | null {
  const mentions = source.match(/(?<![\w$])instanceSettings(?![\w$])/g)?.length ?? 0;
  if (mentions === 0) return null;
  const fail: (why: string) => never = (why) => {
    throw unreadable(specPath, why);
  };
  const exports = [...source.matchAll(EXPORT)];
  if (exports.length > 1) fail('it exports instanceSettings more than once');
  const found = exports[0];
  if (found === undefined) return fail('it mentions instanceSettings, and has no line that starts with `export const instanceSettings =` followed by the literal');
  if (mentions > 1) fail('it mentions instanceSettings in more than one place (a comment, a string, a second export, or a use of the value)');
  const hidden = hiddenAt(source, found.index);
  if (hidden !== null) fail(hidden);

  const literal = parseLiteral(source, found.index + found[0].length, fail);
  const after = source.slice(literal.end);
  const rest = after.replace(/^[ \t]*;?[ \t]*(?:\/\/[^\n]*)?/, '');
  if (rest !== '' && !/^\r?\n/.test(rest)) fail('something follows the instanceSettings literal on the same line; end it with `;`');
  if (!/^[ \t]*;/.test(after) && CONTINUES.test(source.slice(literal.next, literal.next + 16))) fail('the line after the instanceSettings literal continues the expression, so JavaScript reads it as part of the value; end the literal with `;`');

  const declared = literal.value;
  if (!isObject(declared)) return fail('instanceSettings is not an object');
  const extra = Object.keys(declared).filter((name) => name !== 'config' && name !== 'environment');
  if (extra.length > 0) fail(`instanceSettings has ${extra.join(', ')}, and only config and environment are read`);
  const { config, environment } = declared;
  if (!isObject(config) || Object.keys(config).length === 0) return fail('instanceSettings needs a config object with the Platform API settings to change');
  if (!isObject(environment) || Object.keys(environment).length === 0) {
    return fail('instanceSettings needs an environment object with at least one leaf of the instance\'s public environment that shows the change');
  }
  for (const [leaf, value] of Object.entries(environment)) {
    const scalar = (item: Json): boolean => typeof item !== 'object' || item === null;
    if (!(scalar(value) || (Array.isArray(value) && value.every(scalar)))) fail(`environment leaf ${leaf} is an object; write each leaf by its full dotted path, as in 'user_settings.sign_up.mfa.required': true`);
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
    `check the spelling against Clerk's Platform API config; ${beside}add the standard value of \`${leaf}\` to \`config\` in ${STANDARD_FILE} (shared core: run \`node src/core/manifest.ts --write\` and copy \`src/core\` to the other repos); a setting the Platform API config has no key for cannot be declared`,
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
    throw new VerifyFailure('USAGE', `${where(askedBy)} declares only standard values (${Object.keys(leaves).join(', ')})`, 'remove the instanceSettings export; a spec with none runs on the standard instance');
  }
  const known = { ...standard.defaults, ...standard.environment };
  for (const [leaf, value] of Object.entries(declared.environment)) {
    if (!Object.hasOwn(known, leaf)) {
      throw new VerifyFailure(
        'USAGE',
        `${where(askedBy)} expects the environment leaf ${leaf}, which ${STANDARD_FILE} does not list`,
        'use a leaf of the instance\'s public /v1/environment by its full dotted path; a failed change lists the leaves a setting moves',
      );
    }
    if (sameLeaf(known[leaf], value)) {
      throw new VerifyFailure(
        'USAGE',
        `${where(askedBy)} expects ${leaf} to be ${JSON.stringify(value)}, which is its standard value, so it cannot show that the change took effect`,
        'declare a leaf the setting changes; a failed change lists the leaves it moved',
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
  return { ...standard.defaults, ...standard.environment, ...declared };
}


export function planGroups(specs: readonly { readonly spec: SpecRef; readonly source: string }[], applied: string | null): readonly SettingsGroup[] {
  const groups = new Map<string, { settings: Settings; specs: PlannedSpec[]; leafFrom: Map<string, string> }>();
  for (const { spec, source } of specs) {
    const settings = settingsOf(declaredIn(source, spec.path), spec.path);
    const planned: PlannedSpec = { ...spec, sourceHash: sourceHash(source) };
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
