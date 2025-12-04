import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cssSupports } from '../../cssSupports';
import {
  createAlphaColorMixString,
  createColorMixString,
  createEmptyColorScale,
  createRelativeColorString,
  generateAlphaColorMix,
  generateColorMixSyntax,
  generateRelativeColorSyntax,
  getSupportedColorVariant,
} from '../utils';

// Mock cssSupports
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    relativeColorSyntax: vi.fn(),
    colorMix: vi.fn(),
  },
}));

// Mock DOM APIs
const mockGetComputedStyle = vi.fn();
const mockGetPropertyValue = vi.fn();

// Get the mocked functions
const mockRelativeColorSyntax = vi.mocked(cssSupports.relativeColorSyntax);
const mockColorMix = vi.mocked(cssSupports.colorMix);

// Setup DOM mocks
Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
  writable: true,
});

// Mock document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    style: {},
  },
  writable: true,
});

describe('Color Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRelativeColorSyntax.mockReturnValue(false);
    mockColorMix.mockReturnValue(false);

    // Setup getComputedStyle mock
    mockGetComputedStyle.mockReturnValue({
      getPropertyValue: mockGetPropertyValue,
    });
    mockGetPropertyValue.mockReturnValue('');
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

  describe('color string generators', () => {
    describe('createColorMixString', () => {
      it('should generate color-mix syntax', () => {
        const result = createColorMixString('red', 'blue', 50);
        expect(result).toBe('color-mix(in srgb, red, blue 50%)');
      });
    });

    describe('createRelativeColorString', () => {
      it('should generate relative color syntax without alpha', () => {
        const result = createRelativeColorString('red', 'h', 's', 'calc(l + 10%)');
        expect(result).toBe('hsl(from red h s calc(l + 10%))');
      });

      it('should generate relative color syntax with alpha', () => {
        const result = createRelativeColorString('red', 'h', 's', 'l', '0.5');
        expect(result).toBe('hsl(from red h s l / 0.5)');
      });
    });

    describe('createAlphaColorMixString', () => {
      it('should generate alpha color-mix syntax', () => {
        const result = createAlphaColorMixString('red', 50);
        expect(result).toBe('color-mix(in srgb, transparent, red 50%)');
      });
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

  describe('getSupportedColorVariant', () => {
    it('should return original color for 500 shade', () => {
      const result = getSupportedColorVariant('red', 500);
      expect(result).toBe('red');
    });

    it('should use relative color syntax when supported', () => {
      mockRelativeColorSyntax.mockReturnValue(true);

      const result = getSupportedColorVariant('red', 400);
      expect(result).toMatch(/hsl\(from red h s calc\(l \+ \(1 \* \(\(97 - l\) \/ 7\)\)\)\)/);
    });

    it('should fall back to color-mix when relative color syntax not supported', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(true);

      const result = getSupportedColorVariant('red', 400);
      expect(result).toBe('color-mix(in srgb, red, white 16%)');
    });

    it('should return original color when no modern CSS support', () => {
      mockRelativeColorSyntax.mockReturnValue(false);
      mockColorMix.mockReturnValue(false);

      const result = getSupportedColorVariant('red', 400);
      expect(result).toBe('red');
    });
  });
});
