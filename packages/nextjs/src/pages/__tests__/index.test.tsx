import { expectTypeOf } from 'expect-type';

import type { ClerkProvider } from '../ClerkProvider';

type ClerkProviderProps = Parameters<typeof ClerkProvider>[0];

describe('ClerkProvider', () => {
  describe('Type tests', () => {
    describe('publishableKey', () => {
      it('expects children as the minimum accepted case', () => {
        expectTypeOf({ children: '' }).toMatchTypeOf<ClerkProviderProps>();
      });

      it('does not error if no publishableKey', () => {
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
