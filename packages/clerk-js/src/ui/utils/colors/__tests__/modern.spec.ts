import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cssSupports } from '../../cssSupports';
import { colors } from '../modern';

// Mock cssSupports
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    relativeColorSyntax: vi.fn(),
    colorMix: vi.fn(),
  },
}));

// Get the mocked functions
const mockRelativeColorSyntax = vi.mocked(cssSupports.relativeColorSyntax);
const mockColorMix = vi.mocked(cssSupports.colorMix);

describe('Modern CSS Colors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRelativeColorSyntax.mockReturnValue(true);
    mockColorMix.mockReturnValue(true);
  });

  describe('lighten', () => {
    it('should return undefined for undefined color', () => {
      expect(colors.lighten(undefined)).toBeUndefined();
    });

    it('should use relative color syntax when supported', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = colors.lighten('red', 0.1);
      expect(result).toMatch(/hsl\(from red h s calc\(l \+ 10%\)\)/);
    });

    it('should fall back to color-mix when relative color syntax not supported', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(true);

      const result = colors.lighten('red', 0.1);
      expect(result).toMatch(/color-mix\(in srgb, red, white 10%\)/);
    });

    it('should return original color when no modern CSS support', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(false);

      const result = colors.lighten('red', 0.1);
      expect(result).toBe('red');
    });

    it('should handle zero percentage', () => {
      const result = colors.lighten('blue', 0);
      expect(result).toMatch(/hsl\(from blue h s calc\(l \+ 0%\)\)/);
    });

    it('should limit color-mix percentage to maximum', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(true);

      const result = colors.lighten('red', 2); // Very high percentage
      expect(result).toMatch(/color-mix\(in srgb, red, white 95%\)/); // Should be capped
    });
  });

  describe('makeTransparent', () => {
    it('should return undefined for undefined color', () => {
      expect(colors.makeTransparent(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(colors.makeTransparent('')).toBeUndefined();
    });

    it('should use color-mix when supported', () => {
      mockColorMix.mockReturnValue(true);

      const result = colors.makeTransparent('red', 0.5);
      expect(result).toMatch(/color-mix\(in srgb, transparent, red 50%\)/);
    });

    it('should return original color when color-mix not supported', () => {
      mockColorMix.mockReturnValue(false);

      const result = colors.makeTransparent('red', 0.5);
      expect(result).toBe('red');
    });

    it('should handle zero transparency', () => {
      const result = colors.makeTransparent('blue', 0);
      expect(result).toMatch(/color-mix\(in srgb, transparent, blue 100%\)/);
    });

    it('should enforce minimum alpha percentage', () => {
      const result = colors.makeTransparent('red', 0.99); // Very transparent
      expect(result).toMatch(/color-mix\(in srgb, transparent, red 5%\)/); // Should be minimum
    });
  });

  describe('makeSolid', () => {
    it('should return undefined for undefined color', () => {
      expect(colors.makeSolid(undefined)).toBeUndefined();
    });

    it('should use relative color syntax when supported', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = colors.makeSolid('rgba(255, 0, 0, 0.5)');
      expect(result).toMatch(/hsl\(from rgba\(255, 0, 0, 0\.5\) h s l \/ 1\)/);
    });

    it('should fall back to color-mix when relative color syntax not supported', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(true);

      const result = colors.makeSolid('rgba(255, 0, 0, 0.5)');
      expect(result).toMatch(/color-mix\(in srgb, rgba\(255, 0, 0, 0\.5\), rgba\(255, 0, 0, 0\.5\) 100%\)/);
    });

    it('should return original color when no modern CSS support', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(false);

      const result = colors.makeSolid('rgba(255, 0, 0, 0.5)');
      expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });
  });

  describe('setAlpha', () => {
    it('should use relative color syntax when supported', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = colors.setAlpha('red', 0.5);
      expect(result).toMatch(/hsl\(from red h s l \/ 0\.5\)/);
    });

    it('should fall back to color-mix when relative color syntax not supported', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(true);

      const result = colors.setAlpha('red', 0.5);
      expect(result).toMatch(/color-mix\(in srgb, transparent, red 50%\)/);
    });

    it('should return original color when no modern CSS support', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(false);

      const result = colors.setAlpha('red', 0.5);
      expect(result).toBe('red');
    });

    it('should clamp alpha values to valid range', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const resultLow = colors.setAlpha('red', -0.5);
      const resultHigh = colors.setAlpha('red', 1.5);

      expect(resultLow).toMatch(/hsl\(from red h s l \/ 0\)/);
      expect(resultHigh).toMatch(/hsl\(from red h s l \/ 1\)/);
    });

    it('should handle boundary alpha values', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const resultZero = colors.setAlpha('red', 0);
      const resultOne = colors.setAlpha('red', 1);

      expect(resultZero).toMatch(/hsl\(from red h s l \/ 0\)/);
      expect(resultOne).toMatch(/hsl\(from red h s l \/ 1\)/);
    });
  });

  describe('adjustForLightness', () => {
    it('should return undefined for undefined color', () => {
      expect(colors.adjustForLightness(undefined)).toBeUndefined();
    });

    it('should use color-mix when supported', () => {
      mockColorMix.mockReturnValue(true);

      const result = colors.adjustForLightness('red', 5);
      expect(result).toMatch(/color-mix\(in srgb, red, white 20%\)/);
    });

    it('should return original color when no modern CSS support', () => {
      mockColorMix.mockReturnValue(false);
      mockRelativeColorSyntax.mockReturnValue(false);

      const result = colors.adjustForLightness('red', 5);
      expect(result).toBe('red');
    });

    it('should handle default lightness value', () => {
      mockColorMix.mockReturnValue(true);

      const result = colors.adjustForLightness('red');
      expect(result).toMatch(/color-mix\(in srgb, red, white 20%\)/);
    });

    it('should limit color-mix percentage', () => {
      mockColorMix.mockReturnValue(true);

      const result = colors.adjustForLightness('red', 20); // High value
      expect(result).toMatch(/color-mix\(in srgb, red, white 30%\)/); // Should be limited
    });
  });

  describe('CSS support detection', () => {
    it('should handle missing CSS support gracefully', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(false);

      expect(colors.lighten('red', 0.1)).toBe('red');
      expect(colors.makeTransparent('red', 0.5)).toBe('red');
      expect(colors.makeSolid('red')).toBe('red');
      expect(colors.setAlpha('red', 0.5)).toBe('red');
      expect(colors.adjustForLightness('red', 5)).toBe('red');
    });
  });
});
