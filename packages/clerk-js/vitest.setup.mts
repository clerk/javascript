import '@testing-library/jest-dom/vitest';

import * as crypto from 'node:crypto';
import { TextDecoder, TextEncoder } from 'node:util';

import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

configure({ asyncUtilTimeout: 5000 });

// Track all timers created during tests to clean them up
const activeTimers = new Set<ReturnType<typeof setTimeout>>();
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;

// Wrap setTimeout to track all timers
global.setTimeout = ((callback: any, delay?: any, ...args: any[]) => {
  const timerId = originalSetTimeout(callback, delay, ...args);
  activeTimers.add(timerId);
  return timerId;
}) as typeof setTimeout;

// Wrap clearTimeout to remove from tracking
global.clearTimeout = ((timerId?: ReturnType<typeof setTimeout>) => {
  if (timerId) {
    activeTimers.delete(timerId);
    originalClearTimeout(timerId);
  }
}) as typeof clearTimeout;

beforeEach(() => {
  activeTimers.clear();
});

afterEach(() => {
  cleanup();
  // Clear all tracked timers to prevent post-test execution
  activeTimers.forEach(timerId => originalClearTimeout(timerId));
  activeTimers.clear();
});

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
    isSecureContext: { value: true, writable: true },
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

  Object.defineProperty(window.navigator, 'language', {
    writable: true,
    configurable: true,
    value: '',
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
  let animationFrameHandleCounter = 0;
  const animationFrameTimeouts = new Map<number, NodeJS.Timeout>();
  let isTestEnvironmentActive = true;

  const mockRequestAnimationFrame = vi.fn().mockImplementation((callback: FrameRequestCallback) => {
    const handle = ++animationFrameHandleCounter;
    const timeoutId = global.setTimeout(() => {
      // Only execute callback if test environment is still active
      if (isTestEnvironmentActive) {
        callback(performance.now());
      }
      animationFrameTimeouts.delete(handle);
    }, 0);
    animationFrameTimeouts.set(handle, timeoutId);
    return handle;
  });

  const mockCancelAnimationFrame = vi.fn().mockImplementation((handle: number) => {
    const timeoutId = animationFrameTimeouts.get(handle);
    if (timeoutId) {
      global.clearTimeout(timeoutId);
      animationFrameTimeouts.delete(handle);
    }
  });

  // Cleanup function to prevent post-test execution
  const cleanupAnimationFrames = () => {
    isTestEnvironmentActive = false;
    // Clear all pending animation frames
    for (const timeoutId of animationFrameTimeouts.values()) {
      global.clearTimeout(timeoutId);
    }
    animationFrameTimeouts.clear();
  };

  // Register cleanup to run after each test
  afterEach(() => {
    cleanupAnimationFrames();
    // Reset for next test
    isTestEnvironmentActive = true;
  });

  global.requestAnimationFrame = mockRequestAnimationFrame;
  global.cancelAnimationFrame = mockCancelAnimationFrame;
  window.requestAnimationFrame = mockRequestAnimationFrame;
  window.cancelAnimationFrame = mockCancelAnimationFrame;

  // Patch JSDOM's getComputedStyle to handle null/undefined elements gracefully
  // This prevents the "Cannot convert undefined or null to object" error
  const originalGetComputedStyle = window.getComputedStyle.bind(window);
  const patchedGetComputedStyle: typeof window.getComputedStyle = (element, pseudoElement) => {
    const el = element as unknown as Element | null;
    if (!element) {
      // Return a minimal CSSStyleDeclaration object for null elements
      return {
        getPropertyValue: () => '',
        setProperty: () => {},
        removeProperty: () => '',
        item: () => '',
        length: 0,
        parentRule: null,
        cssText: '',
        display: 'none',
        visibility: 'hidden',
        opacity: '0',
        position: 'static',
        overflow: 'visible',
        clip: 'auto',
        clipPath: 'none',
        transform: 'none',
        filter: 'none',
        backfaceVisibility: 'visible',
        perspective: 'none',
        willChange: 'auto',
      } as unknown as CSSStyleDeclaration;
    }

    try {
      return originalGetComputedStyle(el as Element, (pseudoElement ?? null) as any);
    } catch {
      // If JSDOM fails, return a safe fallback
      return {
        getPropertyValue: () => '',
        setProperty: () => {},
        removeProperty: () => '',
        item: () => '',
        length: 0,
        parentRule: null,
        cssText: '',
        display: 'block',
        visibility: 'visible',
        opacity: '1',
        position: 'static',
        overflow: 'visible',
        clip: 'auto',
        clipPath: 'none',
        transform: 'none',
        filter: 'none',
        backfaceVisibility: 'visible',
        perspective: 'none',
        willChange: 'auto',
      } as unknown as CSSStyleDeclaration;
    }
  };
  window.getComputedStyle = patchedGetComputedStyle;
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
