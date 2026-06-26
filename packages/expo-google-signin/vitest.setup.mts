import { beforeAll, vi } from 'vitest';

globalThis.PACKAGE_NAME = '@clerk/expo-google-signin';
globalThis.PACKAGE_VERSION = '0.0.0-test';

if (!globalThis.expo) {
  // @ts-expect-error - Mocking expo for tests
  globalThis.expo = {
    EventEmitter: vi.fn(),
  };
}

if (typeof globalThis.__DEV__ === 'undefined') {
  // @ts-expect-error - Mocking __DEV__ for tests
  globalThis.__DEV__ = false;
}

beforeAll(() => {});
