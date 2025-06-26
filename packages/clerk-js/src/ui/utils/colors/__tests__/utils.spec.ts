import type { ColorScale } from '@clerk/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cssSupports } from '../../cssSupports';
import { clearMemoCache } from '../../memoize';
import {
  applyScalePrefix,
  colorGenerators,
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
    relativeColorSyntax: vi.fn(),
    colorMix: vi.fn(),
  },
}));

// Get the mocked functions
const mockRelativeColorSyntax = vi.mocked(cssSupports.relativeColorSyntax);
const mockColorMix = vi.mocked(cssSupports.colorMix);

describe('Color Utils', () => {
  beforeEach(() => {
    clearMemoCache();
    vi.clearAllMocks();
    mockRelativeColorSyntax.mockReturnValue(false);
    mockColorMix.mockReturnValue(false);
  });

  afterEach(() => {
    clearMemoCache();
  });

  describe('createEmptyColorScale', () => {
    it('should create an empty color scale with all shades', () => {
      const scale = createEmptyColorScale();

      expect(scale).toHaveProperty('25', undefined);
      expect(scale).toHaveProperty('50', undefined);
      expect(scale).toHaveProperty('100', undefined);
      expect(scale).toHaveProperty('500', undefined);
      expect(scale).toHaveProperty('950', undefined);
    });

    it('should return a new object each time', () => {
      const scale1 = createEmptyColorScale();
      const scale2 = createEmptyColorScale();

      expect(scale1).not.toBe(scale2);
      expect(scale1).toEqual(scale2);
    });

    it('should allow modification of returned scale', () => {
      const scale = createEmptyColorScale();
      scale['500'] = 'red';

      expect(scale['500']).toBe('red');
    });
  });

  describe('memoized color generators', () => {
    describe('colorMix', () => {
      it('should generate color-mix syntax', () => {
        const result = colorGenerators.colorMix('red', 'blue', 50);
        expect(result).toBe('color-mix(in srgb, red, blue 50%)');
      });

      it('should memoize results', () => {
        const result1 = colorGenerators.colorMix('red', 'blue', 50);
        const result2 = colorGenerators.colorMix('red', 'blue', 50);

        expect(result1).toBe(result2);
        expect(result1).toBe('color-mix(in srgb, red, blue 50%)');
      });
    });

    describe('relativeColor', () => {
      it('should generate relative color syntax without alpha', () => {
        const result = colorGenerators.relativeColor('red', 'h', 's', 'calc(l + 10%)');
        expect(result).toBe('hsl(from red h s calc(l + 10%))');
      });

      it('should generate relative color syntax with alpha', () => {
        const result = colorGenerators.relativeColor('red', 'h', 's', 'l', '0.5');
        expect(result).toBe('hsl(from red h s l / 0.5)');
      });
    });

    describe('alphaColorMix', () => {
      it('should generate alpha color-mix syntax', () => {
        const result = colorGenerators.alphaColorMix('red', 50);
        expect(result).toBe('color-mix(in srgb, transparent, red 50%)');
      });
    });
  });

  describe('createColorMix', () => {
    it('should create color-mix string', () => {
      const result = createColorMix('red', 'white', 25);
      expect(result).toBe('color-mix(in srgb, red, white 25%)');
    });
  });

  describe('createAlphaColorMix', () => {
    it('should create alpha color-mix string', () => {
      const result = createAlphaColorMix('red', 75);
      expect(result).toBe('color-mix(in srgb, transparent, red 75%)');
    });
  });

  describe('generateRelativeColorSyntax', () => {
    it('should return original color for 500 shade', () => {
      const result = generateRelativeColorSyntax('red', 500);
      expect(result).toBe('red');
    });

    it('should generate correct syntax for light shades', () => {
      const result = generateRelativeColorSyntax('red', 400);
      expect(result).toMatch(/hsl\(from red h s calc\(l \+ \(1 \* \(\(97 - l\) \/ 7\)\)\)\)/);
    });

    it('should generate correct syntax for dark shades', () => {
      const result = generateRelativeColorSyntax('red', 600);
      expect(result).toMatch(/hsl\(from red h s calc\(l - \(1 \* \(\(l - 12\) \/ 7\)\)\)\)/);
    });
  });

  describe('generateColorMixSyntax', () => {
    it('should return original color for 500 shade', () => {
      const result = generateColorMixSyntax('red', 500);
      expect(result).toBe('red');
    });

    it('should generate color-mix with white for light shades', () => {
      const result = generateColorMixSyntax('red', 50);
      expect(result).toBe('color-mix(in srgb, red, white 80%)');
    });

    it('should generate color-mix with black for dark shades', () => {
      const result = generateColorMixSyntax('red', 800);
      expect(result).toBe('color-mix(in srgb, red, black 44%)');
    });
  });

  describe('generateAlphaColorMix', () => {
    it('should generate alpha color-mix for all shades', () => {
      const result25 = generateAlphaColorMix('red', 25);
      const result500 = generateAlphaColorMix('red', 500);
      const result950 = generateAlphaColorMix('red', 950);

      expect(result25).toBe('color-mix(in srgb, transparent, red 2%)');
      expect(result500).toBe('color-mix(in srgb, transparent, red 53%)');
      expect(result950).toBe('color-mix(in srgb, transparent, red 92%)');
    });
  });

  describe('getColorMix', () => {
    it('should return original color for 500 shade', () => {
      const result = getColorMix('red', 500);
      expect(result).toBe('red');
    });

    it('should use relative color syntax when supported', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = getColorMix('red', 400);
      expect(result).toMatch(/hsl\(from red h s calc\(l \+ \(1 \* \(\(97 - l\) \/ 7\)\)\)\)/);
    });

    it('should fall back to color-mix when relative color syntax not supported', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(true);

      const result = getColorMix('red', 400);
      expect(result).toBe('color-mix(in srgb, red, white 16%)');
    });

    it('should return original color when no modern CSS support', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(false);

      const result = getColorMix('red', 400);
      expect(result).toBe('red');
    });
  });

  describe('applyScalePrefix', () => {
    it('should apply prefix to all scale properties', () => {
      const scale: Partial<ColorScale<string>> = {
        '25': 'red-25',
        '500': 'red-500',
        '950': 'red-950',
      };

      const result = applyScalePrefix(scale as ColorScale<string | undefined>, 'bg-');

      expect(result).toEqual({
        'bg-25': 'red-25',
        'bg-500': 'red-500',
        'bg-950': 'red-950',
      });
    });

    it('should skip undefined values', () => {
      const scale: Partial<ColorScale<string | undefined>> = {
        '25': 'red-25',
        '500': undefined,
        '950': 'red-950',
      };

      const result = applyScalePrefix(scale as ColorScale<string | undefined>, 'text-');

      expect(result).toEqual({
        'text-25': 'red-25',
        'text-950': 'red-950',
      });
      expect(result).not.toHaveProperty('text-500');
    });
  });
});
