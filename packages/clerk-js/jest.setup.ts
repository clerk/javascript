import crypto from 'node:crypto';
import { TextDecoder, TextEncoder } from 'node:util';

import { jest } from '@jest/globals';

if (typeof window !== 'undefined') {
  Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder },
    TextEncoder: { value: TextEncoder },
    crypto: { value: crypto.webcrypto },
  });

  window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  global.__PKG_NAME__ = '';
  global.__PKG_VERSION__ = '';

  //@ts-expect-error
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}

    disconnect() {
      return null;
    }

    observe() {
      return null;
    }

    takeRecords() {
      return null;
    }

    unobserve() {
      return null;
    }
  };
}
