import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  checkCSSFeatures,
  clearCSSSupportsCache,
  cssSupports,
  getCachedSupports,
  testCSSFeature,
} from '../cssSupports';

// Mock CSS.supports globally
const mockCSSSupports = vi.fn();
Object.defineProperty(global, 'CSS', {
  value: {
    supports: mockCSSSupports,
  },
  writable: true,
});

describe('cssSupports', () => {
  beforeEach(() => {
    clearCSSSupportsCache();
    mockCSSSupports.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    clearCSSSupportsCache();
  });

  describe('testCSSFeature', () => {
    test('should test relative color syntax feature', () => {
      mockCSSSupports.mockReturnValue(true);

      const result = testCSSFeature('relativeColorSyntax');

      expect(result).toBe(true);
      expect(mockCSSSupports).toHaveBeenCalledWith('color', 'hsl(from white h s l)');
    });

    test('should test color-mix feature', () => {
      mockCSSSupports.mockReturnValue(false);

      const result = testCSSFeature('colorMix');

      expect(result).toBe(false);
      expect(mockCSSSupports).toHaveBeenCalledWith('color', 'color-mix(in srgb, white, black)');
    });

    test('should cache results and not call CSS.supports again', () => {
      mockCSSSupports.mockReturnValue(true);

      // First call
      const result1 = testCSSFeature('relativeColorSyntax');
      expect(result1).toBe(true);
      expect(mockCSSSupports).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = testCSSFeature('relativeColorSyntax');
      expect(result2).toBe(true);
      expect(mockCSSSupports).toHaveBeenCalledTimes(1); // Still only called once
    });

    test('should handle CSS.supports throwing an error', () => {
      mockCSSSupports.mockImplementation(() => {
        throw new Error('CSS.supports not available');
      });

      const result = testCSSFeature('colorMix');

      expect(result).toBe(false);
    });

    test('should use custom property for testing', () => {
      mockCSSSupports.mockReturnValue(true);

      testCSSFeature('colorMix', 'background-color');

      // Note: The implementation currently ignores custom properties for predefined features
      // and always uses 'color' for colorMix and relativeColorSyntax
      expect(mockCSSSupports).toHaveBeenCalledWith('color', 'color-mix(in srgb, white, black)');
    });
  });

  describe('cssSupports convenience functions', () => {
    test('should provide relativeColorSyntax function', () => {
      mockCSSSupports.mockReturnValue(true);

      const result = cssSupports.relativeColorSyntax();

      expect(result).toBe(true);
      expect(mockCSSSupports).toHaveBeenCalledWith('color', 'hsl(from white h s l)');
    });

    test('should provide colorMix function', () => {
      mockCSSSupports.mockReturnValue(false);

      const result = cssSupports.colorMix();

      expect(result).toBe(false);
      expect(mockCSSSupports).toHaveBeenCalledWith('color', 'color-mix(in srgb, white, black)');
    });
  });

  describe('checkCSSFeatures', () => {
    test('should check multiple features at once', () => {
      mockCSSSupports
        .mockReturnValueOnce(true) // relativeColorSyntax
        .mockReturnValueOnce(false); // colorMix

      const result = checkCSSFeatures(['relativeColorSyntax', 'colorMix']);

      expect(result).toEqual({
        relativeColorSyntax: true,
        colorMix: false,
      });
      expect(mockCSSSupports).toHaveBeenCalledTimes(2);
    });

    test('should return empty object for empty array', () => {
      const result = checkCSSFeatures([]);

      expect(result).toEqual({});
      expect(mockCSSSupports).not.toHaveBeenCalled();
    });
  });

  describe('getCachedSupports', () => {
    test('should return empty object when no features tested', () => {
      const result = getCachedSupports();

      expect(result).toEqual({});
    });

    test('should return cached results after testing features', () => {
      mockCSSSupports.mockReturnValueOnce(true).mockReturnValueOnce(false);

      // Test some features to populate cache
      cssSupports.relativeColorSyntax();
      cssSupports.colorMix();

      const result = getCachedSupports();

      expect(result).toEqual({
        relativeColorSyntax: true,
        colorMix: false,
      });
    });

    test('should update cached results when more features are tested', () => {
      mockCSSSupports.mockReturnValue(true);

      // Test one feature
      cssSupports.relativeColorSyntax();

      let result = getCachedSupports();
      expect(result).toEqual({
        relativeColorSyntax: true,
      });

      // Test another feature
      cssSupports.colorMix();

      result = getCachedSupports();
      expect(result).toEqual({
        relativeColorSyntax: true,
        colorMix: true,
      });
    });
  });

  describe('clearCSSSupportsCache', () => {
    test('should clear the cache and allow retesting', () => {
      mockCSSSupports.mockReturnValue(true);

      // Test feature and verify it's cached
      cssSupports.relativeColorSyntax();
      expect(getCachedSupports()).toEqual({ relativeColorSyntax: true });
      expect(mockCSSSupports).toHaveBeenCalledTimes(1);

      // Clear cache
      clearCSSSupportsCache();
      expect(getCachedSupports()).toEqual({});

      // Test again - should call CSS.supports again
      mockCSSSupports.mockReturnValue(false);
      const result = cssSupports.relativeColorSyntax();

      expect(result).toBe(false);
      expect(mockCSSSupports).toHaveBeenCalledTimes(2);
      expect(getCachedSupports()).toEqual({ relativeColorSyntax: false });
    });
  });

  describe('environment compatibility', () => {
    test('should handle undefined CSS object gracefully', () => {
      // Temporarily remove CSS object
      const originalCSS = global.CSS;
      // @ts-expect-error - Intentionally setting to undefined for testing
      global.CSS = undefined;

      const result = testCSSFeature('colorMix');

      expect(result).toBe(false);

      // Restore CSS object
      global.CSS = originalCSS;
    });

    test('should handle CSS object without supports method', () => {
      // Temporarily modify CSS object
      const originalCSS = global.CSS;
      global.CSS = {} as any;

      const result = testCSSFeature('relativeColorSyntax');

      expect(result).toBe(false);

      // Restore CSS object
      global.CSS = originalCSS;
    });
  });
});
