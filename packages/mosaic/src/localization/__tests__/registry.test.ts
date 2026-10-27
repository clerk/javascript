import { describe, expect, it } from 'vitest';

import { mosaicMessages } from '../registry';

const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;
const ID_KEYED_MAPS = [
  'errors',
  'roles',
  'userProfile.mfa.methods',
  'userProfile.mfa.addDialog.methods',
  'apiKeys.expirationOptions',
];

describe('mosaicMessages', () => {
  it('names every key segment in camelCase', () => {
    const malformed = keyPaths(mosaicMessages).filter(path => {
      const named = namedSegments(path);
      return path.length < 2 || named.some(segment => !CAMEL_CASE.test(segment));
    });

    expect(malformed.map(path => path.join('.'))).toEqual([]);
  });
});

function namedSegments(path: string[]): string[] {
  const joined = path.join('.');
  const map = ID_KEYED_MAPS.find(prefix => joined.startsWith(`${prefix}.`));
  return map === undefined ? path : map.split('.');
}

function keyPaths(value: unknown, prefix: string[] = []): string[][] {
  if (typeof value !== 'object' || value === null || isPluralForms(value)) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, [...prefix, key]));
}

function isPluralForms(value: object): boolean {
  return 'other' in value && typeof Reflect.get(value, 'other') === 'string';
}
