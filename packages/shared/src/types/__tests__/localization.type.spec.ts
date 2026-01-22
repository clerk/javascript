import { describe, expectTypeOf, test } from 'vitest';

import type { FlattenedLocalizationResource, LocalizationInput, LocalizationResource } from '../localization';

describe('FlattenedLocalizationResource', () => {
  test('accepts valid flattened keys', () => {
    const valid: FlattenedLocalizationResource = {
      'signIn.start.title': 'Welcome',
    };
    expectTypeOf(valid).toMatchTypeOf<FlattenedLocalizationResource>();
  });

  test('accepts multiple valid flattened keys', () => {
    const valid: FlattenedLocalizationResource = {
      'signIn.start.title': 'Welcome',
      'signIn.start.subtitle': 'Please sign in',
      'signUp.start.title': 'Create account',
    };
    expectTypeOf(valid).toMatchTypeOf<FlattenedLocalizationResource>();
  });

  test('accepts top-level keys', () => {
    const valid: FlattenedLocalizationResource = {
      locale: 'en-US',
    };
    expectTypeOf(valid).toMatchTypeOf<FlattenedLocalizationResource>();
  });

  test('rejects invalid keys', () => {
    const invalid: FlattenedLocalizationResource = {
      // @ts-expect-error - 'invalid.key' is not a valid localization path
      'invalid.key': 'test',
    };
    void invalid;
  });

  test('rejects nested structure in flattened type', () => {
    // The type error occurs on the value level, not the property declaration
    const invalid: FlattenedLocalizationResource = {
      // @ts-expect-error - Nested objects are not valid in FlattenedLocalizationResource (values must be strings)
      signIn: { start: { title: 'Welcome' } },
    };
    void invalid;
  });
});

describe('LocalizationInput', () => {
  test('accepts nested format', () => {
    const nested: LocalizationInput = {
      signIn: { start: { title: 'Welcome' } },
    };
    expectTypeOf(nested).toMatchTypeOf<LocalizationInput>();
  });

  test('accepts flattened format', () => {
    const flat: LocalizationInput = {
      'signIn.start.title': 'Welcome',
    };
    expectTypeOf(flat).toMatchTypeOf<LocalizationInput>();
  });

  test('accepts empty object', () => {
    const empty: LocalizationInput = {};
    expectTypeOf(empty).toMatchTypeOf<LocalizationInput>();
  });
});

describe('LocalizationResource (nested)', () => {
  test('accepts valid nested structure', () => {
    const nested: LocalizationResource = {
      signIn: {
        start: {
          title: 'Welcome',
          subtitle: 'Please sign in',
        },
      },
    };
    expectTypeOf(nested).toMatchTypeOf<LocalizationResource>();
  });

  test('accepts partial nested structure', () => {
    const partial: LocalizationResource = {
      signIn: {
        start: {
          title: 'Welcome',
        },
      },
    };
    expectTypeOf(partial).toMatchTypeOf<LocalizationResource>();
  });
});
