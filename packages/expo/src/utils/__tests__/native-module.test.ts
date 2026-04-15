import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// We re-import the module under test inside each scenario after stubbing
// `react-native` and `../specs/NativeClerkModule`, so platform branches are
// covered with isolated module state.
const FAKE_NATIVE = { __id: 'fake-native-clerk-module' };

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.doUnmock('react-native');
  vi.doUnmock('../../specs/NativeClerkModule');
  vi.restoreAllMocks();
});

describe('native-module loader', () => {
  test('isNativeSupported is true on iOS', async () => {
    vi.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    vi.doMock('../../specs/NativeClerkModule', () => ({ default: FAKE_NATIVE }));
    const mod = await import('../native-module');
    expect(mod.isNativeSupported).toBe(true);
    expect(mod.ClerkExpoModule).toBe(FAKE_NATIVE);
  });

  test('isNativeSupported is true on Android', async () => {
    vi.doMock('react-native', () => ({ Platform: { OS: 'android' } }));
    vi.doMock('../../specs/NativeClerkModule', () => ({ default: FAKE_NATIVE }));
    const mod = await import('../native-module');
    expect(mod.isNativeSupported).toBe(true);
    expect(mod.ClerkExpoModule).toBe(FAKE_NATIVE);
  });

  test('returns null module on web', async () => {
    vi.doMock('react-native', () => ({ Platform: { OS: 'web' } }));
    vi.doMock('../../specs/NativeClerkModule', () => ({ default: FAKE_NATIVE }));
    const mod = await import('../native-module');
    expect(mod.isNativeSupported).toBe(false);
    expect(mod.ClerkExpoModule).toBeNull();
  });

  test('returns the imported module on native when present', async () => {
    vi.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    vi.doMock('../../specs/NativeClerkModule', () => ({ default: FAKE_NATIVE }));
    const mod = await import('../native-module');
    expect(mod.ClerkExpoModule).toBe(FAKE_NATIVE);
  });
});
