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

  describe('conflict detection', () => {
    test('throws error when primitive value blocks nested path', () => {
      const flat = { a: 'x', 'a.b': 'y' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/Localization key conflict/);
      expect(() => unflattenObject(flat)).toThrow(/path 'a'/);
      expect(() => unflattenObject(flat)).toThrow(/cannot set 'a\.b'/);
    });

    test('throws error when nested path blocks primitive value', () => {
      const flat = { 'a.b': 'x', a: 'y' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/Localization key conflict/);
      expect(() => unflattenObject(flat)).toThrow(/path 'a'/);
    });

    test('throws error when nested structure blocks primitive assignment', () => {
      const flat = { 'a.b.c': 'x', 'a.b': 'y' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/Localization key conflict/);
      expect(() => unflattenObject(flat)).toThrow(/path 'a\.b'/);
    });

    test('throws error when primitive value blocks nested structure', () => {
      const flat = { 'a.b': 'x', 'a.b.c': 'y' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/Localization key conflict/);
      expect(() => unflattenObject(flat)).toThrow(/path 'a\.b'/);
    });

    test('throws error for deep nested conflict', () => {
      const flat = { 'a.b.c.d': 'x', 'a.b': 'y' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/Localization key conflict/);
      expect(() => unflattenObject(flat)).toThrow(/path 'a\.b'/);
    });

    test('successfully merges keys at same level (no conflict)', () => {
      const flat = { 'a.b': 'x', 'a.c': 'y' };
      expect(unflattenObject(flat)).toEqual({ a: { b: 'x', c: 'y' } });
    });

    test('throws error when null value blocks nested path', () => {
      const flat = { a: null, 'a.b': 'x' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/Localization key conflict/);
      expect(() => unflattenObject(flat)).toThrow(/path 'a'/);
      expect(() => unflattenObject(flat)).toThrow(/null/);
    });

    test('throws error when array value blocks nested path', () => {
      const flat = { a: [1, 2], 'a.b': 'x' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/Localization key conflict/);
      expect(() => unflattenObject(flat)).toThrow(/path 'a'/);
      expect(() => unflattenObject(flat)).toThrow(/array/);
    });
  });

  describe('edge cases', () => {
    test('throws error for empty string segments (consecutive dots)', () => {
      const flat = { 'a..b': 'value' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/empty segments/);
      expect(() => unflattenObject(flat)).toThrow(/key 'a\.\.b'/);
    });

    test('throws error for leading dot', () => {
      const flat = { '.a': 'value' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/empty segments/);
      expect(() => unflattenObject(flat)).toThrow(/key '\.a'/);
    });

    test('throws error for trailing dot', () => {
      const flat = { 'a.': 'value' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/empty segments/);
      expect(() => unflattenObject(flat)).toThrow(/key 'a\.'/);
    });

    test('throws error for empty key', () => {
      const flat = { '': 'value' };
      expect(() => unflattenObject(flat)).toThrow();
      expect(() => unflattenObject(flat)).toThrow(/empty segments/);
    });
  });
});
