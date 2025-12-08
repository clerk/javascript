import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ColorScale } from '../../../internal/appearance';
import { cssSupports } from '../../cssSupports';
import {
  colorOptionToThemedAlphaScale,
  colorOptionToThemedLightnessScale,
  generateAlphaScale,
  generateLightnessScale,
  legacyScales,
  modernScales,
} from '../scales';

// Mock cssSupports
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    modernColor: vi.fn(),
    relativeColorSyntax: vi.fn(),
  },
}));

// Get the mocked functions
const mockModernColorSupport = vi.mocked(cssSupports.modernColor);
const mockRelativeColorSyntax = vi.mocked(cssSupports.relativeColorSyntax);

vi.mock('../index', () => ({
  colors: {
    toHslaColor: (_color: string) => ({ h: 0, s: 50, l: 50, a: 1 }),
    toHslaString: (color: any) => `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a})`,
    changeHslaLightness: (color: any, change: number) => ({
      ...color,
      l: Math.max(0, Math.min(100, color.l + change)),
    }),
    setHslaAlpha: (color: any, alpha: number) => ({ ...color, a: alpha }),
  },
}));

describe('Color Scales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModernColorSupport.mockReturnValue(false);
    mockRelativeColorSyntax.mockReturnValue(false);
  });

  describe('generateAlphaScale', () => {
    it('should return empty scale for undefined input', () => {
      const result = generateAlphaScale(undefined);
      expect(result).toBeDefined();
      expect(Object.values(result).every(v => v === undefined)).toBe(true);
    });

    it('should return empty scale for null input', () => {
      const result = generateAlphaScale(null as any);
      expect(result).toBeDefined();
      expect(Object.values(result).every(v => v === undefined)).toBe(true);
    });

    it('should generate scale from string color', () => {
      const result = generateAlphaScale('red');
      expect(result).toBeDefined();
      expect(result['25']).toBeDefined();
      expect(result['500']).toBeDefined();
      expect(result['950']).toBeDefined();
    });

    it('should use modern CSS when supported', () => {
      mockModernColorSupport.mockReturnValue(true);

      const result = generateAlphaScale('blue');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
    });

    it('should use legacy implementation when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);

      const result = generateAlphaScale('blue');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
    });

    it('should handle existing color scale input', () => {
      const existingScale: ColorScale<string> = {
        '25': '#ff0000',
        '50': '#ff0000',
        '100': '#ff0000',
        '150': '#ff0000',
        '200': '#ff0000',
        '300': '#ff0000',
        '400': '#ff0000',
        '500': '#ff0000',
        '600': '#ff0000',
        '700': '#ff0000',
        '750': '#ff0000',
        '800': '#ff0000',
        '850': '#ff0000',
        '900': '#ff0000',
        '950': '#ff0000',
      };

      const result = generateAlphaScale(existingScale);
      expect(result).toBeDefined();
      expect(result['500']).toBe('#ff0000');
    });
  });

  describe('generateLightnessScale', () => {
    it('should return empty scale for undefined input', () => {
      const result = generateLightnessScale(undefined);
      expect(result).toBeDefined();
      expect(Object.values(result).every(v => v === undefined)).toBe(true);
    });

    it('should generate scale from string color', () => {
      const result = generateLightnessScale('red');
      expect(result).toBeDefined();
      expect(result['25']).toBeDefined();
      expect(result['500']).toBeDefined();
      expect(result['950']).toBeDefined();
    });

    it('should use modern CSS when supported', () => {
      mockModernColorSupport.mockReturnValue(true);
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = generateLightnessScale('green');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
    });

    it('should use legacy implementation when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);

      const result = generateLightnessScale('green');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
    });

    it('should handle existing color scale input', () => {
      const existingScale: ColorScale<string> = {
        '25': '#00ff00',
        '50': '#00ff00',
        '100': '#00ff00',
        '150': '#00ff00',
        '200': '#00ff00',
        '300': '#00ff00',
        '400': '#00ff00',
        '500': '#00ff00',
        '600': '#00ff00',
        '700': '#00ff00',
        '750': '#00ff00',
        '800': '#00ff00',
        '850': '#00ff00',
        '900': '#00ff00',
        '950': '#00ff00',
      };

      const result = generateLightnessScale(existingScale);
      expect(result).toBeDefined();
      expect(result['500']).toBe('#00ff00');
    });
  });

  describe('modernScales', () => {
    it('should have generateAlphaScale function', () => {
      expect(typeof modernScales.generateAlphaScale).toBe('function');
    });

    it('should have generateLightnessScale function', () => {
      expect(typeof modernScales.generateLightnessScale).toBe('function');
    });

    it('should generate modern alpha scale', () => {
      const result = modernScales.generateAlphaScale('red');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
      expect(result['500']).toContain('color-mix');
    });

    it('should generate modern lightness scale', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = modernScales.generateLightnessScale('red');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
      expect(result['500']).toBe('red'); // 500 should be the original color
    });
  });

  describe('legacyScales', () => {
    it('should have generateAlphaScale function', () => {
      expect(typeof legacyScales.generateAlphaScale).toBe('function');
    });

    it('should have generateLightnessScale function', () => {
      expect(typeof legacyScales.generateLightnessScale).toBe('function');
    });

    it('should generate legacy alpha scale', () => {
      const result = legacyScales.generateAlphaScale('red');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
      expect(result['500']).toContain('hsla');
    });

    it('should generate legacy lightness scale', () => {
      const result = legacyScales.generateLightnessScale('red');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
      expect(result['500']).toContain('hsla');
    });
  });

  describe('scale merging', () => {
    it('should merge user-provided colors with generated scale', () => {
      const userScale: Partial<ColorScale<string>> = {
        '500': '#ff0000',
        '700': '#cc0000',
      };

      const result = generateLightnessScale(userScale as any);
      expect(result['500']).toBe('#ff0000');
      expect(result['700']).toBe('#cc0000');
      expect(result['25']).toBeDefined(); // Should be generated
      expect(result['950']).toBeDefined(); // Should be generated
    });
  });

  describe('input validation', () => {
    it('should handle empty string input', () => {
      const result = generateLightnessScale('');
      expect(result).toBeDefined();
      expect(Object.values(result).every(v => v === undefined)).toBe(true);
    });

    it('should handle invalid color scale object', () => {
      const invalidScale = { notAShade: 'red' };
      const result = generateLightnessScale(invalidScale as any);
      expect(result).toBeDefined();
      expect(Object.values(result).every(v => v === undefined)).toBe(true);
    });

    it('should throw error when color scale object is missing 500 shade', () => {
      const invalidScale = { '25': '#fef2f2', '100': '#fecaca', '600': '#dc2626' };

      expect(() => generateAlphaScale(invalidScale as any)).toThrow('You need to provide at least the 500 shade');
      expect(() => generateLightnessScale(invalidScale as any)).toThrow('You need to provide at least the 500 shade');
    });
  });

  describe('applyScalePrefix', () => {
    // We need to access the internal applyScalePrefix function for testing
    // Since it's now private, we'll test it through the public API
    it('should apply prefix through themed functions', () => {
      mockModernColorSupport.mockReturnValue(true);

      const result = colorOptionToThemedAlphaScale('red', 'bg-');

      expect(result).toBeDefined();
      if (result) {
        expect(Object.keys(result)).toEqual(expect.arrayContaining([expect.stringMatching(/^bg-\d+$/)]));
      }
    });

    it('should skip undefined values in prefixed results', () => {
      mockModernColorSupport.mockReturnValue(false);

      // Empty string results in undefined values that should be filtered out
      const result = colorOptionToThemedLightnessScale('', 'text-');

      expect(result).toBeUndefined();
    });
  });
});

