import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  Platform: {
    OS: 'ios',
    constants: {
      reactNativeVersion: { major: 0, minor: 76, patch: 0 },
    },
  },
}));

vi.mock('react-native', () => ({
  get Platform() {
    return mocks.Platform;
  },
}));

import { isHermes, isNative, isWeb, reactNativeVersion } from '../runtime';

let originalHermes: unknown;

beforeEach(() => {
  mocks.Platform.OS = 'ios';
  // @ts-expect-error - test env may or may not have HermesInternal
  originalHermes = globalThis.HermesInternal;
});

afterEach(() => {
  // @ts-expect-error - cleanup HermesInternal
  globalThis.HermesInternal = originalHermes;
});

describe('runtime helpers', () => {
  test('isWeb is true on web platform', () => {
    mocks.Platform.OS = 'web';
    expect(isWeb()).toBe(true);
  });

  test('isWeb is false on iOS and android', () => {
    mocks.Platform.OS = 'ios';
    expect(isWeb()).toBe(false);
    mocks.Platform.OS = 'android';
    expect(isWeb()).toBe(false);
  });

  test('isNative is the inverse of isWeb', () => {
    mocks.Platform.OS = 'web';
    expect(isNative()).toBe(false);
    mocks.Platform.OS = 'ios';
    expect(isNative()).toBe(true);
  });

  test('isHermes returns true when global.HermesInternal is set', () => {
    // @ts-expect-error - test setup
    globalThis.HermesInternal = {};
    expect(isHermes()).toBe(true);
  });

  test('isHermes returns false when global.HermesInternal is undefined', () => {
    // @ts-expect-error - test setup
    delete globalThis.HermesInternal;
    expect(isHermes()).toBe(false);
  });

  test('reactNativeVersion returns Platform.constants.reactNativeVersion', () => {
    expect(reactNativeVersion()).toEqual({ major: 0, minor: 76, patch: 0 });
  });
});
