import crypto from 'node:crypto';
import { TextDecoder, TextEncoder } from 'node:util';

import { jest } from '@jest/globals';

class FakeResponse {}

if (typeof window !== 'undefined') {
  Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder },
    TextEncoder: { value: TextEncoder },
    Response: { value: FakeResponse },
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

  //@ts-expect-error - JSDOM doesn't provide IntersectionObserver, so we mock it for testing
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

  // Mock HTMLCanvasElement.prototype.getContext to prevent errors
  HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(((contextType: string) => {
    if (contextType === '2d') {
      return {
        fillRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Uint8ClampedArray([255, 255, 255, 255]) }) as unknown as ImageData),
      } as unknown as CanvasRenderingContext2D;
    }
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {} as unknown as WebGLRenderingContext;
    }
    return null;
  }) as any) as jest.MockedFunction<HTMLCanvasElement['getContext']>;
}
