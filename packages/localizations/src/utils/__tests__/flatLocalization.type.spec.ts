import type { FlattenedLocalizationResource, LocalizationResource } from '@clerk/shared/types';
import { describe, expectTypeOf, it } from 'vitest';

import { flatLocalization } from '../flatLocalization';

type FlatLocalizationParameters = Parameters<typeof flatLocalization>;
type FlatLocalizationReturn = ReturnType<typeof flatLocalization>;

describe('flatLocalization type tests', () => {
  describe('parameters', () => {
    it('accepts FlattenedLocalizationResource', () => {
      type ValidInput = FlattenedLocalizationResource;
      expectTypeOf<ValidInput>().toExtend<FlatLocalizationParameters[0]>();
    });

    it('accepts valid flattened keys', () => {
      type ValidInput = {
        locale: string;
        formFieldLabel__emailAddress: string;
        'unstable__errors.passwordComplexity.maximumLength': string;
      };
      expectTypeOf<ValidInput>().toExtend<FlattenedLocalizationResource>();
      expectTypeOf<ValidInput>().toExtend<FlatLocalizationParameters[0]>();
    });

    it('rejects non-string values', () => {
      type InvalidInput = {
        'a.b': number;
      };
      expectTypeOf<InvalidInput>().not.toExtend<FlattenedLocalizationResource>();

      // @ts-expect-error - number is not assignable to string
      const _test: FlattenedLocalizationResource = { 'a.b': 123 } as InvalidInput;
    });

    it('rejects nested objects', () => {
      type InvalidInput = {
        nested: {
          key: string;
        };
      };
      expectTypeOf<InvalidInput>().not.toExtend<FlattenedLocalizationResource>();
    });
  });

  describe('return type', () => {
    it('returns LocalizationResource', () => {
      expectTypeOf<FlatLocalizationReturn>().toEqualTypeOf<LocalizationResource>();
    });

    it('return type can be assigned to localization prop', () => {
      type LocalizationProp = LocalizationResource;
      expectTypeOf<FlatLocalizationReturn>().toExtend<LocalizationProp>();
    });

    it('preserves nested structure from flattened keys', () => {
      type Result = ReturnType<typeof flatLocalization>;
      expectTypeOf<Result>().toExtend<LocalizationResource>();
    });
  });

  describe('type inference', () => {
    it('infers correct types from function call', () => {
      const flattened = {
        locale: 'en-US',
        formFieldLabel__emailAddress: 'Email address',
      } as FlattenedLocalizationResource;

      const result = flatLocalization(flattened);
      expectTypeOf(result).toEqualTypeOf<LocalizationResource>();
    });

    it('handles empty object', () => {
      const empty = {} as FlattenedLocalizationResource;
      const result = flatLocalization(empty);
      expectTypeOf(result).toEqualTypeOf<LocalizationResource>();
    });
  });

  describe('edge cases', () => {
    it('handles keys with underscores', () => {
      type InputWithUnderscores = {
        formFieldLabel__emailAddress: string;
        'unstable__errors.passwordComplexity.maximumLength': string;
      };
      expectTypeOf<InputWithUnderscores>().toExtend<FlattenedLocalizationResource>();
    });

    it('handles top-level keys', () => {
      type TopLevelKeys = {
        locale: string;
        maintenanceMode: string;
      };
      expectTypeOf<TopLevelKeys>().toExtend<FlattenedLocalizationResource>();
    });

    it('handles deeply nested paths', () => {
      type DeepNesting = {
        'a.b.c.d.e.f.g': string;
      };
      expectTypeOf<DeepNesting>().toExtend<FlattenedLocalizationResource>();
    });
  });
});
