import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock cssSupports
vi.mock('../../cssSupports', () => ({
  cssSupports: {
    modernColor: vi.fn(),
  },
}));

vi.mock('../legacy', () => ({
  colors: {
    toHslaColor: vi.fn(),
    toHslaString: vi.fn(),
    changeHslaLightness: vi.fn(),
    setHslaAlpha: vi.fn(),
    lighten: vi.fn(),
    makeTransparent: vi.fn(),
    makeSolid: vi.fn(),
    setAlpha: vi.fn(),
    adjustForLightness: vi.fn(),
  },
}));

vi.mock('../modern', () => ({
  colors: {
    lighten: vi.fn(),
    makeTransparent: vi.fn(),
    makeSolid: vi.fn(),
    setAlpha: vi.fn(),
    adjustForLightness: vi.fn(),
  },
}));

import { cssSupports } from '../../cssSupports';
import { colors, legacyColors, modernColors } from '../index';

// Get the mocked functions
const mockModernColorSupport = vi.mocked(cssSupports.modernColor);
const mockLegacyColors = vi.mocked(legacyColors);
const mockModernColors = vi.mocked(modernColors);

describe('Colors Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModernColorSupport.mockReturnValue(false);
  });

  describe('modernColors and legacyColors exports', () => {
    it('should export modernColors', () => {
      expect(modernColors).toBeDefined();
    });

    it('should export legacyColors', () => {
      expect(legacyColors).toBeDefined();
    });
  });

  describe('toHslaColor', () => {
    it('should return undefined for undefined input', () => {
      expect(colors.toHslaColor(undefined)).toBeUndefined();
    });

    it('should return color string when modern CSS is supported', () => {
      mockModernColorSupport.mockReturnValue(true);

      const result = colors.toHslaColor('red');
      expect(result).toBe('red');
    });

    it('should call legacy toHslaColor when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);
      mockLegacyColors.toHslaColor.mockReturnValue({ h: 0, s: 100, l: 50, a: 1 });

      colors.toHslaColor('red');
      expect(mockLegacyColors.toHslaColor).toHaveBeenCalledWith('red');
    });
  });

  describe('toHslaString', () => {
    it('should return undefined for undefined input', () => {
      expect(colors.toHslaString(undefined)).toBeUndefined();
    });

    it('should return color string when modern CSS is supported and input is string', () => {
      mockModernColorSupport.mockReturnValue(true);

      const result = colors.toHslaString('red');
      expect(result).toBe('red');
    });

    it('should call legacy toHslaString when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);
      mockLegacyColors.toHslaString.mockReturnValue('hsla(0, 100%, 50%, 1)');

      const hslaColor = { h: 0, s: 100, l: 50, a: 1 };
      colors.toHslaString(hslaColor);
      expect(mockLegacyColors.toHslaString).toHaveBeenCalledWith(hslaColor);
    });

    it('should call legacy toHslaString for string input when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);
      mockLegacyColors.toHslaString.mockReturnValue('hsla(0, 100%, 50%, 1)');

      colors.toHslaString('red');
      expect(mockLegacyColors.toHslaString).toHaveBeenCalledWith('red');
    });
  });

  describe('changeHslaLightness', () => {
    it('should always use legacy implementation', () => {
      const hslaColor = { h: 0, s: 100, l: 50, a: 1 };
      const lightness = 10;

      colors.changeHslaLightness(hslaColor, lightness);
      expect(mockLegacyColors.changeHslaLightness).toHaveBeenCalledWith(hslaColor, lightness);
    });
  });

  describe('setHslaAlpha', () => {
    it('should always use legacy implementation', () => {
      const hslaColor = { h: 0, s: 100, l: 50, a: 1 };
      const alpha = 0.5;

      colors.setHslaAlpha(hslaColor, alpha);
      expect(mockLegacyColors.setHslaAlpha).toHaveBeenCalledWith(hslaColor, alpha);
    });
  });

  describe('lighten', () => {
    it('should use modern implementation when supported', () => {
      mockModernColorSupport.mockReturnValue(true);
      mockModernColors.lighten.mockReturnValue('lightened-color');

      const result = colors.lighten('red', 0.1);
      expect(mockModernColors.lighten).toHaveBeenCalledWith('red', 0.1);
      expect(result).toBe('lightened-color');
    });

    it('should use legacy implementation when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);
      mockLegacyColors.lighten.mockReturnValue('legacy-lightened-color');

      const result = colors.lighten('red', 0.1);
      expect(mockLegacyColors.lighten).toHaveBeenCalledWith('red', 0.1);
      expect(result).toBe('legacy-lightened-color');
    });

    it('should handle default percentage', () => {
      mockModernColorSupport.mockReturnValue(true);
      mockModernColors.lighten.mockReturnValue('lightened-color');

      colors.lighten('red');
      expect(mockModernColors.lighten).toHaveBeenCalledWith('red', 0);
    });
  });

  describe('makeTransparent', () => {
    it('should use modern implementation when supported', () => {
      mockModernColorSupport.mockReturnValue(true);
      mockModernColors.makeTransparent.mockReturnValue('transparent-color');

      const result = colors.makeTransparent('red', 0.5);
      expect(mockModernColors.makeTransparent).toHaveBeenCalledWith('red', 0.5);
      expect(result).toBe('transparent-color');
    });

    it('should use legacy implementation when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);
      mockLegacyColors.makeTransparent.mockReturnValue('legacy-transparent-color');

      const result = colors.makeTransparent('red', 0.5);
      expect(mockLegacyColors.makeTransparent).toHaveBeenCalledWith('red', 0.5);
      expect(result).toBe('legacy-transparent-color');
    });
  });

  describe('makeSolid', () => {
    it('should use modern implementation when supported', () => {
      mockModernColorSupport.mockReturnValue(true);
      mockModernColors.makeSolid.mockReturnValue('solid-color');

      const result = colors.makeSolid('rgba(255, 0, 0, 0.5)');
      expect(mockModernColors.makeSolid).toHaveBeenCalledWith('rgba(255, 0, 0, 0.5)');
      expect(result).toBe('solid-color');
    });

    it('should use legacy implementation when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);
      mockLegacyColors.makeSolid.mockReturnValue('legacy-solid-color');

      const result = colors.makeSolid('rgba(255, 0, 0, 0.5)');
      expect(mockLegacyColors.makeSolid).toHaveBeenCalledWith('rgba(255, 0, 0, 0.5)');
      expect(result).toBe('legacy-solid-color');
    });
  });

  describe('setAlpha', () => {
    it('should use modern implementation when supported', () => {
      mockModernColorSupport.mockReturnValue(true);
      mockModernColors.setAlpha.mockReturnValue('alpha-color');

      const result = colors.setAlpha('red', 0.5);
      expect(mockModernColors.setAlpha).toHaveBeenCalledWith('red', 0.5);
      expect(result).toBe('alpha-color');
    });

    it('should use legacy implementation when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);
      mockLegacyColors.setAlpha.mockReturnValue('legacy-alpha-color');

      const result = colors.setAlpha('red', 0.5);
      expect(mockLegacyColors.setAlpha).toHaveBeenCalledWith('red', 0.5);
      expect(result).toBe('legacy-alpha-color');
    });
  });

  describe('adjustForLightness', () => {
    it('should use modern implementation when supported', () => {
      mockModernColorSupport.mockReturnValue(true);
      mockModernColors.adjustForLightness.mockReturnValue('adjusted-color');

      const result = colors.adjustForLightness('red', 5);
      expect(mockModernColors.adjustForLightness).toHaveBeenCalledWith('red', 5);
      expect(result).toBe('adjusted-color');
    });

    it('should use legacy implementation when modern CSS not supported', () => {
      mockModernColorSupport.mockReturnValue(false);
      mockLegacyColors.adjustForLightness.mockReturnValue('legacy-adjusted-color');

      const result = colors.adjustForLightness('red', 5);
      expect(mockLegacyColors.adjustForLightness).toHaveBeenCalledWith('red', 5);
      expect(result).toBe('legacy-adjusted-color');
    });

    it('should handle default lightness value', () => {
      mockModernColorSupport.mockReturnValue(true);
      mockModernColors.adjustForLightness.mockReturnValue('adjusted-color');

      colors.adjustForLightness('red');
      expect(mockModernColors.adjustForLightness).toHaveBeenCalledWith('red', 5);
    });
  });
});
