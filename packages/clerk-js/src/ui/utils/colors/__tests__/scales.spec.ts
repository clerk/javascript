import type { ColorScale } from '@clerk/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cssSupports } from '../../cssSupports';
import { generateAlphaScale, generateLightnessScale, legacyScales, modernScales } from '../scales';

// Mock cssSupports
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    hasModernColorSupport: vi.fn(),
    relativeColorSyntax: vi.fn(),
  },
}));

// Get the mocked functions
const mockHasModernColorSupport = vi.mocked(cssSupports.hasModernColorSupport);
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
  hasModernColorSupport: mockHasModernColorSupport,
}));

describe('Color Scales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasModernColorSupport.mockReturnValue(false);
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
      mockHasModernColorSupport.mockReturnValue(true);

      const result = generateAlphaScale('blue');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
    });

    it('should use legacy implementation when modern CSS not supported', () => {
      mockHasModernColorSupport.mockReturnValue(false);

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
      mockHasModernColorSupport.mockReturnValue(true);
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = generateLightnessScale('green');
      expect(result).toBeDefined();
      expect(typeof result['500']).toBe('string');
    });

    it('should use legacy implementation when modern CSS not supported', () => {
      mockHasModernColorSupport.mockReturnValue(false);

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
  });
});
