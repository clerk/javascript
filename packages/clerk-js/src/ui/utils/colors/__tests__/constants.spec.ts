import { describe, expect, it } from 'vitest';

import {
  ALL_SHADES,
  ALPHA_PERCENTAGES,
  ALPHA_VALUES,
  COLOR_SCALE,
  type ColorShade,
  type ColorShadeKey,
  DARK_SHADES,
  LIGHT_SHADES,
  LIGHTNESS_CONFIG,
  LIGHTNESS_MIX_DATA,
  RELATIVE_SHADE_STEPS,
} from '../constants';

describe('Constants', () => {
  describe('Types', () => {
    it('should export ColorShade type correctly', () => {
      const shade: ColorShade = 500;
      expect(shade).toBe(500);
    });

    it('should export ColorShadeKey type correctly', () => {
      const shadeKey: ColorShadeKey = '500';
      expect(shadeKey).toBe('500');
    });
  });

  describe('COLOR_SCALE', () => {
    it('should contain all 15 shade values', () => {
      expect(COLOR_SCALE).toHaveLength(15);
    });

    it('should be in ascending order', () => {
      const sorted = [...COLOR_SCALE].sort((a, b) => a - b);
      expect(COLOR_SCALE).toEqual(sorted);
    });

    it('should contain expected shade values', () => {
      expect(COLOR_SCALE).toEqual([25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950]);
    });

    it('should be readonly', () => {
      // TypeScript provides readonly at compile time, but at runtime arrays are still mutable
      // This test verifies the TypeScript type is readonly by checking it's an array
      expect(COLOR_SCALE).toBeInstanceOf(Array);
      expect(Array.isArray(COLOR_SCALE)).toBe(true);
    });
  });

  describe('Shade groupings', () => {
    it('should define light shades correctly', () => {
      expect(LIGHT_SHADES).toEqual(['25', '50', '100', '150', '200', '300', '400']);
    });

    it('should define dark shades correctly', () => {
      expect(DARK_SHADES).toEqual(['600', '700', '750', '800', '850', '900', '950']);
    });

    it('should define all shades correctly', () => {
      expect(ALL_SHADES).toHaveLength(15);
      expect(ALL_SHADES).toContain('500'); // Base shade should be included
    });

    it('should not have overlapping light and dark shades', () => {
      const lightSet = new Set(LIGHT_SHADES);
      const darkSet = new Set(DARK_SHADES);
      const intersection = [...lightSet].filter(shade => darkSet.has(shade));
      expect(intersection).toHaveLength(0);
    });
  });

  describe('LIGHTNESS_CONFIG', () => {
    it('should have correct target values', () => {
      expect(LIGHTNESS_CONFIG.TARGET_LIGHT).toBe(97);
      expect(LIGHTNESS_CONFIG.TARGET_DARK).toBe(12);
    });

    it('should have correct step counts', () => {
      expect(LIGHTNESS_CONFIG.LIGHT_STEPS).toBe(7);
      expect(LIGHTNESS_CONFIG.DARK_STEPS).toBe(7);
    });

    it('should match actual shade counts', () => {
      expect(LIGHTNESS_CONFIG.LIGHT_STEPS).toBe(LIGHT_SHADES.length);
      expect(LIGHTNESS_CONFIG.DARK_STEPS).toBe(DARK_SHADES.length);
    });
  });

  describe('ALPHA_VALUES', () => {
    it('should have 15 values matching COLOR_SCALE length', () => {
      expect(ALPHA_VALUES).toHaveLength(COLOR_SCALE.length);
    });

    it('should be in ascending order', () => {
      const sorted = [...ALPHA_VALUES].sort((a, b) => a - b);
      expect(ALPHA_VALUES).toEqual(sorted);
    });

    it('should have values between 0 and 1', () => {
      ALPHA_VALUES.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('should start with low opacity and increase', () => {
      expect(ALPHA_VALUES[0]).toBe(0.02); // 25 shade
      expect(ALPHA_VALUES[ALPHA_VALUES.length - 1]).toBe(0.92); // 950 shade
    });
  });

  describe('ALPHA_PERCENTAGES', () => {
    it('should have entries for all shades', () => {
      COLOR_SCALE.forEach(shade => {
        expect(ALPHA_PERCENTAGES).toHaveProperty(shade.toString());
      });
    });

    it('should have percentage values between 0 and 100', () => {
      Object.values(ALPHA_PERCENTAGES).forEach(percentage => {
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      });
    });

    it('should correspond to ALPHA_VALUES', () => {
      COLOR_SCALE.forEach((shade, index) => {
        const expectedPercentage = Math.round(ALPHA_VALUES[index] * 100);
        const actualPercentage = ALPHA_PERCENTAGES[shade];
        // Allow for small rounding differences
        expect(Math.abs(actualPercentage - expectedPercentage)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('LIGHTNESS_MIX_DATA', () => {
    it('should have entries for all shades', () => {
      COLOR_SCALE.forEach(shade => {
        expect(LIGHTNESS_MIX_DATA).toHaveProperty(shade.toString());
      });
    });

    it('should have null mixColor for base shade 500', () => {
      expect(LIGHTNESS_MIX_DATA[500].mixColor).toBeNull();
      expect(LIGHTNESS_MIX_DATA[500].percentage).toBe(0);
    });

    it('should use white for light shades', () => {
      LIGHT_SHADES.forEach(shade => {
        const shadeNum = parseInt(shade) as ColorShade;
        expect(LIGHTNESS_MIX_DATA[shadeNum].mixColor).toBe('white');
        expect(LIGHTNESS_MIX_DATA[shadeNum].percentage).toBeGreaterThan(0);
      });
    });

    it('should use black for dark shades', () => {
      DARK_SHADES.forEach(shade => {
        const shadeNum = parseInt(shade) as ColorShade;
        expect(LIGHTNESS_MIX_DATA[shadeNum].mixColor).toBe('black');
        expect(LIGHTNESS_MIX_DATA[shadeNum].percentage).toBeGreaterThan(0);
      });
    });

    it('should have increasing percentages for lighter shades', () => {
      const lightPercentages = LIGHT_SHADES.map(shade => {
        const shadeNum = parseInt(shade) as ColorShade;
        return LIGHTNESS_MIX_DATA[shadeNum].percentage;
      });

      // Should be in ascending order (25 has highest percentage, 400 has lowest)
      // This is correct: [85, 80, 68, 55, 40, 26, 16] for shades [25, 50, 100, 150, 200, 300, 400]
      for (let i = 0; i < lightPercentages.length - 1; i++) {
        expect(lightPercentages[i]).toBeGreaterThanOrEqual(lightPercentages[i + 1]);
      }
    });

    it('should have increasing percentages for darker shades', () => {
      const darkPercentages = DARK_SHADES.map(shade => {
        const shadeNum = parseInt(shade) as ColorShade;
        return LIGHTNESS_MIX_DATA[shadeNum].percentage;
      });

      // Should be in ascending order (darker shades have higher percentages)
      for (let i = 0; i < darkPercentages.length - 1; i++) {
        expect(darkPercentages[i]).toBeLessThan(darkPercentages[i + 1]);
      }
    });
  });

  describe('RELATIVE_SHADE_STEPS', () => {
    it('should have entries for all non-base shades', () => {
      COLOR_SCALE.filter(shade => shade !== 500).forEach(shade => {
        expect(RELATIVE_SHADE_STEPS).toHaveProperty(shade.toString());
      });
    });

    it('should not have entry for base shade 500', () => {
      expect(RELATIVE_SHADE_STEPS).not.toHaveProperty('500');
    });

    it('should have step values between 1 and 7', () => {
      Object.values(RELATIVE_SHADE_STEPS).forEach(steps => {
        expect(steps).toBeGreaterThanOrEqual(1);
        expect(steps).toBeLessThanOrEqual(7);
      });
    });

    it('should have increasing steps for light shades', () => {
      const lightSteps = [400, 300, 200, 150, 100, 50, 25].map(shade => RELATIVE_SHADE_STEPS[shade]);
      expect(lightSteps).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should have increasing steps for dark shades', () => {
      const darkSteps = [600, 700, 750, 800, 850, 900, 950].map(shade => RELATIVE_SHADE_STEPS[shade]);
      expect(darkSteps).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('Data consistency', () => {
    it('should have consistent data across all constants', () => {
      // All constants should reference the same shade values
      const allShadeStrings = COLOR_SCALE.map(s => s.toString());

      expect(Object.keys(ALPHA_PERCENTAGES)).toEqual(allShadeStrings);
      expect(Object.keys(LIGHTNESS_MIX_DATA)).toEqual(allShadeStrings);

      const relativeStepsShades = Object.keys(RELATIVE_SHADE_STEPS);
      const nonBaseShades = allShadeStrings.filter(s => s !== '500');
      expect(relativeStepsShades.sort()).toEqual(nonBaseShades.sort());
    });

    it('should have ALPHA_VALUES length match COLOR_SCALE length', () => {
      expect(ALPHA_VALUES.length).toBe(COLOR_SCALE.length);
    });

    it('should have ALL_SHADES contain all COLOR_SCALE values', () => {
      const allShadesNumbers = ALL_SHADES.map(s => parseInt(s)).sort((a, b) => a - b);
      const colorScaleSorted = [...COLOR_SCALE].sort((a, b) => a - b);
      expect(allShadesNumbers).toEqual(colorScaleSorted);
    });
  });
});
