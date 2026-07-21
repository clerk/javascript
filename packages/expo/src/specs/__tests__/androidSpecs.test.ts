import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  available: {} as Record<string, unknown>,
}));

// Only returns a module when one is registered under the exact name requested.
vi.mock('expo', () => ({
  requireNativeModule: (name: string) => {
    const nativeModule = mocks.available[name];
    if (!nativeModule) {
      throw new Error(`Cannot find native module '${name}'`);
    }
    return nativeModule;
  },
  requireOptionalNativeModule: (name: string) => mocks.available[name] ?? null,
}));

// Path is a variable because TypeScript cannot resolve the platform suffix in a
// dynamic import.
const importSpec = async (path: string) => (await import(path)).default;

const importSpecs = async () => ({
  clerkExpo: await importSpec('../NativeClerkModule.android'),
  googleSignIn: await importSpec('../NativeClerkGoogleSignIn.android'),
});

describe('android native module specs', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.available = {};
  });

  test('resolve to null instead of throwing when not compiled in (Expo Go)', async () => {
    const { clerkExpo, googleSignIn } = await importSpecs();

    expect(clerkExpo).toBeNull();
    expect(googleSignIn).toBeNull();
  });

  test('resolve the module registered under the expected name (development build)', async () => {
    const clerkExpoModule = { configure: vi.fn() };
    const googleSignInModule = { signIn: vi.fn() };
    mocks.available = { ClerkExpo: clerkExpoModule, ClerkGoogleSignIn: googleSignInModule };

    const { clerkExpo, googleSignIn } = await importSpecs();

    expect(clerkExpo).toBe(clerkExpoModule);
    expect(googleSignIn).toBe(googleSignInModule);
  });
});
