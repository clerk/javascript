import { describe, expect, it } from 'vitest';

import { filterUndefinedValues } from '../filterUndefinedValues';

describe('filterUndefinedValues', () => {
  it('returns non-objects as-is', () => {
    expect(filterUndefinedValues(null)).toBe(null);
    expect(filterUndefinedValues(undefined)).toBe(undefined);
    expect(filterUndefinedValues('string')).toBe('string');
    expect(filterUndefinedValues(42)).toBe(42);
    expect(filterUndefinedValues(true)).toBe(true);
    expect(filterUndefinedValues(false)).toBe(false);
  });

  it('returns arrays as-is without filtering', () => {
    const array = [1, undefined, 'test', null];
    expect(filterUndefinedValues(array)).toBe(array);
    expect(filterUndefinedValues(array)).toEqual([1, undefined, 'test', null]);
  });

  it('returns FormData as-is', () => {
    const formData = new FormData();
    formData.append('key', 'value');
    expect(filterUndefinedValues(formData)).toBe(formData);
  });

  it('filters out undefined values from first level of object', () => {
    const input = {
      defined: 'value',
      undefinedValue: undefined,
      nullValue: null,
      falseValue: false,
      zeroValue: 0,
      emptyString: '',
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      defined: 'value',
      nullValue: null,
      falseValue: false,
      zeroValue: 0,
      emptyString: '',
    });

    // Should not have the undefined property
    expect('undefinedValue' in result).toBe(false);
  });

  it('preserves all falsy values except undefined', () => {
    const input = {
      nullValue: null,
      falseValue: false,
      zeroValue: 0,
      emptyString: '',
      undefinedValue: undefined,
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      nullValue: null,
      falseValue: false,
      zeroValue: 0,
      emptyString: '',
    });
  });

  it('does not perform deep filtering - preserves nested undefined values', () => {
    const input = {
      topLevel: 'value',
      topLevelUndefined: undefined,
      nested: {
        nestedDefined: 'nested value',
        nestedUndefined: undefined,
      },
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      topLevel: 'value',
      nested: {
        nestedDefined: 'nested value',
        nestedUndefined: undefined, // This should remain
      },
    });

    // Top level undefined should be removed
    expect('topLevelUndefined' in result).toBe(false);
    // Nested undefined should remain
    expect('nestedUndefined' in result.nested).toBe(true);
  });

  it('handles empty objects', () => {
    expect(filterUndefinedValues({})).toEqual({});
  });

  it('handles objects with only undefined values', () => {
    const input = {
      a: undefined,
      b: undefined,
      c: undefined,
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('preserves object with mixed types including functions and symbols', () => {
    const sym = Symbol('test');
    const func = () => 'test';

    const input = {
      string: 'value',
      number: 42,
      boolean: true,
      symbol: sym,
      function: func,
      undefinedValue: undefined,
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      string: 'value',
      number: 42,
      boolean: true,
      symbol: sym,
      function: func,
    });
  });

  it('creates a new object reference', () => {
    const input = { a: 1, b: undefined };
    const result = filterUndefinedValues(input);

    expect(result).not.toBe(input);
    expect(result).toEqual({ a: 1 });
  });
});
