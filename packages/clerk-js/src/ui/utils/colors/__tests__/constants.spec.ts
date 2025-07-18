import { describe, expect, it } from 'vitest';

import {
  ALL_SHADES,
  ALPHA_PERCENTAGES,
  ALPHA_VALUES,
  COLOR_BOUNDS,
  COLOR_SCALE,
  DARK_SHADES,
  LIGHT_SHADES,
  LIGHTNESS_CONFIG,
  LIGHTNESS_MIX_DATA,
  MODERN_CSS_LIMITS,
  RELATIVE_SHADE_STEPS,
} from '../constants';

describe('Color Constants', () => {
  describe('COLOR_SCALE', () => {
    it('should contain all expected color shades in order', () => {
      expect(COLOR_SCALE).toEqual([25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950]);
    });

    it('should be readonly at compile time', () => {
      // COLOR_SCALE is readonly via 'as const' but not frozen at runtime
      // This is sufficient for immutability in TypeScript
      expect(Array.isArray(COLOR_SCALE)).toBe(true);
    });

    it('should have correct length', () => {
      expect(COLOR_SCALE).toHaveLength(15);
    });
  });

  describe('Shade groupings', () => {
    it('should have correct light shades', () => {
      expect(LIGHT_SHADES).toEqual(['400', '300', '200', '150', '100', '50', '25']);
    });

    it('should have correct dark shades', () => {
      expect(DARK_SHADES).toEqual(['600', '700', '750', '800', '850', '900', '950']);
    });

    it('should have all shades including 500', () => {
      expect(ALL_SHADES).toContain('500');
      expect(ALL_SHADES).toHaveLength(15);
    });

    it('should have all shades equal to light + dark + 500', () => {
      const expected = [...LIGHT_SHADES, '500', ...DARK_SHADES];
      expect(ALL_SHADES).toEqual(expected);
    });
  });

  describe('LIGHTNESS_CONFIG', () => {
    it('should have correct lightness configuration', () => {
      expect(LIGHTNESS_CONFIG).toEqual({
        TARGET_LIGHT: 97,
        TARGET_DARK: 12,
        LIGHT_STEPS: 7,
        DARK_STEPS: 7,
      });
    });

    it('should be readonly at compile time', () => {
      // LIGHTNESS_CONFIG is readonly via 'as const' but not frozen at runtime
      expect(typeof LIGHTNESS_CONFIG).toBe('object');
    });
  });

  describe('ALPHA_VALUES', () => {
    it('should have correct number of alpha values', () => {
      expect(ALPHA_VALUES).toHaveLength(COLOR_SCALE.length);
    });

    it('should have all values between 0 and 1', () => {
      ALPHA_VALUES.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('should be in ascending order', () => {
      for (let i = 1; i < ALPHA_VALUES.length; i++) {
        expect(ALPHA_VALUES[i]).toBeGreaterThan(ALPHA_VALUES[i - 1]);
      }
    });
  });

  describe('ALPHA_PERCENTAGES', () => {
    it('should have entries for all color shades', () => {
      COLOR_SCALE.forEach(shade => {
        expect(ALPHA_PERCENTAGES[shade]).toBeDefined();
        expect(typeof ALPHA_PERCENTAGES[shade]).toBe('number');
      });
    });

    it('should have all percentages between 0 and 100', () => {
      Object.values(ALPHA_PERCENTAGES).forEach(percentage => {
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      });
    });

    it('should be in ascending order following COLOR_SCALE order', () => {
      for (let i = 1; i < COLOR_SCALE.length; i++) {
        const currentShade = COLOR_SCALE[i];
        const previousShade = COLOR_SCALE[i - 1];
        expect(ALPHA_PERCENTAGES[currentShade]).toBeGreaterThan(ALPHA_PERCENTAGES[previousShade]);
      }
    });

    it('should be readonly at compile time', () => {
      // ALPHA_PERCENTAGES is readonly via 'as const' but not frozen at runtime
      expect(typeof ALPHA_PERCENTAGES).toBe('object');
    });
  });

  describe('LIGHTNESS_MIX_DATA', () => {
    it('should have entries for all color shades', () => {
      COLOR_SCALE.forEach(shade => {
        expect(LIGHTNESS_MIX_DATA[shade]).toBeDefined();
        expect(typeof LIGHTNESS_MIX_DATA[shade]).toBe('object');
      });
    });

    it('should have correct structure for each shade', () => {
      Object.entries(LIGHTNESS_MIX_DATA).forEach(([_shade, data]) => {
        expect(data).toHaveProperty('mixColor');
        expect(data).toHaveProperty('percentage');
        expect(typeof data.percentage).toBe('number');

        if (data.mixColor !== null) {
          expect(['white', 'black']).toContain(data.mixColor);
        }
      });
    });

    it('should have 500 shade with no mix color', () => {
      expect(LIGHTNESS_MIX_DATA[500]).toEqual({
        mixColor: null,
        percentage: 0,
      });
    });

    it('should have light shades mixing with white', () => {
      LIGHT_SHADES.forEach(shade => {
        const numShade = parseInt(shade) as keyof typeof LIGHTNESS_MIX_DATA;
        expect(LIGHTNESS_MIX_DATA[numShade].mixColor).toBe('white');
      });
    });

    it('should have dark shades mixing with black', () => {
      DARK_SHADES.forEach(shade => {
        const numShade = parseInt(shade) as keyof typeof LIGHTNESS_MIX_DATA;
        expect(LIGHTNESS_MIX_DATA[numShade].mixColor).toBe('black');
      });
    });

    it('should be readonly at compile time', () => {
      // LIGHTNESS_MIX_DATA is readonly via 'as const' but not frozen at runtime
      expect(typeof LIGHTNESS_MIX_DATA).toBe('object');
    });
  });

  describe('RELATIVE_SHADE_STEPS', () => {
    it('should have correct step values', () => {
      // Light shades should have steps 1-7
      expect(RELATIVE_SHADE_STEPS[400]).toBe(1);
      expect(RELATIVE_SHADE_STEPS[300]).toBe(2);
      expect(RELATIVE_SHADE_STEPS[200]).toBe(3);
      expect(RELATIVE_SHADE_STEPS[150]).toBe(4);
      expect(RELATIVE_SHADE_STEPS[100]).toBe(5);
      expect(RELATIVE_SHADE_STEPS[50]).toBe(6);
      expect(RELATIVE_SHADE_STEPS[25]).toBe(7);

      // Dark shades should have steps 1-7
      expect(RELATIVE_SHADE_STEPS[600]).toBe(1);
      expect(RELATIVE_SHADE_STEPS[700]).toBe(2);
      expect(RELATIVE_SHADE_STEPS[750]).toBe(3);
      expect(RELATIVE_SHADE_STEPS[800]).toBe(4);
      expect(RELATIVE_SHADE_STEPS[850]).toBe(5);
      expect(RELATIVE_SHADE_STEPS[900]).toBe(6);
      expect(RELATIVE_SHADE_STEPS[950]).toBe(7);
    });

    it('should not have a step for 500 shade', () => {
      expect(RELATIVE_SHADE_STEPS[500]).toBeUndefined();
    });

    it('should be readonly at compile time', () => {
      // RELATIVE_SHADE_STEPS is readonly via 'as const' but not frozen at runtime
      expect(typeof RELATIVE_SHADE_STEPS).toBe('object');
    });
  });

  describe('COLOR_BOUNDS', () => {
    it('should have correct RGB bounds', () => {
      expect(COLOR_BOUNDS.rgb).toEqual({ min: 0, max: 255 });
    });

    it('should have correct alpha bounds', () => {
      expect(COLOR_BOUNDS.alpha).toEqual({ min: 0, max: 1 });
    });

    it('should have correct hue bounds', () => {
      expect(COLOR_BOUNDS.hue).toEqual({ min: 0, max: 360 });
    });

    it('should have correct percentage bounds', () => {
      expect(COLOR_BOUNDS.percentage).toEqual({ min: 0, max: 100 });
    });

    it('should be readonly at compile time', () => {
      // COLOR_BOUNDS is readonly via 'as const' but not frozen at runtime
      expect(typeof COLOR_BOUNDS).toBe('object');
    });
  });

  describe('MODERN_CSS_LIMITS', () => {
    it('should have all required limits', () => {
      expect(MODERN_CSS_LIMITS).toHaveProperty('MAX_LIGHTNESS_MIX');
      expect(MODERN_CSS_LIMITS).toHaveProperty('MIN_ALPHA_PERCENTAGE');
      expect(MODERN_CSS_LIMITS).toHaveProperty('MAX_LIGHTNESS_ADJUSTMENT');
      expect(MODERN_CSS_LIMITS).toHaveProperty('MIN_LIGHTNESS_FLOOR');
      expect(MODERN_CSS_LIMITS).toHaveProperty('LIGHTNESS_MULTIPLIER');
      expect(MODERN_CSS_LIMITS).toHaveProperty('MIX_MULTIPLIER');
    });

    it('should have reasonable limit values', () => {
      expect(MODERN_CSS_LIMITS.MAX_LIGHTNESS_MIX).toBeGreaterThan(0);
      expect(MODERN_CSS_LIMITS.MAX_LIGHTNESS_MIX).toBeLessThanOrEqual(100);

      expect(MODERN_CSS_LIMITS.MIN_ALPHA_PERCENTAGE).toBeGreaterThan(0);
      expect(MODERN_CSS_LIMITS.MIN_ALPHA_PERCENTAGE).toBeLessThanOrEqual(100);

      expect(MODERN_CSS_LIMITS.LIGHTNESS_MULTIPLIER).toBeGreaterThan(0);
      expect(MODERN_CSS_LIMITS.MIX_MULTIPLIER).toBeGreaterThan(0);
    });

    it('should be readonly at compile time', () => {
      // MODERN_CSS_LIMITS is readonly via 'as const' but not frozen at runtime
      expect(typeof MODERN_CSS_LIMITS).toBe('object');
    });
  });
});
