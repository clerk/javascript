import { describe, expect, test, vi } from 'vitest';

import ClerkGoogleSignInSpec from '../NativeClerkGoogleSignIn.android';
import ClerkExpoSpec from '../NativeClerkModule.android';

// Simulates Expo Go on Android, where the native modules are not compiled in:
// requireNativeModule throws, requireOptionalNativeModule resolves to null.
vi.mock('expo', () => ({
  requireNativeModule: (name: string) => {
    throw new Error(`Cannot find native module '${name}'`);
  },
  requireOptionalNativeModule: () => null,
}));

describe('android native module specs', () => {
  test('NativeClerkModule resolves to null instead of throwing at import time', () => {
    expect(ClerkExpoSpec).toBeNull();
  });

  test('NativeClerkGoogleSignIn resolves to null instead of throwing at import time', () => {
    expect(ClerkGoogleSignInSpec).toBeNull();
  });
});
