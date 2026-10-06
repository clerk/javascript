import type { Json } from '../types.ts';

export type Leaves = Readonly<Record<string, Json>>;

const isObject = (value: Json | undefined): value is { readonly [key: string]: Json } => typeof value === 'object' && value !== null && !Array.isArray(value);

const NOT_COMPARED = [/(^|\.)id$/, /(^|\.)object$/, /_url$/, /^display_config\.(application_name|theme\.|clerk_js_version|support_email|branded|logo_image|favicon_image|captcha_public_key)/];

export function flattenEnvironment(value: Json, path = '', out: Record<string, Json> = {}): Leaves {
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item !== 'object' || item === null)) out[path] = value.map(String).sort();
    else value.forEach((item, index) => flattenEnvironment(item, `${path}[${index}]`, out));
  } else if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) flattenEnvironment(child, path === '' ? key : `${path}.${key}`, out);
  } else {
    out[path] = value;
  }
  return path === '' ? Object.fromEntries(Object.entries(out).filter(([leaf]) => !NOT_COMPARED.some((pattern) => pattern.test(leaf)))) : out;
}

export interface EnvironmentDifference {
  readonly path: string;
  readonly expected: Json;
  readonly found: Json | undefined;
}

export interface EnvironmentComparison {
  readonly compared: number;
  readonly differing: readonly EnvironmentDifference[];
  readonly drifted: readonly EnvironmentDifference[];
  readonly unknown: readonly string[];
}

export function compareEnvironment(definition: { readonly environment: Leaves; readonly defaults: Leaves }, live: Json): EnvironmentComparison {
  const found = flattenEnvironment(live);
  const differences = (expected: Leaves): EnvironmentDifference[] =>
    Object.entries(expected).flatMap(([path, want]) => (JSON.stringify(found[path]) === JSON.stringify(want) ? [] : [{ path, expected: want, found: found[path] }]));
  return {
    compared: Object.keys(definition.environment).length,
    differing: differences(definition.environment),
    drifted: differences(definition.defaults),
    unknown: Object.keys(found).filter((path) => !(path in definition.environment) && !(path in definition.defaults)).sort(),
  };
}

export const describeDifference = (d: EnvironmentDifference, expectedBy = 'the file says'): string => `${d.path} is ${d.found === undefined ? 'absent' : JSON.stringify(d.found)}, and ${expectedBy} ${JSON.stringify(d.expected)}`;