describe('Themed Color Scales', () => {
  describe('colorOptionToThemedAlphaScale', () => {
    it('should return undefined for undefined input', () => {
      const result = colorOptionToThemedAlphaScale(undefined, 'bg-');
      expect(result).toBeUndefined();
    });

    it('should handle string color input', () => {
      mockModernColorSupport.mockReturnValue(true);

      const result = colorOptionToThemedAlphaScale('red', 'bg-');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('bg-500');
    });

    it('should handle color scale object', () => {
      const colorScale = {
        '25': '#fef2f2',
        '50': '#fee2e2',
        '100': '#fecaca',
        '150': '#fca5a5',
        '200': '#f87171',
        '300': '#ef4444',
        '400': '#dc2626',
        '500': '#b91c1c',
        '600': '#991b1b',
        '700': '#7f1d1d',
        '750': '#6b1d1d',
        '800': '#5a1616',
        '850': '#4a1212',
        '900': '#3a0e0e',
        '950': '#2a0a0a',
      };

      const result = colorOptionToThemedAlphaScale(colorScale, 'bg-');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('bg-500');
    });

    it('should apply correct prefix', () => {
      const result = colorOptionToThemedAlphaScale('red', 'text-');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('text-500');
    });
  });

  describe('colorOptionToThemedLightnessScale', () => {
    it('should return undefined for undefined input', () => {
      const result = colorOptionToThemedLightnessScale(undefined, 'bg-');
      expect(result).toBeUndefined();
    });

    it('should handle string color input', () => {
      mockModernColorSupport.mockReturnValue(true);
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = colorOptionToThemedLightnessScale('red', 'bg-');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('bg-500');
    });

    it('should handle partial color scale object', () => {
      const partialScale = {
        '500': '#ef4444',
        '700': '#7f1d1d',
      };

      const result = colorOptionToThemedLightnessScale(partialScale, 'bg-');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('bg-500');
    });

    it('should apply correct prefix', () => {
      const result = colorOptionToThemedLightnessScale('blue', 'text-');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('text-500');
    });

    it('should handle empty string input', () => {
      const result = colorOptionToThemedLightnessScale('', 'bg-');

      // Empty strings are falsy, so the function returns undefined
      expect(result).toBeUndefined();
    });
  });
});
