import { beforeAll, vi } from 'vitest';

globalThis.PACKAGE_NAME = '@clerk/clerk-expo';
globalThis.PACKAGE_VERSION = '0.0.0-test';

// Mock globalThis.expo for expo-modules-core
if (!globalThis.expo) {
  // @ts-expect-error - Mocking expo for tests
  globalThis.expo = {
    EventEmitter: vi.fn(),
  };
}

// Define __DEV__ for expo-modules-core
if (typeof globalThis.__DEV__ === 'undefined') {
  // @ts-expect-error - Mocking __DEV__ for tests
  globalThis.__DEV__ = false;
}

beforeAll(() => {});
