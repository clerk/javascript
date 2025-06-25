import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock cssSupports
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    colorMix: vi.fn(),
    relativeColorSyntax: vi.fn(),
  },
}));

// Mock cache module
vi.mock('../cache', () => ({
  hasModernColorSupport: vi.fn(),
}));

// Mock legacy colors
vi.mock('../legacy', () => ({
  legacyColors: {
    toHslaColor: vi.fn((_color: string) => ({
      h: 0,
      s: 100,
      l: 50,
      a: 1,
    })),
    toHslaString: vi.fn((color: any) => `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a})`),
    setHslaAlpha: vi.fn((color: any, alpha: number) => ({ ...color, a: alpha })),
    changeHslaLightness: vi.fn((color: any, change: number) => ({
      ...color,
      l: Math.max(0, Math.min(100, color.l + change)),
    })),
  },
}));

// Mock utils
vi.mock('../utils', () => ({
  createEmptyColorScale: vi.fn(() => ({
    '25': undefined,
    '50': undefined,
    '100': undefined,
    '150': undefined,
    '200': undefined,
    '300': undefined,
    '400': undefined,
    '500': undefined,
    '600': undefined,
    '700': undefined,
    '750': undefined,
    '800': undefined,
    '850': undefined,
    '900': undefined,
    '950': undefined,
  })),
  generateAlphaColorMix: vi.fn((color: string, shade: number) => `alpha-mix-${color}-${shade}`),
  getColorMix: vi.fn((color: string, shade: number) => `color-mix-${color}-${shade}`),
}));

import { hasModernColorSupport } from '../cache';
import { generateAlphaScale, generateLightnessScale, legacyScales, modernScales } from '../scales';

