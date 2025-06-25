import { beforeEach, describe, expect, it, vi } from 'vitest';

import { colorOptionToHslaAlphaScale, colorOptionToHslaLightnessScale } from '../colorOptionToHslaScale';

// Mock the scales module
vi.mock('../scales', () => ({
  generateLightnessScale: vi.fn(),
  generateAlphaScale: vi.fn(),
}));

// Mock the utils module
vi.mock('../utils', () => ({
  applyScalePrefix: vi.fn((scale: any, prefix: string) => {
    const result: any = {};
    Object.entries(scale).forEach(([key, value]) => {
      if (value !== undefined) {
        result[`${prefix}${key}`] = value;
      }
    });
    return result;
  }),
}));

// Mock cssSupports
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    colorMix: vi.fn(),
    relativeColorSyntax: vi.fn(),
  },
}));

import { cssSupports } from '../../cssSupports';
import { generateAlphaScale, generateLightnessScale } from '../scales';
import { applyScalePrefix } from '../utils';

describe('colorOptionToHslaScale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('colorOptionToHslaAlphaScale', () => {
    it('should return undefined for undefined input', () => {
      const result = colorOptionToHslaAlphaScale(undefined, 'test-');
      expect(result).toBeUndefined();
    });

    it('should use modern CSS when supported for string input', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(generateAlphaScale).mockReturnValue({
        '25': 'modern-25',
        '50': 'modern-50',
        '100': 'modern-100',
        '150': 'modern-150',
        '200': 'modern-200',
        '300': 'modern-300',
        '400': 'modern-400',
        '500': 'modern-500',
        '600': 'modern-600',
        '700': 'modern-700',
        '750': 'modern-750',
        '800': 'modern-800',
        '850': 'modern-850',
        '900': 'modern-900',
        '950': 'modern-950',
      });

      const result = colorOptionToHslaAlphaScale('#ff0000', 'alpha-');

      expect(generateAlphaScale).toHaveBeenCalledWith('#ff0000');
      expect(applyScalePrefix).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle object input for alpha scales', () => {
      const colorScale = {
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

      const result = colorOptionToHslaAlphaScale(colorScale, 'alpha-');
      expect(result).toBeDefined();
    });

    it('should handle CSS custom properties', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(generateAlphaScale).mockReturnValue({
        '25': 'var(--primary)-25',
        '50': 'var(--primary)-50',
        '100': 'var(--primary)-100',
        '150': 'var(--primary)-150',
        '200': 'var(--primary)-200',
        '300': 'var(--primary)-300',
        '400': 'var(--primary)-400',
        '500': 'var(--primary)',
        '600': 'var(--primary)-600',
        '700': 'var(--primary)-700',
        '750': 'var(--primary)-750',
        '800': 'var(--primary)-800',
        '850': 'var(--primary)-850',
        '900': 'var(--primary)-900',
        '950': 'var(--primary)-950',
      });

      const result = colorOptionToHslaAlphaScale('var(--primary)', 'alpha-');

      expect(generateAlphaScale).toHaveBeenCalledWith('var(--primary)');
      expect(result).toBeDefined();
    });
  });

  describe('colorOptionToHslaLightnessScale', () => {
    it('should return undefined for undefined input', () => {
      const result = colorOptionToHslaLightnessScale(undefined, 'test-');
      expect(result).toBeUndefined();
    });

    it('should use modern CSS when supported for string input', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(generateLightnessScale).mockReturnValue({
        '25': 'modern-25',
        '50': 'modern-50',
        '100': 'modern-100',
        '150': 'modern-150',
        '200': 'modern-200',
        '300': 'modern-300',
        '400': 'modern-400',
        '500': 'modern-500',
        '600': 'modern-600',
        '700': 'modern-700',
        '750': 'modern-750',
        '800': 'modern-800',
        '850': 'modern-850',
        '900': 'modern-900',
        '950': 'modern-950',
      });

      const result = colorOptionToHslaLightnessScale('#ff0000', 'lightness-');

      expect(generateLightnessScale).toHaveBeenCalledWith('#ff0000');
      expect(applyScalePrefix).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle object input for lightness scales', () => {
      const colorScale = {
        '500': '#ff0000',
        '400': '#ff3333',
        '600': '#cc0000',
      };

      const result = colorOptionToHslaLightnessScale(colorScale, 'lightness-');
      expect(result).toBeDefined();
    });

    it('should handle CSS custom properties', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(generateLightnessScale).mockReturnValue({
        '25': 'var(--accent)-25',
        '50': 'var(--accent)-50',
        '100': 'var(--accent)-100',
        '150': 'var(--accent)-150',
        '200': 'var(--accent)-200',
        '300': 'var(--accent)-300',
        '400': 'var(--accent)-400',
        '500': 'var(--accent)',
        '600': 'var(--accent)-600',
        '700': 'var(--accent)-700',
        '750': 'var(--accent)-750',
        '800': 'var(--accent)-800',
        '850': 'var(--accent)-850',
        '900': 'var(--accent)-900',
        '950': 'var(--accent)-950',
      });

      const result = colorOptionToHslaLightnessScale('var(--accent)', 'lightness-');

      expect(generateLightnessScale).toHaveBeenCalledWith('var(--accent)');
      expect(result).toBeDefined();
    });
  });

  describe('Prefix handling', () => {
    it('should apply correct prefix to alpha scale', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(generateAlphaScale).mockReturnValue({
        '25': 'color-25',
        '50': 'color-50',
        '100': 'color-100',
        '150': 'color-150',
        '200': 'color-200',
        '300': 'color-300',
        '400': 'color-400',
        '500': 'color-500',
        '600': 'color-600',
        '700': 'color-700',
        '750': 'color-750',
        '800': 'color-800',
        '850': 'color-850',
        '900': 'color-900',
        '950': 'color-950',
      });

      colorOptionToHslaAlphaScale('#ff0000', 'brand-alpha-');

      expect(applyScalePrefix).toHaveBeenCalledWith(expect.any(Object), 'brand-alpha-');
    });

    it('should apply correct prefix to lightness scale', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(generateLightnessScale).mockReturnValue({
        '25': 'color-25',
        '50': 'color-50',
        '100': 'color-100',
        '150': 'color-150',
        '200': 'color-200',
        '300': 'color-300',
        '400': 'color-400',
        '500': 'color-500',
        '600': 'color-600',
        '700': 'color-700',
        '750': 'color-750',
        '800': 'color-800',
        '850': 'color-850',
        '900': 'color-900',
        '950': 'color-950',
      });

      colorOptionToHslaLightnessScale('#ff0000', 'brand-lightness-');

      expect(applyScalePrefix).toHaveBeenCalledWith(expect.any(Object), 'brand-lightness-');
    });
  });

  describe('Fallback behavior', () => {
    it('should handle legacy mode when modern CSS not supported', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(false);

      const result = colorOptionToHslaAlphaScale('#ff0000', 'legacy-');
      expect(result).toBeDefined();
    });

    it('should handle edge cases gracefully', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(generateAlphaScale).mockReturnValue({
        '25': '',
        '50': '',
        '100': '',
        '150': '',
        '200': '',
        '300': '',
        '400': '',
        '500': '',
        '600': '',
        '700': '',
        '750': '',
        '800': '',
        '850': '',
        '900': '',
        '950': '',
      });

      const result = colorOptionToHslaAlphaScale('', 'empty-');
      expect(result).toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should handle many calls efficiently', () => {
      vi.mocked(cssSupports.colorMix).mockReturnValue(true);
      vi.mocked(generateAlphaScale).mockReturnValue({
        '25': 'perf-25',
        '50': 'perf-50',
        '100': 'perf-100',
        '150': 'perf-150',
        '200': 'perf-200',
        '300': 'perf-300',
        '400': 'perf-400',
        '500': 'perf-500',
        '600': 'perf-600',
        '700': 'perf-700',
        '750': 'perf-750',
        '800': 'perf-800',
        '850': 'perf-850',
        '900': 'perf-900',
        '950': 'perf-950',
      });

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        colorOptionToHslaAlphaScale(`#${i.toString(16).padStart(6, '0')}`, 'perf-');
        colorOptionToHslaLightnessScale(`#${i.toString(16).padStart(6, '0')}`, 'perf-');
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100); // Less than 100ms
    });
  });
});
