import { afterAll, beforeAll, vi } from 'vitest';
import crypto from 'node:crypto';
import { TextDecoder, TextEncoder } from 'node:util';
import '@testing-library/jest-dom/vitest'; // Use Vitest extensions for jest-dom
import React from 'react'; // Import React for the mock component

// --- Setup from root jest.setup-after-env.ts ---

// Store the original method
// eslint-disable-next-line @typescript-eslint/unbound-method
const ogToLocaleDateString = Date.prototype.toLocaleDateString;

beforeAll(() => {
  // Make sure our tests always use the same locale
  Date.prototype.toLocaleDateString = function (...args: any[]) {
    // Call original method with 'en-US' locale
    return ogToLocaleDateString.call(this, 'en-US', args[1]); // Pass options if provided
  };

  // --- Setup from jest.jsdom-with-timezone.ts ---
  // Set a default timezone (e.g., UTC) for consistency
  process.env.TZ = 'UTC';
});

afterAll(() => {
  // Restore original Date method
  Date.prototype.toLocaleDateString = ogToLocaleDateString;
});

// --- Setup from package jest.setup.ts ---

// Mock Response class if not already defined by jsdom/happy-dom
class FakeResponse {}

// Polyfill/mock global objects for the jsdom environment
if (typeof window !== 'undefined') {
  Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder },
    TextEncoder: { value: TextEncoder },
    Response: { value: FakeResponse },
    crypto: { value: crypto.webcrypto },
  });

  // Mock ResizeObserver
  window.ResizeObserver =
    window.ResizeObserver ||
    vi.fn().mockImplementation(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  //@ts-expect-error - Mocking class
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {
      return null;
    }
    observe() {
      return null;
    }
    takeRecords() {
      return []; // Return empty array as per spec
    }
    unobserve() {
      return null;
    }
  };
}

// Mock jest-chrome if its functionality is needed
// Example: Mocking chrome.runtime.sendMessage
// global.chrome = {
//   runtime: {
//     sendMessage: vi.fn(),
//     // ... other chrome APIs needed
//   },
//   // ... other chrome namespaces needed
// };

// Add any other global setup needed for your tests
console.log('ClerkJS Vitest setup complete.');
