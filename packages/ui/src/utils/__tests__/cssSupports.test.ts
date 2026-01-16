import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { clearCache, cssSupports } from '../cssSupports';
import { lightDark } from '../lightDark';

// Store original CSS if it exists
const originalCSS = globalThis.CSS;

beforeAll(() => {
  // Create mock CSS global for Node.js environment
  globalThis.CSS = {
    supports: vi.fn((feature: string) => {
      if (feature === 'color: hsl(from white h s l)') {
        return true;
      }
      if (feature === 'color: color-mix(in srgb, white, black)') {
        return false;
      }
      if (feature === 'color: light-dark(white, black)') {
        return true;
      }
      return false;
    }),
  } as unknown as typeof CSS;
});

afterAll(() => {
  // Restore original CSS or remove if it didn't exist
  if (originalCSS) {
    globalThis.CSS = originalCSS;
  } else {
    // @ts-expect-error - cleaning up mock
    delete globalThis.CSS;
  }
});

beforeEach(() => {
  clearCache();
  // Reset mock to default behavior
  vi.mocked(globalThis.CSS.supports).mockImplementation((feature: string) => {
    if (feature === 'color: hsl(from white h s l)') {
      return true;
    }
    if (feature === 'color: color-mix(in srgb, white, black)') {
      return false;
    }
    if (feature === 'color: light-dark(white, black)') {
      return true;
    }
    return false;
  });
});

describe('cssSupports', () => {
  test('relativeColorSyntax should return true when supported', () => {
    expect(cssSupports.relativeColorSyntax()).toBe(true);
  });

  test('colorMix should return false when not supported', () => {
    expect(cssSupports.colorMix()).toBe(false);
  });

  test('modernColor should return true when at least one feature is supported', () => {
    expect(cssSupports.modernColor()).toBe(true);
  });

  test('lightDark should return true when supported', () => {
    expect(cssSupports.lightDark()).toBe(true);
  });

  test('caching works correctly', () => {
    const initialCallCount = vi.mocked(globalThis.CSS.supports).mock.calls.length;
    cssSupports.relativeColorSyntax();
    expect(globalThis.CSS.supports).toHaveBeenCalledTimes(initialCallCount + 1);
    cssSupports.relativeColorSyntax();
    expect(globalThis.CSS.supports).toHaveBeenCalledTimes(initialCallCount + 1); // Should not call again due to caching
  });

  test('lightDark caching works correctly', () => {
    const initialCallCount = vi.mocked(globalThis.CSS.supports).mock.calls.length;
    cssSupports.lightDark();
    expect(globalThis.CSS.supports).toHaveBeenCalledTimes(initialCallCount + 1);
    cssSupports.lightDark();
    expect(globalThis.CSS.supports).toHaveBeenCalledTimes(initialCallCount + 1); // Should not call again due to caching
  });
});

describe('lightDark utility', () => {
  test('returns light-dark() when both lightDark and modernColor are supported', () => {
    // In this test setup: lightDark=true, relativeColorSyntax=true (so modernColor=true)
    const result = lightDark('#ffffff', '#000000');
    expect(result).toBe('light-dark(#ffffff, #000000)');
  });

  test('returns light value when lightDark is not supported', () => {
    // Override mock to return false for lightDark
    vi.mocked(globalThis.CSS.supports).mockImplementation((feature: string) => {
      if (feature === 'color: light-dark(white, black)') {
        return false;
      }
      if (feature === 'color: hsl(from white h s l)') {
        return true;
      }
      return false;
    });
    clearCache();

    const result = lightDark('#ffffff', '#000000');
    expect(result).toBe('#ffffff');
  });

  test('returns light value when modernColor is not supported', () => {
    // Override mock to return true for lightDark but false for modern color features
    vi.mocked(globalThis.CSS.supports).mockImplementation((feature: string) => {
      if (feature === 'color: light-dark(white, black)') {
        return true;
      }
      // Both relativeColorSyntax and colorMix return false
      return false;
    });
    clearCache();

    const result = lightDark('#ffffff', '#000000');
    expect(result).toBe('#ffffff');
  });

  test('works with named colors', () => {
    const result = lightDark('white', 'black');
    expect(result).toBe('light-dark(white, black)');
  });
});
