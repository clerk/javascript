import { webcrypto } from 'node:crypto';

import { TextDecoder, TextEncoder } from 'util';

const navigatorMock = {};

Object.defineProperty(navigatorMock, 'userAgent', {
  get() {
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0';
  },
  configurable: true,
});

Object.defineProperty(navigatorMock, 'webdriver', {
  get() {
    return false;
  },
  configurable: true,
});

Object.defineProperty(navigatorMock, 'onLine', {
  get() {
    return true;
  },
  configurable: true,
});

Object.defineProperty(navigatorMock, 'connection', {
  get() {
    return { downlink: 10, rtt: 100 };
  },
  configurable: true,
});

Object.defineProperty(global.window, 'navigator', {
  value: navigatorMock,
  writable: true,
});

// polyfill TextDecoder, TextEncoder for jsdom >= 16
Object.assign(global, { TextDecoder, TextEncoder });

// polyfill using webcrypto.subtle to fix issue with missing crypto.subtle
// @ts-ignore
globalThis.crypto.subtle = webcrypto.subtle;
