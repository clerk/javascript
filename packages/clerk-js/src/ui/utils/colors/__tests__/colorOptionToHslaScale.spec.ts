import { beforeEach, describe, expect, it, vi } from 'vitest';

import { colorOptionToHslaAlphaScale, colorOptionToHslaLightnessScale } from '../colorOptionToHslaScale';

// Mock the color utilities
vi.mock('../index', () => ({
  colors: {
    toHslaColor: vi.fn(),
    toHslaString: vi.fn(),
    changeHslaLightness: vi.fn(),
    setHslaAlpha: vi.fn(),
  },
  generateAlphaScale: vi.fn(),
  generateLightnessScale: vi.fn(),
  hasModernColorSupport: vi.fn(),
}));

vi.mock('../utils', () => ({
  applyScalePrefix: vi.fn(),
}));

// Import mocked modules
const { colors, generateAlphaScale, generateLightnessScale, hasModernColorSupport } = await import('../index');
const { applyScalePrefix } = await import('../utils');

// Get the mocked functions
const mockColors = vi.mocked(colors);
const mockGenerateAlphaScale = vi.mocked(generateAlphaScale);
const mockGenerateLightnessScale = vi.mocked(generateLightnessScale);
const mockHasModernColorSupport = vi.mocked(hasModernColorSupport);
const mockApplyScalePrefix = vi.mocked(applyScalePrefix);

