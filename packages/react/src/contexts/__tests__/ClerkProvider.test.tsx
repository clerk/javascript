import { deDe, enUS, esES, frFR, itIT, ptBR, ruRU, svSE } from '@clerk/localizations';
import { dark } from '@clerk/themes';
import { expectTypeOf } from 'expect-type';

import type { ClerkProvider } from '../ClerkProvider';

//@ts-ignore
type ClerkProviderProps = Parameters<typeof ClerkProvider>[0];

describe('ClerkProvider', () => {
  describe('Type tests', () => {
    describe('publishableKey and frontendApi', () => {
      it('expects a publishableKey and children as the minimum accepted case', () => {
        expectTypeOf({ publishableKey: 'test', children: '' }).toMatchTypeOf<ClerkProviderProps>();
      });

      it('publishable key is replaceable with frontendApi', () => {
        expectTypeOf({ frontendApi: 'test', children: '' }).toMatchTypeOf<ClerkProviderProps>();
      });

      it('errors if no publishableKey or frontendApi', () => {
        expectTypeOf({ children: '' }).not.toMatchTypeOf<ClerkProviderProps>();
      });

      it('errors if both publishableKey and frontendApi are provided', () => {
        expectTypeOf({ publishableKey: 'test', frontendApi: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
      });
    });
  });

  describe('Multi domain', () => {
    const defaultProps = { publishableKey: 'test', children: '' };

    it('proxyUrl (primary app)', () => {
      expectTypeOf({ ...defaultProps, proxyUrl: 'test' }).toMatchTypeOf<ClerkProviderProps>();
    });

    it('proxyUrl + isSatellite (satellite app)', () => {
      expectTypeOf({ ...defaultProps, proxyUrl: 'test', isSatellite: true }).toMatchTypeOf<ClerkProviderProps>();
    });

    it('domain + isSatellite (satellite app)', () => {
      expectTypeOf({ ...defaultProps, domain: 'test', isSatellite: true }).toMatchTypeOf<ClerkProviderProps>();
    });

    it('only domain is not allowed', () => {
      expectTypeOf({ ...defaultProps, domain: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
    });

    it('only isSatellite is not allowed', () => {
      expectTypeOf({ ...defaultProps, isSatellite: true }).not.toMatchTypeOf<ClerkProviderProps>();
    });

    it('proxyUrl + domain is not allowed', () => {
      expectTypeOf({ ...defaultProps, proxyUrl: 'test', domain: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
    });

    it('proxyUrl + domain + isSatellite is not allowed', () => {
      expectTypeOf({
        ...defaultProps,
        proxyUrl: 'test',
        domain: 'test',
        isSatellite: true,
      }).not.toMatchTypeOf<ClerkProviderProps>();
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
        localization: deDe,
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
    });

    it('is able to receive multiple localizations', () => {
      expectTypeOf({
        ...defaultProps,
        localization: { ...frFR, ...deDe },
      }).toMatchTypeOf<ClerkProviderProps>();
    });
  });

  describe('children', () => {
    it('errors if no children', () => {
      expectTypeOf({ publishableKey: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
    });
  });
});
