import { describe, expectTypeOf, it } from 'vitest';

import type { ClerkProvider } from '../ClerkProvider';

type ClerkProviderProps = Parameters<typeof ClerkProvider>[0];

describe('ClerkProvider', () => {
  describe('Type tests', () => {
    describe('publishableKey', () => {
      it('accepts an explicit publishableKey', () => {
        expectTypeOf({ publishableKey: 'test', children: '' }).toMatchTypeOf<ClerkProviderProps>();
      });

      it('requires publishableKey (extensions cannot use the env-var fallback)', () => {
        expectTypeOf({ children: '' }).not.toMatchTypeOf<ClerkProviderProps>();
      });
    });
  });
});
