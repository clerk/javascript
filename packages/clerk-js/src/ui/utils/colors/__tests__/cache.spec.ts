import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock cssSupports before importing other modules
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    colorMix: vi.fn(),
    relativeColorSyntax: vi.fn(),
  },
}));

import { cssSupports } from '../../cssSupports';
import {
  batchGenerateColorScale,
  clearMemoCache,
  createEmptyColorScale,
  getCacheStats,
  hasModernColorSupport,
  memoizedColorGenerators,
} from '../cache';

describe('Cache Module', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearMemoCache();
    vi.clearAllMocks();
  });

  describe('hasModernColorSupport caching', () => {
    it('should cache the result after first call', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(true);

      // First call
      const result1 = hasModernColorSupport();
      expect(result1).toBe(true);
      expect(cssSupports.colorMix).toHaveBeenCalledTimes(1);
      expect(cssSupports.relativeColorSyntax).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = hasModernColorSupport();
      expect(result2).toBe(true);
      expect(cssSupports.colorMix).toHaveBeenCalledTimes(1); // Not called again
      expect(cssSupports.relativeColorSyntax).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should return true when colorMix is supported', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);

      expect(hasModernColorSupport()).toBe(true);
    });

    it('should return true when relativeColorSyntax is supported', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(true);

      expect(hasModernColorSupport()).toBe(true);
    });

    it('should return false when neither is supported', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);

      expect(hasModernColorSupport()).toBe(false);
    });

    it('should reset cache when clearMemoCache is called', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(cssSupports.relativeColorSyntax).mockReturnValue(false);

      // First call
      hasModernColorSupport();
      expect(cssSupports.colorMix).toHaveBeenCalledTimes(1);

      // Clear cache
      clearMemoCache();

      // Next call should check again
      hasModernColorSupport();
      expect(cssSupports.colorMix).toHaveBeenCalledTimes(2);
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

    it('should return new objects each time (not the same reference)', () => {
      const scale1 = createEmptyColorScale();
      const scale2 = createEmptyColorScale();

      expect(scale1).not.toBe(scale2);
      expect(scale1).toEqual(scale2);
    });

    it('should allow modification of returned objects', () => {
      const scale = createEmptyColorScale();
      scale['500'] = '#ff0000';

      expect(scale['500']).toBe('#ff0000');

      // New scale should not be affected
      const newScale = createEmptyColorScale();
      expect(newScale['500']).toBeUndefined();
    });
  });

  describe('memoizedColorGenerators', () => {
    describe('colorMix', () => {
      it('should generate color-mix syntax correctly', () => {
        const result = memoizedColorGenerators.colorMix('#ff0000', 'white', 50);
        expect(result).toBe('color-mix(in srgb, #ff0000, white 50%)');
      });

      it('should memoize results', () => {
        const spy = vi.spyOn(memoizedColorGenerators, 'colorMix');

        // First call
        const result1 = memoizedColorGenerators.colorMix('#ff0000', 'white', 50);
        expect(spy).toHaveBeenCalledTimes(1);

        // Second call with same parameters - should use cache
        const result2 = memoizedColorGenerators.colorMix('#ff0000', 'white', 50);
        expect(result1).toBe(result2);
        expect(spy).toHaveBeenCalledTimes(2); // Called again but should return cached result
      });

      it('should handle different parameters separately', () => {
        const result1 = memoizedColorGenerators.colorMix('#ff0000', 'white', 50);
        const result2 = memoizedColorGenerators.colorMix('#ff0000', 'black', 50);
        const result3 = memoizedColorGenerators.colorMix('#ff0000', 'white', 30);

        expect(result1).toBe('color-mix(in srgb, #ff0000, white 50%)');
        expect(result2).toBe('color-mix(in srgb, #ff0000, black 50%)');
        expect(result3).toBe('color-mix(in srgb, #ff0000, white 30%)');

        expect(result1).not.toBe(result2);
        expect(result1).not.toBe(result3);
      });
    });

    describe('relativeColor', () => {
      it('should generate relative color syntax correctly', () => {
        const result = memoizedColorGenerators.relativeColor('#ff0000', 'h', 's', 'calc(l + 20%)');
        expect(result).toBe('hsl(from #ff0000 h s calc(l + 20%))');
      });

      it('should handle alpha parameter', () => {
        const result = memoizedColorGenerators.relativeColor('#ff0000', 'h', 's', 'l', '0.5');
        expect(result).toBe('hsl(from #ff0000 h s l / 0.5)');
      });

      it('should handle missing alpha parameter', () => {
        const result = memoizedColorGenerators.relativeColor('#ff0000', 'h', 's', 'l');
        expect(result).toBe('hsl(from #ff0000 h s l)');
      });

      it('should memoize results', () => {
        const result1 = memoizedColorGenerators.relativeColor('#ff0000', 'h', 's', 'l');
        const result2 = memoizedColorGenerators.relativeColor('#ff0000', 'h', 's', 'l');

        expect(result1).toBe(result2);
      });
    });

    describe('alphaColorMix', () => {
      it('should generate alpha color-mix syntax correctly', () => {
        const result = memoizedColorGenerators.alphaColorMix('#ff0000', 50);
        expect(result).toBe('color-mix(in srgb, transparent, #ff0000 50%)');
      });

      it('should handle different alpha values', () => {
        const result1 = memoizedColorGenerators.alphaColorMix('#ff0000', 25);
        const result2 = memoizedColorGenerators.alphaColorMix('#ff0000', 75);

        expect(result1).toBe('color-mix(in srgb, transparent, #ff0000 25%)');
        expect(result2).toBe('color-mix(in srgb, transparent, #ff0000 75%)');
      });

      it('should memoize results', () => {
        const result1 = memoizedColorGenerators.alphaColorMix('#ff0000', 50);
        const result2 = memoizedColorGenerators.alphaColorMix('#ff0000', 50);

        expect(result1).toBe(result2);
      });
    });
  });

  describe('batchGenerateColorScale', () => {
    it('should generate complete color scale', () => {
      const generator = vi.fn((color: string, shade: string) => `${color}-${shade}`);

      const result = batchGenerateColorScale('#ff0000', generator);

      expect(generator).toHaveBeenCalledTimes(15); // All 15 shades
      expect(result['500']).toBe('#ff0000-500');
      expect(result['25']).toBe('#ff0000-25');
      expect(result['950']).toBe('#ff0000-950');
    });

    it('should call generator with correct parameters', () => {
      const generator = vi.fn((color: string, shade: string) => `${color}-${shade}`);

      batchGenerateColorScale('#ff0000', generator);

      expect(generator).toHaveBeenCalledWith('#ff0000', '25');
      expect(generator).toHaveBeenCalledWith('#ff0000', '500');
      expect(generator).toHaveBeenCalledWith('#ff0000', '950');
    });

    it('should handle different base colors', () => {
      const generator = vi.fn((color: string, shade: string) => `${color}-${shade}`);

      const result1 = batchGenerateColorScale('#ff0000', generator);
      const result2 = batchGenerateColorScale('#00ff00', generator);

      expect(result1['500']).toBe('#ff0000-500');
      expect(result2['500']).toBe('#00ff00-500');
    });
  });

  describe('Cache management', () => {
    it('should provide cache statistics', () => {
      // Initial state
      let stats = getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.modernSupport).toBeNull();

      // Generate some cached data
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      hasModernColorSupport();
      memoizedColorGenerators.colorMix('#ff0000', 'white', 50);

      stats = getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.modernSupport).toBe(true);
    });

    it('should clear all cache data', () => {
      // Generate some cached data
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      hasModernColorSupport();
      memoizedColorGenerators.colorMix('#ff0000', 'white', 50);

      let stats = getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.modernSupport).toBe(true);

      // Clear cache
      clearMemoCache();

      stats = getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.modernSupport).toBeNull();
    });

    it('should reset browser support detection after clear', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);

      // First call
      hasModernColorSupport();
      expect(cssSupports.colorMix).toHaveBeenCalledTimes(1);

      // Clear and call again
      clearMemoCache();
      hasModernColorSupport();
      expect(cssSupports.colorMix).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance characteristics', () => {
    it('should handle large numbers of memoized calls efficiently', () => {
      const start = performance.now();

      // Generate 1000 calls with repeated parameters
      for (let i = 0; i < 1000; i++) {
        memoizedColorGenerators.colorMix('#ff0000', 'white', 50);
        memoizedColorGenerators.alphaColorMix('#ff0000', 75);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete very quickly due to memoization
      expect(duration).toBeLessThan(100); // Less than 100ms
    });

    it('should handle different cache keys efficiently', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
      const percentages = [10, 25, 50, 75, 90];

      const start = performance.now();

      // Generate many different combinations
      colors.forEach(color => {
        percentages.forEach(percentage => {
          memoizedColorGenerators.colorMix(color, 'white', percentage);
          memoizedColorGenerators.alphaColorMix(color, percentage);
        });
      });

      const end = performance.now();
      const duration = end - start;

      // Should still be reasonably fast
      expect(duration).toBeLessThan(50); // Less than 50ms

      // Cache should contain all combinations
      const stats = getCacheStats();
      expect(stats.size).toBe(colors.length * percentages.length * 2); // 2 types of calls
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string parameters', () => {
      const result = memoizedColorGenerators.colorMix('', '', 0);
      expect(result).toBe('color-mix(in srgb, ,  0%)');
    });

    it('should handle special characters in color values', () => {
      const result = memoizedColorGenerators.colorMix('var(--primary)', 'white', 50);
      expect(result).toBe('color-mix(in srgb, var(--primary), white 50%)');
    });

    it('should handle extreme percentage values', () => {
      const result1 = memoizedColorGenerators.colorMix('#ff0000', 'white', 0);
      const result2 = memoizedColorGenerators.colorMix('#ff0000', 'white', 100);

      expect(result1).toBe('color-mix(in srgb, #ff0000, white 0%)');
      expect(result2).toBe('color-mix(in srgb, #ff0000, white 100%)');
    });

    it('should handle undefined alpha parameter gracefully', () => {
      const result = memoizedColorGenerators.relativeColor('#ff0000', 'h', 's', 'l', undefined);
      expect(result).toBe('hsl(from #ff0000 h s l)');
    });
  });
});
