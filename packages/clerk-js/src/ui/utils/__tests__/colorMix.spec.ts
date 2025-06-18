import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getColorMix, getColorMixAlpha } from '../colors/utils';
import { cssSupports } from '../cssSupports';

const mockRelativeColorSyntax = vi.spyOn(cssSupports, 'relativeColorSyntax');
const mockColorMix = vi.spyOn(cssSupports, 'colorMix');

type ColorShade = 25 | 50 | 100 | 150 | 200 | 300 | 400 | 500 | 600 | 700 | 750 | 800 | 850 | 900 | 950;

const ALL_SHADES: ColorShade[] = [25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950];

describe('colorMix', () => {
  const testColor = '#3b82f6';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getColorMix', () => {
    test('should return original color for shade 500', () => {
      const result = getColorMix(testColor, 500);
      expect(result).toBe(testColor);

      expect(mockRelativeColorSyntax).not.toHaveBeenCalled();
      expect(mockColorMix).not.toHaveBeenCalled();
    });

    describe('when relative color syntax is supported', () => {
      beforeEach(() => {
        mockRelativeColorSyntax.mockReturnValue(true);
        mockColorMix.mockReturnValue(false);
      });

      test('should use relative color syntax for light shades', () => {
        const testCases = [
          { shade: 400, steps: 1 },
          { shade: 300, steps: 2 },
          { shade: 200, steps: 3 },
          { shade: 150, steps: 4 },
          { shade: 100, steps: 5 },
          { shade: 50, steps: 6 },
          { shade: 25, steps: 7 },
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
          { shade: 750, steps: 3 },
          { shade: 800, steps: 4 },
          { shade: 850, steps: 5 },
          { shade: 900, steps: 6 },
          { shade: 950, steps: 7 },
        ] as const;

        testCases.forEach(({ shade, steps }) => {
          const result = getColorMix(testColor, shade);

          expect(result).toBe(`hsl(from ${testColor} h s calc(l - (${steps} * ((l - 12) / 7))))`);
        });
      });
    });

    describe('when color-mix is supported but not relative color syntax', () => {
      beforeEach(() => {
        mockRelativeColorSyntax.mockReturnValue(false);
        mockColorMix.mockReturnValue(true);
      });

      test('should use color-mix syntax for all shades', () => {
        const expectedResults: Record<ColorShade, string> = {
          25: `color-mix(in srgb, ${testColor}, white 85%)`,
          50: `color-mix(in srgb, ${testColor}, white 80%)`,
          100: `color-mix(in srgb, ${testColor}, white 68%)`,
          150: `color-mix(in srgb, ${testColor}, white 55%)`,
          200: `color-mix(in srgb, ${testColor}, white 40%)`,
          300: `color-mix(in srgb, ${testColor}, white 26%)`,
          400: `color-mix(in srgb, ${testColor}, white 16%)`,
          500: testColor,
          600: `color-mix(in srgb, ${testColor}, black 12%)`,
          700: `color-mix(in srgb, ${testColor}, black 22%)`,
          750: `color-mix(in srgb, ${testColor}, black 30%)`,
          800: `color-mix(in srgb, ${testColor}, black 44%)`,
          850: `color-mix(in srgb, ${testColor}, black 55%)`,
          900: `color-mix(in srgb, ${testColor}, black 65%)`,
          950: `color-mix(in srgb, ${testColor}, black 75%)`,
        };

        Object.entries(expectedResults).forEach(([shade, expected]) => {
          const result = getColorMix(testColor, Number(shade) as ColorShade);
          expect(result).toBe(expected);
        });
      });
    });

    describe('when neither feature is supported', () => {
      beforeEach(() => {
        mockRelativeColorSyntax.mockReturnValue(false);
        mockColorMix.mockReturnValue(false);
      });

      test('should return original color as fallback', () => {
        const shades = ALL_SHADES.filter(s => s !== 500);

        shades.forEach(shade => {
          const result = getColorMix(testColor, shade);
          expect(result).toBe(testColor);
        });
      });
    });

    test('should work with different color formats', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const colors = ['#ff0000', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)', 'red'];

      colors.forEach(color => {
        const result = getColorMix(color, 100);
        expect(result).toBe(`hsl(from ${color} h s calc(l + (5 * ((97 - l) / 7))))`);
      });
    });
  });

  describe('getColorMixAlpha', () => {
    test('should generate alpha variants using color-mix', () => {
      const expectedResults: Record<ColorShade, string> = {
        25: `color-mix(in srgb, transparent, ${testColor} 2%)`,
        50: `color-mix(in srgb, transparent, ${testColor} 3%)`,
        100: `color-mix(in srgb, transparent, ${testColor} 7%)`,
        150: `color-mix(in srgb, transparent, ${testColor} 11%)`,
        200: `color-mix(in srgb, transparent, ${testColor} 15%)`,
        300: `color-mix(in srgb, transparent, ${testColor} 28%)`,
        400: `color-mix(in srgb, transparent, ${testColor} 41%)`,
        500: `color-mix(in srgb, transparent, ${testColor} 53%)`,
        600: `color-mix(in srgb, transparent, ${testColor} 62%)`,
        700: `color-mix(in srgb, transparent, ${testColor} 73%)`,
        750: `color-mix(in srgb, transparent, ${testColor} 78%)`,
        800: `color-mix(in srgb, transparent, ${testColor} 81%)`,
        850: `color-mix(in srgb, transparent, ${testColor} 84%)`,
        900: `color-mix(in srgb, transparent, ${testColor} 87%)`,
        950: `color-mix(in srgb, transparent, ${testColor} 92%)`,
      };

      Object.entries(expectedResults).forEach(([shade, expected]) => {
        const result = getColorMixAlpha(testColor, Number(shade) as ColorShade);
        expect(result).toBe(expected);
      });
    });

    test('should return original color for unknown shade', () => {
      // Using a shade that doesn't exist in ColorShade type, we need to cast it
      const result = getColorMixAlpha(testColor, 999 as any);
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
      mockRelativeColorSyntax.mockReturnValue(true);
      mockColorMix.mockReturnValue(true);

      const result = getColorMix(testColor, 100);

      expect(result).toBe(`hsl(from ${testColor} h s calc(l + (5 * ((97 - l) / 7))))`);
      expect(mockRelativeColorSyntax).toHaveBeenCalled();
      // Should not call colorMix since relativeColorSyntax is supported
    });

    test('should create consistent color scales', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const baseColor = '#3b82f6';
      const colorScale = ALL_SHADES.map(shade => ({
        shade,
        color: getColorMix(baseColor, shade),
      }));

      // Base shade should be original
      expect(colorScale.find(c => c.shade === 500)?.color).toBe(baseColor);

      // Light shades should lighten
      ALL_SHADES.filter(s => s < 500).forEach(shade => {
        const color = colorScale.find(c => c.shade === shade)?.color;
        expect(color).toContain('calc(l + ');
      });

      // Dark shades should darken
      ALL_SHADES.filter(s => s > 500).forEach(shade => {
        const color = colorScale.find(c => c.shade === shade)?.color;
        expect(color).toContain('calc(l - ');
      });
    });

    test('should create alpha scale with increasing opacity', () => {
      const alphaScale = ALL_SHADES.map(shade => ({
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
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = getColorMix('', 100);
      expect(result).toBe('hsl(from  h s calc(l + (5 * ((97 - l) / 7))))');
    });

    test('should handle special CSS color values', () => {
      mockColorMix.mockReturnValue(true);
      mockRelativeColorSyntax.mockReturnValue(false);

      const specialColors = ['transparent', 'currentColor', 'inherit'];

      specialColors.forEach(color => {
        const result = getColorMix(color, 200);
        expect(result).toBe(`color-mix(in srgb, ${color}, white 40%)`);
      });
    });
  });
});
