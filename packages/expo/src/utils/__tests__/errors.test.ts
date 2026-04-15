import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  Platform: { OS: 'ios' as 'ios' | 'web' | 'android' },
}));

vi.mock('react-native', () => ({
  get Platform() {
    return mocks.Platform;
  },
}));

import { assertValidProxyUrl, errorThrower } from '../errors';

beforeEach(() => {
  mocks.Platform.OS = 'ios';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('errors', () => {
  test('errorThrower is built and exposes a throw method', () => {
    expect(errorThrower).toBeDefined();
    expect(typeof errorThrower.throw).toBe('function');
  });

  test('assertValidProxyUrl(undefined) is a no-op on native', () => {
    expect(() => assertValidProxyUrl(undefined)).not.toThrow();
  });

  test('assertValidProxyUrl with a valid https URL passes on native', () => {
    expect(() => assertValidProxyUrl('https://valid.example.com')).not.toThrow();
  });

  test('assertValidProxyUrl with an http URL passes on native', () => {
    expect(() => assertValidProxyUrl('http://valid.example.com')).not.toThrow();
  });

  test('assertValidProxyUrl with a non-absolute URL throws on native', () => {
    expect(() => assertValidProxyUrl('not-a-url')).toThrow(/absolute URL/);
  });

  test('assertValidProxyUrl with a non-string value throws on native', () => {
    // Pass a number through the type-cast escape hatch the source uses
    expect(() => assertValidProxyUrl(123 as any)).toThrow(/must be a string/);
  });

  test('assertValidProxyUrl is permissive on web', () => {
    mocks.Platform.OS = 'web';
    // On web, the function exits before any validation
    expect(() => assertValidProxyUrl('not-a-url' as any)).not.toThrow();
  });
});
