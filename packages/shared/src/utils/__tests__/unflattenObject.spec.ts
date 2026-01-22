import { describe, expect, test } from 'vitest';

import { isFlattenedObject, isNestedObject, unflattenObject, validateLocalizationFormat } from '../unflattenObject';

describe('isFlattenedObject', () => {
  test('returns true for objects with dot-notation keys', () => {
    expect(isFlattenedObject({ 'a.b.c': 'value' })).toBe(true);
  });

  test('returns false for objects without dot-notation keys', () => {
    expect(isFlattenedObject({ a: { b: 'value' } })).toBe(false);
  });

  test('returns false for empty objects', () => {
    expect(isFlattenedObject({})).toBe(false);
  });

  test('returns true for mixed objects with at least one dot key', () => {
    expect(isFlattenedObject({ simple: 'value', 'a.b': 'other' })).toBe(true);
  });
});

describe('isNestedObject', () => {
  test('returns true for objects with nested object values', () => {
    expect(isNestedObject({ a: { b: 'value' } })).toBe(true);
  });

  test('returns false for flat objects with primitive values', () => {
    expect(isNestedObject({ 'a.b': 'value' })).toBe(false);
  });

  test('returns false for empty objects', () => {
    expect(isNestedObject({})).toBe(false);
  });

  test('returns false for objects with only primitive values', () => {
    expect(isNestedObject({ a: 'string', b: 123, c: true })).toBe(false);
  });

  test('returns false for objects with array values', () => {
    expect(isNestedObject({ a: [1, 2, 3] })).toBe(false);
  });

  test('returns false for objects with null values', () => {
    expect(isNestedObject({ a: null })).toBe(false);
  });
});

describe('validateLocalizationFormat', () => {
  test('does not throw for pure nested format', () => {
    expect(() => validateLocalizationFormat({ a: { b: 'value' } })).not.toThrow();
  });

  test('does not throw for pure flattened format', () => {
    expect(() => validateLocalizationFormat({ 'a.b': 'value' })).not.toThrow();
  });

  test('throws for mixed format', () => {
    expect(() =>
      validateLocalizationFormat({
        a: { b: 'nested' },
        'c.d': 'flat',
      }),
    ).toThrow('cannot mix nested and flattened formats');
  });

  test('does not throw for empty object', () => {
    expect(() => validateLocalizationFormat({})).not.toThrow();
  });

  test('does not throw for objects with only primitive values (no nesting)', () => {
    expect(() => validateLocalizationFormat({ a: 'string', b: 'other' })).not.toThrow();
  });
});

describe('unflattenObject', () => {
  test('converts flat keys to nested structure', () => {
    const flat = { 'a.b.c': 'value' };
    expect(unflattenObject(flat)).toEqual({ a: { b: { c: 'value' } } });
  });

  test('handles multiple keys at same level', () => {
    const flat = { 'a.b': '1', 'a.c': '2' };
    expect(unflattenObject(flat)).toEqual({ a: { b: '1', c: '2' } });
  });

  test('handles top-level keys without dots', () => {
    const flat = { simple: 'value' };
    expect(unflattenObject(flat)).toEqual({ simple: 'value' });
  });

  test('handles empty object', () => {
    expect(unflattenObject({})).toEqual({});
  });

  test('handles deeply nested paths', () => {
    const flat = { 'a.b.c.d.e': 'deep' };
    expect(unflattenObject(flat)).toEqual({ a: { b: { c: { d: { e: 'deep' } } } } });
  });

  test('handles real-world localization keys', () => {
    const flat = {
      'signIn.start.title': 'Welcome back',
      'signIn.start.subtitle': 'Please sign in to continue',
      'signUp.start.title': 'Create an account',
    };
    expect(unflattenObject(flat)).toEqual({
      signIn: {
        start: {
          title: 'Welcome back',
          subtitle: 'Please sign in to continue',
        },
      },
      signUp: {
        start: {
          title: 'Create an account',
        },
      },
    });
  });

  test('handles mixed simple and nested keys', () => {
    const flat = {
      locale: 'en',
      'signIn.start.title': 'Welcome',
    };
    expect(unflattenObject(flat)).toEqual({
      locale: 'en',
      signIn: {
        start: {
          title: 'Welcome',
        },
      },
    });
  });
});
