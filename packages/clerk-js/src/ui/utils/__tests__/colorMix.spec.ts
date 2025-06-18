import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getColorMix, getColorMixAlpha } from '../colorMix';
import * as cssSupportsModule from '../cssSupports';

// Mock the cssSupports module
vi.mock('../cssSupports', () => ({
  cssSupports: {
    relativeColorSyntax: vi.fn(),
    colorMix: vi.fn(),
  },
}));

describe('colorMix', () => {
  const testColor = '#3b82f6';
  const mockCssSupports = cssSupportsModule.cssSupports as {
    relativeColorSyntax: ReturnType<typeof vi.fn>;
    colorMix: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getColorMix', () => {
    test('should return original color for shade 500', () => {
      const result = getColorMix(testColor, 500);

      expect(result).toBe(testColor);
      // Should not call any CSS feature detection for base shade
      expect(mockCssSupports.relativeColorSyntax).not.toHaveBeenCalled();
      expect(mockCssSupports.colorMix).not.toHaveBeenCalled();
    });

    describe('when relative color syntax is supported', () => {
      beforeEach(() => {
        mockCssSupports.relativeColorSyntax.mockReturnValue(true);
        mockCssSupports.colorMix.mockReturnValue(false);
      });

      test('should use relative color syntax for light shades', () => {
        const testCases = [
          { shade: 100, steps: 5 },
          { shade: 200, steps: 3 },
          { shade: 300, steps: 2 },
          { shade: 400, steps: 1 },
        ] as const;

        testCases.forEach(({ shade, steps }) => {
          const result = getColorMix(testColor, shade);

          expect(result).toBe(`hsl(from ${testColor} h s calc(l + (${steps} * ((97 - l) / 7))))`);
        });
      });

      test('should use relative color syntax for dark shades', () => {
        const testCases = [
          { shade: 600, steps: 1 },
          { shade: 700, steps: 2 },
          { shade: 800, steps: 4 },
          { shade: 900, steps: 6 },
        ] as const;

        testCases.forEach(({ shade, steps }) => {
          const result = getColorMix(testColor, shade);

          expect(result).toBe(`hsl(from ${testColor} h s calc(l - (${steps} * ((l - 12) / 7))))`);
        });
      });
    });

    describe('when color-mix is supported but not relative color syntax', () => {
      beforeEach(() => {
        mockCssSupports.relativeColorSyntax.mockReturnValue(false);
        mockCssSupports.colorMix.mockReturnValue(true);
      });

      test('should use color-mix syntax for all shades', () => {
        const expectedResults = {
          100: `color-mix(in srgb, ${testColor}, white 68%)`,
          200: `color-mix(in srgb, ${testColor}, white 40%)`,
          300: `color-mix(in srgb, ${testColor}, white 26%)`,
          400: `color-mix(in srgb, ${testColor}, white 16%)`,
          500: testColor,
          600: `color-mix(in srgb, ${testColor}, black 12%)`,
          700: `color-mix(in srgb, ${testColor}, black 22%)`,
          800: `color-mix(in srgb, ${testColor}, black 44%)`,
          900: `color-mix(in srgb, ${testColor}, black 65%)`,
        } as const;

        Object.entries(expectedResults).forEach(([shade, expected]) => {
          const result = getColorMix(testColor, Number(shade) as any);
          expect(result).toBe(expected);
        });
      });
    });

    describe('when neither feature is supported', () => {
      beforeEach(() => {
        mockCssSupports.relativeColorSyntax.mockReturnValue(false);
        mockCssSupports.colorMix.mockReturnValue(false);
      });

      test('should return original color as fallback', () => {
        const shades = [100, 200, 300, 400, 600, 700, 800, 900] as const;

        shades.forEach(shade => {
          const result = getColorMix(testColor, shade);
          expect(result).toBe(testColor);
        });
      });
    });

    test('should work with different color formats', () => {
      mockCssSupports.relativeColorSyntax.mockReturnValue(true);

      const colors = ['#ff0000', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)', 'red'];

      colors.forEach(color => {
        const result = getColorMix(color, 100);
        expect(result).toBe(`hsl(from ${color} h s calc(l + (5 * ((97 - l) / 7))))`);
      });
    });
  });

  describe('getColorMixAlpha', () => {
    test('should generate alpha variants using color-mix', () => {
      const expectedResults = {
        100: `color-mix(in srgb, transparent, ${testColor} 7%)`,
        200: `color-mix(in srgb, transparent, ${testColor} 15%)`,
        300: `color-mix(in srgb, transparent, ${testColor} 28%)`,
        400: `color-mix(in srgb, transparent, ${testColor} 41%)`,
        500: `color-mix(in srgb, transparent, ${testColor} 53%)`,
        600: `color-mix(in srgb, transparent, ${testColor} 62%)`,
        700: `color-mix(in srgb, transparent, ${testColor} 73%)`,
        800: `color-mix(in srgb, transparent, ${testColor} 81%)`,
        900: `color-mix(in srgb, transparent, ${testColor} 87%)`,
      };

      Object.entries(expectedResults).forEach(([shade, expected]) => {
        const result = getColorMixAlpha(testColor, Number(shade));
        expect(result).toBe(expected);
      });
    });

    test('should return original color for unknown shade', () => {
      const result = getColorMixAlpha(testColor, 999);
      expect(result).toBe(testColor);
    });

    test('should work with different color formats', () => {
      const colors = ['#ff0000', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)', 'red'];

      colors.forEach(color => {
        const result = getColorMixAlpha(color, 500);
        expect(result).toBe(`color-mix(in srgb, transparent, ${color} 53%)`);
      });
    });
  });

  describe('integration tests', () => {
    test('should prioritize relative color syntax over color-mix when both are supported', () => {
      mockCssSupports.relativeColorSyntax.mockReturnValue(true);
      mockCssSupports.colorMix.mockReturnValue(true);

      const result = getColorMix(testColor, 100);

      expect(result).toBe(`hsl(from ${testColor} h s calc(l + (5 * ((97 - l) / 7))))`);
      expect(mockCssSupports.relativeColorSyntax).toHaveBeenCalled();
      // Should not call colorMix since relativeColorSyntax is supported
    });

    test('should create consistent color scales', () => {
      mockCssSupports.relativeColorSyntax.mockReturnValue(true);

      const baseColor = '#3b82f6';
      const colorScale = [100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => ({
        shade,
        color: getColorMix(baseColor, shade as any),
      }));

      // Base shade should be original
      expect(colorScale.find(c => c.shade === 500)?.color).toBe(baseColor);

      // Light shades should lighten
      [100, 200, 300, 400].forEach(shade => {
        const color = colorScale.find(c => c.shade === shade)?.color;
        expect(color).toContain('calc(l + ');
      });

      // Dark shades should darken
      [600, 700, 800, 900].forEach(shade => {
        const color = colorScale.find(c => c.shade === shade)?.color;
        expect(color).toContain('calc(l - ');
      });
    });

    test('should create alpha scale with increasing opacity', () => {
      const alphaScale = [100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => ({
        shade,
        alpha: getColorMixAlpha(testColor, shade),
      }));

      // Should have increasing opacity percentages
      const opacities = alphaScale.map(({ alpha }) => {
        const match = alpha.match(/(\d+)%\)/);
        return match ? parseInt(match[1]) : 0;
      });

      // Verify opacity increases (approximately)
      for (let i = 1; i < opacities.length; i++) {
        expect(opacities[i]).toBeGreaterThan(opacities[i - 1]);
      }
    });
  });

  describe('edge cases', () => {
    test('should handle empty color string', () => {
      mockCssSupports.relativeColorSyntax.mockReturnValue(true);

      const result = getColorMix('', 100);
      expect(result).toBe('hsl(from  h s calc(l + (5 * ((97 - l) / 7))))');
    });

    test('should handle special CSS color values', () => {
      mockCssSupports.colorMix.mockReturnValue(true);
      mockCssSupports.relativeColorSyntax.mockReturnValue(false);

      const specialColors = ['transparent', 'currentColor', 'inherit'];

      specialColors.forEach(color => {
        const result = getColorMix(color, 200);
        expect(result).toBe(`color-mix(in srgb, ${color}, white 40%)`);
      });
    });
  });
});
