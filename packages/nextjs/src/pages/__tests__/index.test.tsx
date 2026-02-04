import { describe, expectTypeOf, it } from 'vitest';

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

  describe('prefetchUI', () => {
    const defaultProps = { children: '' };

    it('accepts false to disable UI prefetching', () => {
      expectTypeOf({ ...defaultProps, prefetchUI: false as const }).toMatchTypeOf<ClerkProviderProps>();
    });

    it('accepts undefined for default UI prefetching', () => {
      expectTypeOf({ ...defaultProps, prefetchUI: undefined }).toMatchTypeOf<ClerkProviderProps>();
    });
  });

  describe('clerkUIUrl', () => {
    const defaultProps = { children: '' };

    it('accepts string URL for custom UI location', () => {
      expectTypeOf({ ...defaultProps, clerkUIUrl: 'https://custom.com/ui.js' }).toMatchTypeOf<ClerkProviderProps>();
    });

    it('accepts undefined', () => {
      expectTypeOf({ ...defaultProps, clerkUIUrl: undefined }).toMatchTypeOf<ClerkProviderProps>();
    });
  });

  describe('children', () => {
    it('errors if no children', () => {
      expectTypeOf({}).not.toMatchTypeOf<ClerkProviderProps>();
    });
  });
});
