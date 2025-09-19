import '@testing-library/jest-dom/vitest';

import * as crypto from 'node:crypto';
import { TextDecoder, TextEncoder } from 'node:util';

import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

configure({});

afterEach(cleanup);

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

  // Mock document.elementFromPoint for input-otp library
  Object.defineProperty(document, 'elementFromPoint', {
    value: vi.fn().mockReturnValue(null),
    writable: true,
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

  // Mock HTMLCanvasElement.prototype.getContext to prevent errors
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType: string) => {
    if (contextType === '2d') {
      return {
        fillRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray([255, 255, 255, 255]) }) as unknown as ImageData),
      } as unknown as CanvasRenderingContext2D;
    }
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {} as unknown as WebGLRenderingContext;
    }
    return null;
  });

  // Mock Element.prototype.animate for auto-animate library
  Element.prototype.animate = vi.fn().mockImplementation(() => ({
    cancel: vi.fn(),
    finish: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    reverse: vi.fn(),
    updatePlaybackRate: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  // Mock requestAnimationFrame for auto-animate library
  global.requestAnimationFrame = vi.fn().mockImplementation((callback: FrameRequestCallback) => {
    return setTimeout(callback, 16);
  });

  global.cancelAnimationFrame = vi.fn().mockImplementation((id: number) => {
    clearTimeout(id);
  });
}

// Mock browser-tabs-lock to prevent window access errors in tests
vi.mock('browser-tabs-lock', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(true),
    })),
  };
});

// Mock jest-chrome if its functionality is needed
// Example: Mocking chrome.runtime.sendMessage
// global.chrome = {
//   runtime: {
//     sendMessage: vi.fn(),
//     // ... other chrome APIs needed
//   },
//   // ... other chrome namespaces needed
// };
