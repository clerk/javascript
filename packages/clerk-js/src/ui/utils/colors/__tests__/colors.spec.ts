import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock cssSupports for testing
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    colorMix: vi.fn(),
    relativeColorSyntax: vi.fn(),
  },
}));

import { cssSupports } from '../../cssSupports';
import { clearMemoCache } from '../cache';
import { colors, hasModernColorSupport, legacyColors, modernColors } from '../index';

describe('Colors API', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearMemoCache();
    vi.clearAllMocks();
  });

  describe('Unified API', () => {
    it('should maintain the same interface as legacy colors', () => {
      expect(colors).toHaveProperty('lighten');
      expect(colors).toHaveProperty('makeTransparent');
      expect(colors).toHaveProperty('makeSolid');
      expect(colors).toHaveProperty('setAlpha');
      expect(colors).toHaveProperty('adjustForLightness');
      expect(colors).toHaveProperty('toHslaColor');
      expect(colors).toHaveProperty('toHslaString');
      expect(colors).toHaveProperty('changeHslaLightness');
      expect(colors).toHaveProperty('setHslaAlpha');
    });

    it('should use modern implementation when supported', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(true);

      const result = colors.lighten('#ff0000', 0.2);

      // Should return modern CSS syntax
      expect(result).toContain('calc(l +');
    });

    it('should fallback to legacy implementation when modern CSS not supported', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);

      const result = colors.lighten('#ff0000', 0.2);

      // Should return HSLA color string or fallback to original
      expect(result).toBeDefined();
    });
  });

  describe('Modern Colors', () => {
    it('should generate relative color syntax when supported', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(true);
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);

      const result = modernColors.lighten('#ff0000', 0.2);
      expect(result).toContain('hsl(from #ff0000 h s calc(l + 20%))');
    });

    it('should generate color-mix syntax when relative color not supported', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);

      const result = modernColors.lighten('#ff0000', 0.2);
      expect(result).toContain('color-mix(in srgb, #ff0000, white 20%)');
    });

    it('should handle transparency with color-mix', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);

      const result = modernColors.makeTransparent('#ff0000', 0.5);
      expect(result).toContain('color-mix(in srgb, transparent, #ff0000 50%)');
    });

    it('should handle alpha setting with relative color syntax', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(true);

      const result = modernColors.setAlpha('#ff0000', 0.8);
      expect(result).toContain('hsl(from #ff0000 h s l / 0.8)');
    });

    it('should return original color when no modern CSS support', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);

      const result = modernColors.lighten('#ff0000', 0.2);
      expect(result).toBe('#ff0000');
    });
  });

  describe('Legacy Colors', () => {
    it('should provide access to legacy implementation', () => {
      expect(legacyColors).toHaveProperty('lighten');
      expect(legacyColors).toHaveProperty('makeTransparent');
      expect(legacyColors).toHaveProperty('makeSolid');
      expect(legacyColors).toHaveProperty('setAlpha');
      expect(legacyColors).toHaveProperty('adjustForLightness');
    });

    it('should convert colors to HSLA strings', () => {
      const result = legacyColors.lighten('#ff0000', 0.2);
      expect(result).toContain('hsla(');
    });
  });

  describe('Browser Support Detection', () => {
    it('should detect modern CSS support', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);

      expect(hasModernColorSupport()).toBe(true);
    });

    it('should detect lack of modern CSS support', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);

      expect(hasModernColorSupport()).toBe(false);
    });
  });

  describe('Color Input Handling', () => {
    it('should handle undefined colors gracefully', () => {
      expect(colors.lighten(undefined, 0.2)).toBeUndefined();
      expect(colors.makeTransparent(undefined, 0.5)).toBeUndefined();
      expect(colors.makeSolid(undefined)).toBeUndefined();
      expect(colors.adjustForLightness(undefined, 5)).toBeUndefined();
    });

    it('should handle empty string colors', () => {
      expect(colors.makeTransparent('', 0.5)).toBeUndefined();
      expect(colors.setAlpha('', 0.8)).toBe('');
    });

    it('should clamp alpha values', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(true);

      const tooHigh = modernColors.setAlpha('#ff0000', 2);
      expect(tooHigh).toContain('/ 1)');

      const tooLow = modernColors.setAlpha('#ff0000', -0.5);
      expect(tooLow).toContain('/ 0)');
    });
  });

  describe('CSS Variable Support', () => {
    it('should work with CSS custom properties', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);

      const result = modernColors.makeTransparent('var(--primary-color)', 0.3);
      expect(result).toContain('color-mix(in srgb, transparent, var(--primary-color) 70%)');
    });

    it('should work with CSS custom properties in relative color syntax', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(true);

      const result = modernColors.lighten('var(--primary-color)', 0.1);
      expect(result).toContain('hsl(from var(--primary-color) h s calc(l + 10%))');
    });
  });
});