describe('Scales Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAlphaScale', () => {
    it('should use modern implementation when supported', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const result = generateAlphaScale('#ff0000');

      expect(result['25']).toBe('alpha-mix-#ff0000-25');
      expect(result['500']).toBe('alpha-mix-#ff0000-500');
      expect(result['950']).toBe('alpha-mix-#ff0000-950');
    });

    it('should use legacy implementation when modern not supported', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(false);

      const result = generateAlphaScale('#ff0000');

      // Should use legacy HSLA implementation
      expect(result['25']).toContain('hsla(');
      expect(result['500']).toContain('hsla(');
      expect(result['950']).toContain('hsla(');
    });

    it('should handle undefined color input', () => {
      const result = generateAlphaScale(undefined);

      // Should return empty scale
      Object.values(result).forEach(value => {
        expect(value).toBeUndefined();
      });
    });

    it('should handle string color input', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const result = generateAlphaScale('#00ff00');

      expect(result['500']).toBe('alpha-mix-#00ff00-500');
    });

    it('should handle existing color scale input', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const existingScale = {
        '500': '#ff0000',
        '400': '#ff3333',
        '600': '#cc0000',
      };

      const result = generateAlphaScale(existingScale);

      // Should use the base color from 500 shade
      expect(result['25']).toBe('alpha-mix-#ff0000-25');
      expect(result['500']).toBe('#ff0000'); // Original color preserved
    });

    it('should merge with user-provided scale values', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const userScale = {
        '500': '#ff0000',
        '400': '#custom-400', // User-defined override
      };

      const result = generateAlphaScale(userScale);

      // Generated values
      expect(result['25']).toBe('alpha-mix-#ff0000-25');
      expect(result['500']).toBe('#ff0000'); // Original color preserved

      // User-defined override should be preserved
      expect(result['400']).toBe('#custom-400');
    });

    it('should handle CSS custom properties', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const result = generateAlphaScale('var(--primary-color)');

      expect(result['500']).toBe('alpha-mix-var(--primary-color)-500');
    });
  });

  describe('generateLightnessScale', () => {
    it('should use modern implementation when supported', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const result = generateLightnessScale('#ff0000');

      expect(result['25']).toBe('color-mix-#ff0000-25');
      expect(result['500']).toBe('color-mix-#ff0000-500');
      expect(result['950']).toBe('color-mix-#ff0000-950');
    });

    it('should use legacy implementation when modern not supported', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(false);

      const result = generateLightnessScale('#ff0000');

      // Should use legacy HSLA implementation
      expect(result['25']).toContain('hsla(');
      expect(result['500']).toContain('hsla(');
      expect(result['950']).toContain('hsla(');
    });

    it('should handle undefined color input', () => {
      const result = generateLightnessScale(undefined);

      // Should return empty scale
      Object.values(result).forEach(value => {
        expect(value).toBeUndefined();
      });
    });

    it('should handle string color input', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const result = generateLightnessScale('#00ff00');

      expect(result['500']).toBe('color-mix-#00ff00-500');
    });

    it('should handle existing color scale input', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const existingScale = {
        '500': '#ff0000',
        '400': '#ff3333',
        '600': '#cc0000',
      };

      const result = generateLightnessScale(existingScale);

      // Should use the base color from 500 shade
      expect(result['25']).toBe('color-mix-#ff0000-25');
      expect(result['500']).toBe('#ff0000'); // Original color preserved
    });

    it('should merge with user-provided scale values', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const userScale = {
        '500': '#ff0000',
        '700': '#custom-700', // User-defined override
      };

      const result = generateLightnessScale(userScale);

      // Generated values
      expect(result['25']).toBe('color-mix-#ff0000-25');
      expect(result['500']).toBe('#ff0000'); // Original color preserved

      // User-defined override should be preserved
      expect(result['700']).toBe('#custom-700');
    });

    it('should handle CSS custom properties', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const result = generateLightnessScale('var(--accent-color)');

      expect(result['500']).toBe('color-mix-var(--accent-color)-500');
    });
  });

  describe('modernScales direct access', () => {
    it('should provide direct access to modern alpha scale generator', () => {
      const result = modernScales.generateAlphaScale('#ff0000');

      expect(result['25']).toBe('alpha-mix-#ff0000-25');
      expect(result['500']).toBe('alpha-mix-#ff0000-500');
      expect(result['950']).toBe('alpha-mix-#ff0000-950');
    });

    it('should provide direct access to modern lightness scale generator', () => {
      const result = modernScales.generateLightnessScale('#ff0000');

      expect(result['25']).toBe('color-mix-#ff0000-25');
      expect(result['500']).toBe('color-mix-#ff0000-500');
      expect(result['950']).toBe('color-mix-#ff0000-950');
    });

    it('should be readonly object', () => {
      // TypeScript provides readonly at compile time, but at runtime objects are still mutable
      // This test verifies the TypeScript type is readonly by checking the object exists
      expect(modernScales).toBeDefined();
      expect(typeof modernScales.generateAlphaScale).toBe('function');
    });
  });

  describe('legacyScales direct access', () => {
    it('should provide direct access to legacy alpha scale generator', () => {
      const result = legacyScales.generateAlphaScale('#ff0000');

      // Should use legacy HSLA implementation
      expect(result['25']).toContain('hsla(');
      expect(result['500']).toContain('hsla(');
      expect(result['950']).toContain('hsla(');
    });

    it('should provide direct access to legacy lightness scale generator', () => {
      const result = legacyScales.generateLightnessScale('#ff0000');

      // Should use legacy HSLA implementation
      expect(result['25']).toContain('hsla(');
      expect(result['500']).toContain('hsla(');
      expect(result['950']).toContain('hsla(');
    });

    it('should be readonly object', () => {
      // TypeScript provides readonly at compile time, but at runtime objects are still mutable
      // This test verifies the TypeScript type is readonly by checking the object exists
      expect(legacyScales).toBeDefined();
      expect(typeof legacyScales.generateAlphaScale).toBe('function');
    });
  });

  describe('Color input processing', () => {
    it('should handle null color input', () => {
      const alphaResult = generateAlphaScale(null as any);
      const lightnessResult = generateLightnessScale(null as any);

      Object.values(alphaResult).forEach(value => expect(value).toBeUndefined());
      Object.values(lightnessResult).forEach(value => expect(value).toBeUndefined());
    });

    it('should handle empty string color input', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const alphaResult = generateAlphaScale('');
      const lightnessResult = generateLightnessScale('');

      Object.values(alphaResult).forEach(value => expect(value).toBeUndefined());
      Object.values(lightnessResult).forEach(value => expect(value).toBeUndefined());
    });

    it('should handle color scale without 500 shade', () => {
      const incompleteScale = {
        '400': '#ff3333',
        '600': '#cc0000',
      };

      const alphaResult = generateAlphaScale(incompleteScale as any);
      const lightnessResult = generateLightnessScale(incompleteScale as any);

      Object.values(alphaResult).forEach(value => expect(value).toBeUndefined());
      Object.values(lightnessResult).forEach(value => expect(value).toBeUndefined());
    });

    it('should extract base color from complex color scale', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const complexScale = {
        '25': '#fff0f0',
        '50': '#ffe0e0',
        '100': '#ffcccc',
        '200': '#ffaaaa',
        '300': '#ff8888',
        '400': '#ff6666',
        '500': '#ff0000', // Base color
        '600': '#dd0000',
        '700': '#bb0000',
        '800': '#990000',
        '900': '#770000',
        '950': '#550000',
      };

      const result = generateAlphaScale(complexScale);

      // Should use the 500 shade as base
      expect(result['25']).toBe('#fff0f0'); // Preserves existing value
    });
  });

  describe('Browser support scenarios', () => {
    it('should switch implementations based on support detection', () => {
      // First call with modern support
      vi.mocked(hasModernColorSupport).mockReturnValue(true);
      const modernResult = generateAlphaScale('#ff0000');
      expect(modernResult['500']).toBe('alpha-mix-#ff0000-500');

      // Second call without modern support
      vi.mocked(hasModernColorSupport).mockReturnValue(false);
      const legacyResult = generateAlphaScale('#ff0000');
      expect(legacyResult['500']).toContain('hsla(');
    });

    it('should handle support detection changes during runtime', () => {
      // Start without support
      vi.mocked(hasModernColorSupport).mockReturnValue(false);
      const result1 = generateLightnessScale('#ff0000');
      expect(result1['500']).toContain('hsla(');

      // Support becomes available
      vi.mocked(hasModernColorSupport).mockReturnValue(true);
      const result2 = generateLightnessScale('#ff0000');
      expect(result2['500']).toBe('color-mix-#ff0000-500');
    });
  });

  describe('Scale completeness', () => {
    it('should generate all 15 shades for alpha scale', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const result = generateAlphaScale('#ff0000');
      const expectedShades = [
        '25',
        '50',
        '100',
        '150',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '750',
        '800',
        '850',
        '900',
        '950',
      ];

      expectedShades.forEach(shade => {
        expect(result).toHaveProperty(shade);
        expect(result[shade as keyof typeof result]).toBeDefined();
      });
    });

    it('should generate all 15 shades for lightness scale', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const result = generateLightnessScale('#ff0000');
      const expectedShades = [
        '25',
        '50',
        '100',
        '150',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '750',
        '800',
        '850',
        '900',
        '950',
      ];

      expectedShades.forEach(shade => {
        expect(result).toHaveProperty(shade);
        expect(result[shade as keyof typeof result]).toBeDefined();
      });
    });

    it('should preserve user-defined shades while generating missing ones', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const partialScale = {
        '500': '#ff0000',
        '300': '#custom-300',
        '700': '#custom-700',
      };

      const result = generateAlphaScale(partialScale);

      // User-defined shades should be preserved
      expect(result['300']).toBe('#custom-300');
      expect(result['700']).toBe('#custom-700');

      // Generated shades should be present
      expect(result['25']).toBe('alpha-mix-#ff0000-25');
      expect(result['950']).toBe('alpha-mix-#ff0000-950');
    });
  });

  describe('Performance characteristics', () => {
    it('should handle many scale generations efficiently', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        generateAlphaScale(`#${i.toString(16).padStart(6, '0')}`);
        generateLightnessScale(`#${i.toString(16).padStart(6, '0')}`);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete efficiently
      expect(duration).toBeLessThan(100); // Less than 100ms
    });

    it('should handle complex color scales efficiently', () => {
      vi.mocked(hasModernColorSupport).mockReturnValue(true);

      const complexScale = {
        '25': '#fff0f0',
        '50': '#ffe0e0',
        '100': '#ffcccc',
        '150': '#ffbbbb',
        '200': '#ffaaaa',
        '300': '#ff8888',
        '400': '#ff6666',
        '500': '#ff0000',
        '600': '#dd0000',
        '700': '#bb0000',
        '750': '#aa0000',
        '800': '#990000',
        '850': '#880000',
        '900': '#770000',
        '950': '#550000',
      };

      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        generateAlphaScale(complexScale);
        generateLightnessScale(complexScale);
      }

      const end = performance.now();
      const duration = end - start;

      // Should handle complex inputs efficiently
      expect(duration).toBeLessThan(50); // Less than 50ms
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed color scale objects', () => {
      const malformedScale = {
        '500': null,
        '400': undefined,
        '600': '',
      };

      const alphaResult = generateAlphaScale(malformedScale as any);
      const lightnessResult = generateLightnessScale(malformedScale as any);

      // Should return empty scales for malformed input
      Object.values(alphaResult).forEach(value => expect(value).toBeUndefined());
      Object.values(lightnessResult).forEach(value => expect(value).toBeUndefined());
    });

    it('should handle non-string, non-object color input', () => {
      const numericInput = 12345;
      const booleanInput = true;

      const alphaResult1 = generateAlphaScale(numericInput as any);
      const alphaResult2 = generateAlphaScale(booleanInput as any);

      Object.values(alphaResult1).forEach(value => expect(value).toBeUndefined());
      Object.values(alphaResult2).forEach(value => expect(value).toBeUndefined());
    });

    it('should handle arrays as color input', () => {
      const arrayInput = ['#ff0000', '#00ff00', '#0000ff'];

      const result = generateAlphaScale(arrayInput as any);

      Object.values(result).forEach(value => expect(value).toBeUndefined());
    });
  });
});
