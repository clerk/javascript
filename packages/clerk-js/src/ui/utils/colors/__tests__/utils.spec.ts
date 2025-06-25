import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cssSupports } from '../../cssSupports';
import {
  applyScalePrefix,
  createAlphaColorMix,
  createColorMix,
  createEmptyColorScale,
  generateAlphaColorMix,
  generateColorMixSyntax,
  generateRelativeColorSyntax,
  getColorMix,
} from '../utils';

// Mock cssSupports
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    colorMix: vi.fn(),
    relativeColorSyntax: vi.fn(),
  },
}));

// Mock cache module
vi.mock('../cache', () => ({
  memoizedColorGenerators: {
    colorMix: vi.fn(
      (baseColor: string, mixColor: string, percentage: number) =>
        `color-mix(in srgb, ${baseColor}, ${mixColor} ${percentage}%)`,
    ),
    alphaColorMix: vi.fn(
      (color: string, alphaPercentage: number) => `color-mix(in srgb, transparent, ${color} ${alphaPercentage}%)`,
    ),
  },
}));

describe('Utils Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createColorMix', () => {
    it('should use memoized color generator', () => {
      const result = createColorMix('#ff0000', 'white', 50);
      expect(result).toBe('color-mix(in srgb, #ff0000, white 50%)');
    });

    it('should handle different mix colors', () => {
      const result1 = createColorMix('#ff0000', 'white', 50);
      const result2 = createColorMix('#ff0000', 'black', 30);

      expect(result1).toBe('color-mix(in srgb, #ff0000, white 50%)');
      expect(result2).toBe('color-mix(in srgb, #ff0000, black 30%)');
    });

    it('should handle CSS custom properties', () => {
      const result = createColorMix('var(--primary)', 'white', 25);
      expect(result).toBe('color-mix(in srgb, var(--primary), white 25%)');
    });
  });

  describe('createAlphaColorMix', () => {
    it('should use memoized alpha color generator', () => {
      const result = createAlphaColorMix('#ff0000', 75);
      expect(result).toBe('color-mix(in srgb, transparent, #ff0000 75%)');
    });

    it('should handle different alpha percentages', () => {
      const result1 = createAlphaColorMix('#ff0000', 25);
      const result2 = createAlphaColorMix('#ff0000', 90);

      expect(result1).toBe('color-mix(in srgb, transparent, #ff0000 25%)');
      expect(result2).toBe('color-mix(in srgb, transparent, #ff0000 90%)');
    });

    it('should handle CSS custom properties', () => {
      const result = createAlphaColorMix('var(--accent)', 50);
      expect(result).toBe('color-mix(in srgb, transparent, var(--accent) 50%)');
    });
  });

  describe('generateRelativeColorSyntax', () => {
    it('should return original color for base shade 500', () => {
      const result = generateRelativeColorSyntax('#ff0000', 500);
      expect(result).toBe('#ff0000');
    });

    it('should generate relative color syntax for light shades', () => {
      const result = generateRelativeColorSyntax('#ff0000', 400);
      expect(result).toContain('hsl(from #ff0000 h s calc(l + (1 * ((97 - l) / 7))))');
    });

    it('should generate relative color syntax for dark shades', () => {
      const result = generateRelativeColorSyntax('#ff0000', 600);
      expect(result).toContain('hsl(from #ff0000 h s calc(l - (1 * ((l - 12) / 7))))');
    });

    it('should handle extreme light shade', () => {
      const result = generateRelativeColorSyntax('#ff0000', 25);
      expect(result).toContain('hsl(from #ff0000 h s calc(l + (7 * ((97 - l) / 7))))');
    });

    it('should handle extreme dark shade', () => {
      const result = generateRelativeColorSyntax('#ff0000', 950);
      expect(result).toContain('hsl(from #ff0000 h s calc(l - (7 * ((l - 12) / 7))))');
    });

    it('should return original color for unknown shade', () => {
      // @ts-expect-error - testing invalid shade
      const result = generateRelativeColorSyntax('#ff0000', 999);
      expect(result).toBe('#ff0000');
    });

    it('should work with CSS custom properties', () => {
      const result = generateRelativeColorSyntax('var(--primary)', 300);
      expect(result).toContain('hsl(from var(--primary) h s calc(l + (2 * ((97 - l) / 7))))');
    });
  });

  describe('generateColorMixSyntax', () => {
    it('should return original color for base shade 500', () => {
      const result = generateColorMixSyntax('#ff0000', 500);
      expect(result).toBe('#ff0000');
    });

    it('should generate color-mix with white for light shades', () => {
      const result = generateColorMixSyntax('#ff0000', 100);
      expect(result).toBe('color-mix(in srgb, #ff0000, white 68%)');
    });

    it('should generate color-mix with black for dark shades', () => {
      const result = generateColorMixSyntax('#ff0000', 800);
      expect(result).toBe('color-mix(in srgb, #ff0000, black 44%)');
    });

    it('should handle all light shades correctly', () => {
      const lightShades = [25, 50, 100, 150, 200, 300, 400] as const;
      const expectedPercentages = [85, 80, 68, 55, 40, 26, 16];

      lightShades.forEach((shade, index) => {
        const result = generateColorMixSyntax('#ff0000', shade);
        expect(result).toBe(`color-mix(in srgb, #ff0000, white ${expectedPercentages[index]}%)`);
      });
    });

    it('should handle all dark shades correctly', () => {
      const darkShades = [600, 700, 750, 800, 850, 900, 950] as const;
      const expectedPercentages = [12, 22, 30, 44, 55, 65, 75];

      darkShades.forEach((shade, index) => {
        const result = generateColorMixSyntax('#ff0000', shade);
        expect(result).toBe(`color-mix(in srgb, #ff0000, black ${expectedPercentages[index]}%)`);
      });
    });

    it('should work with CSS custom properties', () => {
      const result = generateColorMixSyntax('var(--primary)', 200);
      expect(result).toBe('color-mix(in srgb, var(--primary), white 40%)');
    });
  });

  describe('generateAlphaColorMix', () => {
    it('should generate alpha color-mix for all shades', () => {
      const result25 = generateAlphaColorMix('#ff0000', 25);
      const result500 = generateAlphaColorMix('#ff0000', 500);
      const result950 = generateAlphaColorMix('#ff0000', 950);

      expect(result25).toBe('color-mix(in srgb, transparent, #ff0000 2%)');
      expect(result500).toBe('color-mix(in srgb, transparent, #ff0000 53%)');
      expect(result950).toBe('color-mix(in srgb, transparent, #ff0000 92%)');
    });

    it('should handle all shades with correct alpha percentages', () => {
      const shades = [25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950] as const;
      const expectedPercentages = [2, 3, 7, 11, 15, 28, 41, 53, 62, 73, 78, 81, 84, 87, 92];

      shades.forEach((shade, index) => {
        const result = generateAlphaColorMix('#ff0000', shade);
        expect(result).toBe(`color-mix(in srgb, transparent, #ff0000 ${expectedPercentages[index]}%)`);
      });
    });

    it('should work with CSS custom properties', () => {
      const result = generateAlphaColorMix('var(--accent)', 300);
      expect(result).toBe('color-mix(in srgb, transparent, var(--accent) 28%)');
    });
  });

  describe('getColorMix', () => {
    it('should return original color for base shade 500', () => {
      const result = getColorMix('#ff0000', 500);
      expect(result).toBe('#ff0000');
    });

    it('should prefer relative color syntax when supported', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(true);
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);

      const result = getColorMix('#ff0000', 400);
      expect(result).toContain('hsl(from #ff0000');
    });

    it('should fallback to color-mix when relative color syntax not supported', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);

      const result = getColorMix('#ff0000', 400);
      expect(result).toBe('color-mix(in srgb, #ff0000, white 16%)');
    });

    it('should return original color when no modern CSS support', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);

      const result = getColorMix('#ff0000', 400);
      expect(result).toBe('#ff0000');
    });

    it('should handle all shades consistently', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);

      const lightResult = getColorMix('#ff0000', 200);
      const darkResult = getColorMix('#ff0000', 800);

      expect(lightResult).toBe('color-mix(in srgb, #ff0000, white 40%)');
      expect(darkResult).toBe('color-mix(in srgb, #ff0000, black 44%)');
    });
  });

  describe('createEmptyColorScale', () => {
    it('should create empty color scale with all shades', () => {
      const scale = createEmptyColorScale();

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
        expect(scale).toHaveProperty(shade);
        expect(scale[shade as keyof typeof scale]).toBeUndefined();
      });
    });

    it('should return new objects each time', () => {
      const scale1 = createEmptyColorScale();
      const scale2 = createEmptyColorScale();

      expect(scale1).not.toBe(scale2);
      expect(scale1).toEqual(scale2);
    });

    it('should allow modification without affecting other instances', () => {
      const scale1 = createEmptyColorScale();
      const scale2 = createEmptyColorScale();

      scale1['500'] = '#ff0000';

      expect(scale1['500']).toBe('#ff0000');
      expect(scale2['500']).toBeUndefined();
    });
  });

  describe('applyScalePrefix', () => {
    it('should apply prefix to all defined scale values', () => {
      const scale = createEmptyColorScale();
      scale['500'] = '#ff0000';
      scale['400'] = '#ff3333';
      scale['600'] = '#cc0000';

      const result = applyScalePrefix(scale, 'primary-');

      expect(result).toEqual({
        'primary-500': '#ff0000',
        'primary-400': '#ff3333',
        'primary-600': '#cc0000',
      });
    });

    it('should skip undefined values', () => {
      const scale = createEmptyColorScale();
      scale['500'] = '#ff0000';
      // Leave other shades undefined

      const result = applyScalePrefix(scale, 'accent-');

      expect(result).toEqual({
        'accent-500': '#ff0000',
      });

      // Should not have undefined values
      expect(result).not.toHaveProperty('accent-400');
      expect(result).not.toHaveProperty('accent-600');
    });

    it('should handle empty prefix', () => {
      const scale = createEmptyColorScale();
      scale['500'] = '#ff0000';

      const result = applyScalePrefix(scale, '');

      expect(result).toEqual({
        '500': '#ff0000',
      });
    });

    it('should handle complex prefixes', () => {
      const scale = createEmptyColorScale();
      scale['500'] = '#ff0000';
      scale['400'] = '#ff3333';

      const result = applyScalePrefix(scale, 'brand-primary-');

      expect(result).toEqual({
        'brand-primary-500': '#ff0000',
        'brand-primary-400': '#ff3333',
      });
    });

    it('should maintain correct TypeScript types', () => {
      const scale = createEmptyColorScale();
      scale['500'] = '#ff0000';

      const result = applyScalePrefix(scale, 'test-');

      // TypeScript should infer the correct key type
      expect(result['test-500']).toBe('#ff0000');
    });

    it('should handle complete color scale', () => {
      const scale = createEmptyColorScale();

      // Fill all shades
      const shades = [
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
      ] as const;
      shades.forEach((shade, index) => {
        scale[shade] = `#${index.toString().padStart(6, '0')}`;
      });

      const result = applyScalePrefix(scale, 'full-');

      // Should have all 15 prefixed entries
      expect(Object.keys(result)).toHaveLength(15);
      shades.forEach((shade, index) => {
        expect(result[`full-${shade}`]).toBe(`#${index.toString().padStart(6, '0')}`);
      });
    });
  });

  describe('Integration tests', () => {
    it('should work together to generate complete color utilities', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(true);
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);

      const baseColor = '#ff0000';
      const scale = createEmptyColorScale();

      // Generate a few shades using different methods
      scale['500'] = baseColor;
      scale['400'] = getColorMix(baseColor, 400);
      scale['600'] = getColorMix(baseColor, 600);

      // Apply prefix
      const prefixedScale = applyScalePrefix(scale, 'primary-');

      expect(prefixedScale['primary-500']).toBe('#ff0000');
      expect(prefixedScale['primary-400']).toContain('hsl(from #ff0000');
      expect(prefixedScale['primary-600']).toContain('hsl(from #ff0000');
    });

    it('should handle fallback scenarios gracefully', () => {
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);

      const baseColor = '#ff0000';
      const scale = createEmptyColorScale();

      scale['500'] = baseColor;
      scale['400'] = getColorMix(baseColor, 400); // Should fallback to original color

      const prefixedScale = applyScalePrefix(scale, 'fallback-');

      expect(prefixedScale['fallback-500']).toBe('#ff0000');
      expect(prefixedScale['fallback-400']).toBe('#ff0000'); // Fallback
    });
  });

  describe('Performance considerations', () => {
    it('should handle many scale generations efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        const scale = createEmptyColorScale();
        scale['500'] = `#${i.toString(16).padStart(6, '0')}`;
        applyScalePrefix(scale, `test-${i}-`);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete quickly
      expect(duration).toBeLessThan(50); // Less than 50ms
    });
  });
});