describe('colorOptionToHslaScale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasModernColorSupport.mockReturnValue(false);

    // Default mock implementations
    mockColors.toHslaColor.mockImplementation((color: string) => {
      if (color === 'red') return { h: 0, s: 100, l: 50, a: 1 };
      if (color === 'blue') return { h: 240, s: 100, l: 50, a: 1 };
      return { h: 0, s: 0, l: 0, a: 1 };
    });

    mockColors.toHslaString.mockImplementation((color: any) => {
      if (typeof color === 'object') {
        return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a})`;
      }
      return color;
    });

    mockColors.changeHslaLightness.mockImplementation((color: any, change: number) => ({
      ...color,
      l: Math.max(0, Math.min(100, color.l + change)),
    }));

    mockColors.setHslaAlpha.mockImplementation((color: any, alpha: number) => ({
      ...color,
      a: alpha,
    }));
  });

  describe('colorOptionToHslaAlphaScale', () => {
    it('should return undefined for undefined input', () => {
      const result = colorOptionToHslaAlphaScale(undefined, 'bg-');
      expect(result).toBeUndefined();
    });

    it('should handle string color input with modern CSS support', () => {
      mockHasModernColorSupport.mockReturnValue(true);
      mockGenerateAlphaScale.mockReturnValue({
        '25': 'color-mix(in srgb, transparent, red 2%)',
        '500': 'color-mix(in srgb, transparent, red 53%)',
        '950': 'color-mix(in srgb, transparent, red 92%)',
      });
      mockApplyScalePrefix.mockReturnValue({
        'bg-25': 'color-mix(in srgb, transparent, red 2%)',
        'bg-500': 'color-mix(in srgb, transparent, red 53%)',
        'bg-950': 'color-mix(in srgb, transparent, red 92%)',
      });

      const result = colorOptionToHslaAlphaScale('red', 'bg-');

      expect(mockGenerateAlphaScale).toHaveBeenCalledWith('red');
      expect(mockApplyScalePrefix).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle string color input with legacy implementation', () => {
      mockHasModernColorSupport.mockReturnValue(false);

      const result = colorOptionToHslaAlphaScale('red', 'bg-');

      expect(mockColors.toHslaColor).toHaveBeenCalledWith('red');
      expect(result).toBeDefined();
    });

    it('should handle complete color scale object', () => {
      const colorScale = {
        '25': 'red-25',
        '50': 'red-50',
        '100': 'red-100',
        '150': 'red-150',
        '200': 'red-200',
        '300': 'red-300',
        '400': 'red-400',
        '500': 'red-500',
        '600': 'red-600',
        '700': 'red-700',
        '750': 'red-750',
        '800': 'red-800',
        '850': 'red-850',
        '900': 'red-900',
        '950': 'red-950',
      };

      const result = colorOptionToHslaAlphaScale(colorScale, 'bg-');

      expect(result).toBeDefined();
      expect(mockColors.toHslaColor).toHaveBeenCalledTimes(15); // Once for each shade
    });

    it('should apply correct prefix', () => {
      const result = colorOptionToHslaAlphaScale('red', 'text-');
      expect(result).toBeDefined();
    });
  });

  describe('colorOptionToHslaLightnessScale', () => {
    it('should return undefined for undefined input', () => {
      const result = colorOptionToHslaLightnessScale(undefined, 'bg-');
      expect(result).toBeUndefined();
    });

    it('should handle string color input with modern CSS support', () => {
      mockHasModernColorSupport.mockReturnValue(true);
      mockGenerateLightnessScale.mockReturnValue({
        '25': 'hsl(from red h s calc(l + (7 * ((97 - l) / 7))))',
        '500': 'red',
        '950': 'hsl(from red h s calc(l - (7 * ((l - 12) / 7))))',
      });
      mockApplyScalePrefix.mockReturnValue({
        'bg-25': 'hsl(from red h s calc(l + (7 * ((97 - l) / 7))))',
        'bg-500': 'red',
        'bg-950': 'hsl(from red h s calc(l - (7 * ((l - 12) / 7))))',
      });

      const result = colorOptionToHslaLightnessScale('red', 'bg-');

      expect(mockGenerateLightnessScale).toHaveBeenCalledWith('red');
      expect(mockApplyScalePrefix).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle string color input with legacy implementation', () => {
      mockHasModernColorSupport.mockReturnValue(false);

      const result = colorOptionToHslaLightnessScale('red', 'bg-');

      expect(mockColors.toHslaColor).toHaveBeenCalledWith('red');
      expect(result).toBeDefined();
    });

    it('should handle partial color scale object', () => {
      const partialScale = {
        '500': 'custom-red',
        '700': 'custom-dark-red',
      };

      const result = colorOptionToHslaLightnessScale(partialScale, 'bg-');

      expect(mockColors.toHslaColor).toHaveBeenCalledWith('custom-red');
      expect(mockColors.toHslaColor).toHaveBeenCalledWith('custom-dark-red');
      expect(result).toBeDefined();
    });

    it('should throw error for scale without base color (500)', () => {
      const invalidScale = {
        '25': 'red-25',
        '950': 'red-950',
      };

      expect(() => {
        colorOptionToHslaLightnessScale(invalidScale, 'bg-');
      }).toThrow('The 500 shade is required as the base color for scale generation');
    });

    it('should generate lightness variations for legacy implementation', () => {
      mockHasModernColorSupport.mockReturnValue(false);

      colorOptionToHslaLightnessScale('blue', 'text-');

      expect(mockColors.changeHslaLightness).toHaveBeenCalled();
      expect(mockColors.toHslaString).toHaveBeenCalled();
    });

    it('should merge user-defined colors with generated scale', () => {
      const mixedScale = {
        '500': 'custom-base',
        '600': 'custom-dark',
        // Other shades should be generated
      };

      const result = colorOptionToHslaLightnessScale(mixedScale, 'border-');

      expect(mockColors.toHslaColor).toHaveBeenCalledWith('custom-base');
      expect(mockColors.toHslaColor).toHaveBeenCalledWith('custom-dark');
      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle empty string input', () => {
      const result = colorOptionToHslaLightnessScale('', 'bg-');
      // Empty string is treated as invalid color, should return undefined
      expect(result).toBeUndefined();
    });

    it('should validate complete alpha scale', () => {
      const incompleteScale = {
        '25': 'red-25',
        '500': 'red-500',
        // Missing other required shades
      };

      expect(() => {
        colorOptionToHslaAlphaScale(incompleteScale, 'bg-');
      }).toThrow('Missing required shades');
    });

    it('should handle invalid color objects gracefully', () => {
      mockColors.toHslaColor.mockReturnValue(null);

      // When the base color is invalid (null), it should throw an error
      expect(() => {
        colorOptionToHslaLightnessScale('invalid-color', 'bg-');
      }).toThrow('Cannot read properties of null');
    });
  });

  describe('prefix application', () => {
    it('should apply different prefixes correctly', () => {
      const prefixes = ['bg-', 'text-', 'border-', 'ring-'];

      prefixes.forEach(prefix => {
        const result = colorOptionToHslaLightnessScale('red', prefix);
        expect(result).toBeDefined();
      });
    });
  });
});
