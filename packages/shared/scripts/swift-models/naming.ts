const SWIFT_KEYWORDS = new Set([
  'Any',
  'Protocol',
  'Self',
  'Type',
  'as',
  'associatedtype',
  'break',
  'case',
  'catch',
  'class',
  'continue',
  'default',
  'defer',
  'deinit',
  'do',
  'else',
  'enum',
  'extension',
  'fallthrough',
  'false',
  'fileprivate',
  'for',
  'func',
  'guard',
  'if',
  'import',
  'in',
  'init',
  'inout',
  'internal',
  'is',
  'let',
  'nil',
  'open',
  'operator',
  'precedencegroup',
  'private',
  'protocol',
  'public',
  'repeat',
  'return',
  'self',
  'static',
  'struct',
  'subscript',
  'super',
  'switch',
  'throw',
  'throws',
  'true',
  'try',
  'typealias',
  'var',
  'where',
  'while',
]);

export function methodOwnerName(tsName: string): string {
  if (tsName === 'HeadlessBrowserClerk' || tsName === 'Clerk') {
    return 'Clerk';
  }
  if (tsName === 'BillingNamespace') {
    return 'Billing';
  }
  return tsName.replace(/Resource$/, '');
}

export function stripJsonSuffix(name: string): string {
  return name.endsWith('JSON') ? name.slice(0, -4) : name;
}

export function snakeToCamel(value: string): string {
  return value.replace(/[_-]([a-zA-Z0-9])/g, (_, char: string) => char.toUpperCase());
}

export function pascalCase(value: string): string {
  const camel = snakeToCamel(value);
  return camel ? camel[0].toUpperCase() + camel.slice(1) : value;
}

export function swiftIdent(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, '');
  const base = cleaned.length === 0 ? 'value' : /^[0-9]/.test(cleaned) ? `n${cleaned}` : cleaned;
  return SWIFT_KEYWORDS.has(base) ? `\`${base}\`` : base;
}

export function swiftCaseName(raw: string): string {
  const camel = snakeToCamel(raw.replace(/[^a-zA-Z0-9]+/g, '_'));
  const ident = camel.length === 0 ? 'value' : camel[0].toLowerCase() + camel.slice(1);
  if (ident === 'unknown') {
    return 'unknownValue';
  }
  return swiftIdent(ident);
}

export const SWIFT_UI_COLLISIONS: Record<string, string> = {
  Environment: 'ClerkEnvironment',
  Image: 'ClerkImage',
};

const SWIFT_FILE_ALIASES: Record<string, string> = {
  ClerkEnvironment: 'Environment.swift',
};

export function emitFilename(decl: { name: string }): string {
  return SWIFT_FILE_ALIASES[decl.name] ?? `${decl.name}.swift`;
}

export function escapeSwiftString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
