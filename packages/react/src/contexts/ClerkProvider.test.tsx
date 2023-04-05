import { expectTypeOf } from 'expect-type';

import type { ClerkProviderProps } from './ClerkProvider';

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

  describe.skip('Multi domain', () => {
    const defaultProps = { publishableKey: 'test', children: '' };
  });

  describe('children', () => {
    it('errors if no children', () => {
      expectTypeOf({ publishableKey: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
    });
  });
});
