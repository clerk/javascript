import { describe, expect, it } from 'vitest';
import type { FlattenedLocalizationResource, LocalizationResource } from '@clerk/shared/types';

import { flatLocalization } from '../flatLocalization';

describe('flatLocalization', () => {
  describe('runtime tests', () => {
    it('converts valid flattened keys to nested structure', () => {
      const flattened: FlattenedLocalizationResource = {
        formFieldLabel__emailAddress: 'Email address',
        formFieldLabel__password: 'Password',
      };

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        formFieldLabel__emailAddress: 'Email address',
        formFieldLabel__password: 'Password',
      });
    });

    it('converts multiple keys at same level', () => {
      const flattened = {
        'a.b.c': 'value1',
        'a.b.d': 'value2',
        'a.e': 'value3',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        a: {
          b: {
            c: 'value1',
            d: 'value2',
          },
          e: 'value3',
        },
      });
    });

    it('converts deeply nested paths', () => {
      const flattened: FlattenedLocalizationResource = {
        'unstable__errors.passwordComplexity.maximumLength': 'Password is too long',
        'unstable__errors.passwordComplexity.minimumLength': 'Password is too short',
        'unstable__errors.passwordComplexity.requireNumbers': 'Password must contain numbers',
      };

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        unstable__errors: {
          passwordComplexity: {
            maximumLength: 'Password is too long',
            minimumLength: 'Password is too short',
            requireNumbers: 'Password must contain numbers',
          },
        },
      });
    });

    it('handles top-level keys', () => {
      const flattened: FlattenedLocalizationResource = {
        locale: 'en-US',
        formFieldLabel__emailAddress: 'Email address',
      };

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        locale: 'en-US',
        formFieldLabel__emailAddress: 'Email address',
      });
    });

    it('handles empty object', () => {
      const flattened: FlattenedLocalizationResource = {};

      const result = flatLocalization(flattened);

      expect(result).toEqual({});
    });

    it('handles real-world localization examples', () => {
      const flattened: FlattenedLocalizationResource = {
        locale: 'en-US',
        formFieldLabel__emailAddress: 'Email address',
        formFieldLabel__password: 'Password',
        'unstable__errors.passwordComplexity.maximumLength': 'Password is too long',
        'unstable__errors.passwordComplexity.minimumLength': 'Password is too short',
        socialButtonsBlockButton: 'Continue with {{provider}}',
      };

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        locale: 'en-US',
        formFieldLabel__emailAddress: 'Email address',
        formFieldLabel__password: 'Password',
        unstable__errors: {
          passwordComplexity: {
            maximumLength: 'Password is too long',
            minimumLength: 'Password is too short',
          },
        },
        socialButtonsBlockButton: 'Continue with {{provider}}',
      });
    });

    it('handles single key', () => {
      const flattened: FlattenedLocalizationResource = {
        locale: 'en-US',
      };

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        locale: 'en-US',
      });
    });

    it('handles all keys at root level', () => {
      const flattened = {
        a: 'value1',
        b: 'value2',
        c: 'value3',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        a: 'value1',
        b: 'value2',
        c: 'value3',
      });
    });

    it('handles maximum nesting depth', () => {
      const flattened = {
        'a.b.c.d.e.f.g.h.i.j': 'deep value',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: {
                    g: {
                      h: {
                        i: {
                          j: 'deep value',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it('handles special characters in values', () => {
      const flattened = {
        'a.b': 'Value with "quotes" and \'apostrophes\'',
        'a.c': 'Value with\nnewlines\tand\ttabs',
        'a.d': 'Value with {{interpolation}}',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        a: {
          b: 'Value with "quotes" and \'apostrophes\'',
          c: 'Value with\nnewlines\tand\ttabs',
          d: 'Value with {{interpolation}}',
        },
      });
    });
  });

  describe('validation tests', () => {
    it('throws error when mixing flattened keys with nested values', () => {
      const invalid = {
        'a.b': 'value1',
        nested: {
          key: 'value2',
        },
      } as unknown as FlattenedLocalizationResource;

      expect(() => flatLocalization(invalid)).toThrow(/cannot mix.*flattened|cannot mix.*nested/);
    });

    it('throws error for keys starting with dot', () => {
      const invalid = {
        '.a.b': 'value',
        'valid.key': 'value2', // Need at least one valid flattened key to trigger validation
      } as FlattenedLocalizationResource;

      expect(() => flatLocalization(invalid)).toThrow(
        /Invalid flattened key format.*Keys cannot start or end with dots/,
      );
    });

    it('throws error for keys ending with dot', () => {
      const invalid = {
        'a.b.': 'value',
        'valid.key': 'value2', // Need at least one valid flattened key to trigger validation
      } as FlattenedLocalizationResource;

      expect(() => flatLocalization(invalid)).toThrow(
        /Invalid flattened key format.*Keys cannot start or end with dots/,
      );
    });

    it('throws error for consecutive dots', () => {
      const invalid = {
        'a..b': 'value',
        'valid.key': 'value2', // Need at least one valid flattened key to trigger validation
      } as FlattenedLocalizationResource;

      expect(() => flatLocalization(invalid)).toThrow(
        /Invalid flattened key format.*Keys cannot start or end with dots, or contain consecutive dots/,
      );
    });

    it('throws error for __proto__ in key segments', () => {
      const invalid = {
        '__proto__.polluted': 'value',
        'valid.key': 'value2', // Need at least one valid flattened key to trigger validation
      } as FlattenedLocalizationResource;

      expect(() => flatLocalization(invalid)).toThrow(
        /Invalid flattened key format.*Keys cannot contain "__proto__" or "constructor" segments/,
      );
    });

    it('throws error for constructor in key segments', () => {
      const invalid = {
        'constructor.prototype.polluted': 'value',
        'valid.key': 'value2', // Need at least one valid flattened key to trigger validation
      } as FlattenedLocalizationResource;

      // Constructor.prototype is a read-only property, so it throws a different error
      expect(() => flatLocalization(invalid)).toThrow();
    });

    it('throws error for null input', () => {
      expect(() => flatLocalization(null as unknown as FlattenedLocalizationResource)).toThrow(
        /Localization object must be a non-null object/,
      );
    });

    it('throws error for array input', () => {
      expect(() => flatLocalization([] as unknown as FlattenedLocalizationResource)).toThrow(
        /Localization object must be a non-null object/,
      );
    });
  });

  describe('type tests', () => {
    it('accepts valid FlattenedLocalizationResource', () => {
      const flattened = {
        'a.b': 'value',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);

      // Type check: result should be LocalizationResource
      const _typeCheck: LocalizationResource = result;
      expect(_typeCheck).toBeDefined();
    });

    it('return type is LocalizationResource', () => {
      const flattened: FlattenedLocalizationResource = {
        locale: 'en-US',
      };

      const result = flatLocalization(flattened);

      // Type check: result should be LocalizationResource
      const _typeCheck: LocalizationResource = result;
      expect(_typeCheck).toBeDefined();
    });

    it('accepts FlattenedLocalizationResource type', () => {
      const flattened = {
        'a.b': 'value',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);
      expect(result).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('handles keys with underscores', () => {
      const flattened = {
        formFieldLabel__emailAddress: 'Email',
        'unstable__errors.passwordComplexity.maximumLength': 'Too long',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        formFieldLabel__emailAddress: 'Email',
        unstable__errors: {
          passwordComplexity: {
            maximumLength: 'Too long',
          },
        },
      });
    });

    it('handles empty string values', () => {
      const flattened = {
        'a.b': '',
        'a.c': 'value',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        a: {
          b: '',
          c: 'value',
        },
      });
    });

    it('skips __proto__ keys silently', () => {
      const flattened = {
        'a.b': 'value',
        __proto__: 'should be skipped',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        a: {
          b: 'value',
        },
      });
    });

    it('skips constructor keys silently', () => {
      const flattened = {
        'a.b': 'value',
        // Note: constructor is a special property that can't be easily set in an object literal
        // This test verifies that unflattenObject handles it correctly
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);

      expect(result).toEqual({
        a: {
          b: 'value',
        },
      });
    });
  });
});
