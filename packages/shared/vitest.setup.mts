import { webcrypto } from 'node:crypto';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

globalThis.__DEV__ = true;
globalThis.PACKAGE_NAME = '@clerk/react';
globalThis.PACKAGE_VERSION = '0.0.0-test';
globalThis.JS_PACKAGE_VERSION = '5.0.0';
globalThis.UI_PACKAGE_VERSION = '1.0.0';
globalThis.__CLERK_USE_RQ__ = process.env.CLERK_USE_RQ === 'true';

// Setup Web Crypto API for tests (Node.js 18+ compatibility)
if (!globalThis.crypto) {
  // @ts-ignore - Node.js 18+ Web Crypto API
  globalThis.crypto = webcrypto as Crypto;
}
// Ensure crypto.subtle is available (needed for Node.js 18)
if (globalThis.crypto && !globalThis.crypto.subtle) {
  // @ts-ignore
  globalThis.crypto.subtle = webcrypto.subtle;
}

afterEach(cleanup);
