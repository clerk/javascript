import {
  beBY,
  csCZ,
  deDE,
  enUS,
  esES,
  frFR,
  itIT,
  jaJP,
  koKR,
  ptBR,
  ruRU,
  skSK,
  svSE,
  trTR,
  ukUA,
} from '@clerk/localizations';
import { dark } from '@clerk/ui/themes';
import { describe, expectTypeOf, it } from 'vitest';

import type { ClerkProvider } from '../ClerkProvider';

type ClerkProviderProps = Parameters<typeof ClerkProvider>[0];

describe('ClerkProvider', () => {
  describe('Type tests', () => {
    describe('publishableKey', () => {
      it('expects a publishableKey and children as the minimum accepted case', () => {
        expectTypeOf({ publishableKey: 'test', children: '' }).toMatchTypeOf<ClerkProviderProps>();
      });

      it('errors if no publishableKey', () => {
        expectTypeOf({ children: '' }).not.toMatchTypeOf<ClerkProviderProps>();
      });
    });
  });

  describe('clerkJSVariant', () => {
    const defaultProps = { publishableKey: 'test', children: '' };

    it('is either headless or empty', () => {
      expectTypeOf({ ...defaultProps, clerkJSVariant: 'headless' as const }).toMatchTypeOf<ClerkProviderProps>();
      expectTypeOf({ ...defaultProps, clerkJSVariant: '' as const }).toMatchTypeOf<ClerkProviderProps>();
      expectTypeOf({ ...defaultProps, clerkJSVariant: undefined }).toMatchTypeOf<ClerkProviderProps>();
      expectTypeOf({ ...defaultProps, clerkJSVariant: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
    });
  });

  describe('appearance', () => {
    const defaultProps = { publishableKey: 'test', children: '' };

    it('exists as a prop', () => {
      expectTypeOf({ ...defaultProps, appearance: {} }).toMatchTypeOf<ClerkProviderProps>();
    });

    it('includes variables, elements, layout baseTheme', () => {
      expectTypeOf({
        ...defaultProps,
        appearance: { elements: {}, variables: {}, layout: {}, baseTheme: dark },
      }).toMatchTypeOf<ClerkProviderProps>();
    });

    it('errors if a non existent key is provided', () => {
      expectTypeOf({
        ...defaultProps,
        appearance: { variables: { nonExistentKey: '' } },
      }).not.toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        appearance: { layout: { nonExistentKey: '' } },
      }).not.toMatchTypeOf<ClerkProviderProps>();

      // expectTypeOf({
      //   ...defaultProps,
      //   appearance: { elements: { nonExistentKey: '' } },
      // }).not.toMatchTypeOf<ClerkProviderProps>();
    });
  });

  describe('localization', () => {
    const defaultProps = { publishableKey: 'test', children: '' };

    it('exists as a prop', () => {
      expectTypeOf({ ...defaultProps, localization: {} }).toMatchTypeOf<ClerkProviderProps>();
    });

    it('errors if a non existent key is provided', () => {
      expectTypeOf({
        ...defaultProps,
        localization: { a: 'test' },
      }).not.toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: { signUp: { start: 'test' } },
      }).not.toMatchTypeOf<ClerkProviderProps>();
    });

    it('works with all our prebuilt localizations', () => {
      expectTypeOf({
        ...defaultProps,
        localization: beBY,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: deDE,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: frFR,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: enUS,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: esES,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: itIT,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: ptBR,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: ruRU,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: svSE,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: trTR,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: jaJP,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: jaJP,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: csCZ,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: koKR,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: skSK,
      }).toMatchTypeOf<ClerkProviderProps>();

      expectTypeOf({
        ...defaultProps,
        localization: ukUA,
      }).toMatchTypeOf<ClerkProviderProps>();
    });

    it('is able to receive multiple localizations', () => {
      expectTypeOf({
        ...defaultProps,
        localization: { ...frFR, ...deDE },
      }).toMatchTypeOf<ClerkProviderProps>();
    });
  });

  describe('children', () => {
    it('errors if no children', () => {
      expectTypeOf({ publishableKey: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
    });
  });

  describe('navigation options', () => {
    it('expects both routerPush & routerReplace to pass', () => {
      expectTypeOf({
        publishableKey: 'test',
        children: '',
        routerPush: () => {},
        routerReplace: () => {},
      }).toMatchTypeOf<ClerkProviderProps>();
    });
  });
});
