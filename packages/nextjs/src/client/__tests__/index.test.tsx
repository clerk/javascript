import { expectTypeOf } from 'expect-type';

import type { ClerkProvider } from '..';

type ClerkProviderProps = Parameters<typeof ClerkProvider>[0];

describe('ClerkProvider', () => {
  describe('Type tests', () => {
    describe('publishableKey and frontendApi', () => {
      it('expects children as the minimum accepted case', () => {
        expectTypeOf({ children: '' }).toMatchTypeOf<ClerkProviderProps>();
      });

      it('publishable key is replaceable with frontendApi', () => {
        expectTypeOf({ frontendApi: 'test', children: '' }).toMatchTypeOf<ClerkProviderProps>();
      });

      it('does not error if no publishableKey or frontendApi', () => {
        expectTypeOf({ children: '' }).toMatchTypeOf<ClerkProviderProps>();
      });
    });
  });

  describe('Multi domain', () => {
    const defaultProps = { children: '' };

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
    const defaultProps = { children: '' };

    it('is either headless or empty', () => {
      expectTypeOf({ ...defaultProps, clerkJSVariant: 'headless' as const }).toMatchTypeOf<ClerkProviderProps>();
      expectTypeOf({ ...defaultProps, clerkJSVariant: '' as const }).toMatchTypeOf<ClerkProviderProps>();
      expectTypeOf({ ...defaultProps, clerkJSVariant: undefined }).toMatchTypeOf<ClerkProviderProps>();
      expectTypeOf({ ...defaultProps, clerkJSVariant: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
    });
  });

  describe('children', () => {
    it('errors if no children', () => {
      expectTypeOf({}).not.toMatchTypeOf<ClerkProviderProps>();
    });
  });
});
