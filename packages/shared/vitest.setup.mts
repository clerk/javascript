import { webcrypto } from 'node:crypto';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

globalThis.__DEV__ = true;
globalThis.PACKAGE_NAME = '@clerk/clerk-react';
globalThis.PACKAGE_VERSION = '0.0.0-test';
globalThis.JS_PACKAGE_VERSION = '5.0.0';

// Setup Web Crypto API for tests
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = webcrypto;
}

afterEach(cleanup);
