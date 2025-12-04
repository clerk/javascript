import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { colors } from '../legacy';

describe('Legacy Colors', () => {
  describe('toHslaColor', () => {
    describe('RGB and RGBA inputs', () => {
      it('should parse hex colors without alpha', () => {
        const result = colors.toHslaColor('#ff0000');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
      });

      it('should parse hex colors with alpha', () => {
        const result = colors.toHslaColor('#ff000080');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5019607843137255 });
      });

      it('should parse 3-digit hex colors', () => {
        const result = colors.toHslaColor('#f00');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
      });

      it('should parse 4-digit hex colors with alpha', () => {
        const result = colors.toHslaColor('#f008');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5333333333333333 });
      });

      it('should parse rgb() colors', () => {
        const result = colors.toHslaColor('rgb(255, 0, 0)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
      });

      it('should parse rgba() colors', () => {
        const result = colors.toHslaColor('rgba(255, 0, 0, 0.5)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5 });
      });

      it('should parse rgb() colors with percentages', () => {
        const result = colors.toHslaColor('rgb(100%, 0%, 0%)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
      });

      it('should parse rgba() colors with percentage alpha', () => {
        const result = colors.toHslaColor('rgba(255, 0, 0, 50%)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5 });
      });

      it('should parse different RGB colors correctly', () => {
        const blue = colors.toHslaColor('#0000ff');
        expect(blue).toEqual({ h: 240, s: 100, l: 50, a: 1 });

        const green = colors.toHslaColor('#00ff00');
        expect(green).toEqual({ h: 120, s: 100, l: 50, a: 1 });

        const yellow = colors.toHslaColor('#ffff00');
        expect(yellow).toEqual({ h: 60, s: 100, l: 50, a: 1 });
      });
    });

    describe('HSL and HSLA inputs', () => {
      it('should parse hsl() colors', () => {
        const result = colors.toHslaColor('hsl(0, 100%, 50%)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
      });

      it('should parse hsla() colors', () => {
        const result = colors.toHslaColor('hsla(0, 100%, 50%, 0.5)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5 });
      });

      it('should parse hsl() colors with deg unit', () => {
        const result = colors.toHslaColor('hsl(180deg, 50%, 25%)');
        expect(result).toEqual({ h: 180, s: 50, l: 25, a: 1 });
      });

      it('should handle hue values over 360', () => {
        const result = colors.toHslaColor('hsl(450, 100%, 50%)');
        expect(result).toEqual({ h: 90, s: 100, l: 50, a: 1 });
      });

      it('should handle negative hue values', () => {
        const result = colors.toHslaColor('hsl(-90, 100%, 50%)');
        expect(result).toEqual({ h: 270, s: 100, l: 50, a: 1 });
      });
    });

    describe('HWB inputs', () => {
      it('should parse hwb() colors', () => {
        const result = colors.toHslaColor('hwb(0, 0%, 0%)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
      });

      it('should parse hwb() colors with alpha', () => {
        const result = colors.toHslaColor('hwb(0, 0%, 0%, 0.5)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5 });
      });

      it('should handle hwb colors with high whiteness and blackness', () => {
        const result = colors.toHslaColor('hwb(0, 50%, 50%)');
        expect(result.h).toBe(0);
        expect(result.a).toBe(1);
      });
    });

    describe('CSS keyword inputs', () => {
      it('should parse named colors', () => {
        expect(colors.toHslaColor('red')).toEqual({ h: 0, s: 100, l: 50, a: 1 });
        expect(colors.toHslaColor('blue')).toEqual({ h: 240, s: 100, l: 50, a: 1 });
        expect(colors.toHslaColor('green')).toEqual({ h: 120, s: 100, l: 25, a: 1 });
        expect(colors.toHslaColor('white')).toEqual({ h: 0, s: 0, l: 100, a: 1 });
        expect(colors.toHslaColor('black')).toEqual({ h: 0, s: 0, l: 0, a: 1 });
        expect(colors.toHslaColor('transparent')).toEqual({ h: 0, s: 0, l: 0, a: 0 });
      });

      it('should handle gray and grey equivalents', () => {
        const gray = colors.toHslaColor('gray');
        const grey = colors.toHslaColor('grey');
        expect(gray).toEqual(grey);
        expect(gray).toEqual({ h: 0, s: 0, l: 50, a: 1 });
      });
    });

    describe('CSS variable inputs', () => {
      // Mock DOM environment for testing CSS variables
      const mockGetComputedStyle = vi.fn();
      const mockWindow = {
        getComputedStyle: mockGetComputedStyle,
      };

      beforeEach(() => {
        // @ts-ignore
        global.window = mockWindow;
        // @ts-ignore
        global.getComputedStyle = mockGetComputedStyle;
        // @ts-ignore
        global.document = {
          documentElement: document?.createElement?.('div') || {},
        };
      });

      afterEach(() => {
        vi.clearAllMocks();
        // @ts-ignore
        global.window = undefined;
        // @ts-ignore
        global.getComputedStyle = undefined;
        // @ts-ignore
        global.document = undefined;
      });

      it('should resolve CSS variables with hex values', () => {
        mockGetComputedStyle.mockReturnValue({
          getPropertyValue: vi.fn().mockReturnValue('#ff0000'),
        });

        const result = colors.toHslaColor('var(--brand)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
      });

      it('should resolve CSS variables with rgb values', () => {
        mockGetComputedStyle.mockReturnValue({
          getPropertyValue: vi.fn().mockReturnValue('rgb(255, 0, 0)'),
        });

        const result = colors.toHslaColor('var(--primary-color)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
      });

      it('should resolve CSS variables with hsl values', () => {
        mockGetComputedStyle.mockReturnValue({
          getPropertyValue: vi.fn().mockReturnValue('hsl(240, 100%, 50%)'),
        });

        const result = colors.toHslaColor('var(--accent)');
        expect(result).toEqual({ h: 240, s: 100, l: 50, a: 1 });
      });

      it('should use fallback value when CSS variable is not defined', () => {
        mockGetComputedStyle.mockReturnValue({
          getPropertyValue: vi.fn().mockReturnValue(''),
        });

        const result = colors.toHslaColor('var(--undefined-var, #00ff00)');
        expect(result).toEqual({ h: 120, s: 100, l: 50, a: 1 });
      });

      it('should handle CSS variables with spaces', () => {
        mockGetComputedStyle.mockReturnValue({
          getPropertyValue: vi.fn().mockReturnValue('hsl(180, 50%, 50%)'),
        });

        const result = colors.toHslaColor('var( --spaced-var )');
        expect(result).toEqual({ h: 180, s: 50, l: 50, a: 1 });
      });

      it('should throw error when CSS variable cannot be resolved and no fallback', () => {
        mockGetComputedStyle.mockReturnValue({
          getPropertyValue: vi.fn().mockReturnValue(''),
        });

        expect(() => colors.toHslaColor('var(--undefined-var)')).toThrow();
      });

      it('should work in server environment without window', () => {
        // @ts-ignore
        global.window = undefined;
        // @ts-ignore
        global.getComputedStyle = undefined;

        expect(() => colors.toHslaColor('var(--brand, red)')).not.toThrow();
        const result = colors.toHslaColor('var(--brand, red)');
        expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
      });

      describe('nested CSS variables', () => {
        it('should resolve nested CSS variables in fallback', () => {
          // Mock first variable not found, second variable found
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi
              .fn()
              .mockReturnValueOnce('') // --primary-color not found
              .mockReturnValueOnce('#0000ff'), // --fallback-color found
          });

          const result = colors.toHslaColor('var(--primary-color, var(--fallback-color))');
          expect(result).toEqual({ h: 240, s: 100, l: 50, a: 1 });
        });

        it('should resolve multiple levels of nested CSS variables', () => {
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi
              .fn()
              .mockReturnValueOnce('') // --level1 not found
              .mockReturnValueOnce('') // --level2 not found
              .mockReturnValueOnce('#00ff00'), // --level3 found
          });

          const result = colors.toHslaColor('var(--level1, var(--level2, var(--level3)))');
          expect(result).toEqual({ h: 120, s: 100, l: 50, a: 1 });
        });

        it('should fall back to final static value when all variables are not found', () => {
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi
              .fn()
              .mockReturnValueOnce('') // --primary-color not found
              .mockReturnValueOnce('') // --secondary-color not found
              .mockReturnValueOnce(''), // --tertiary-color not found
          });

          const result = colors.toHslaColor(
            'var(--primary-color, var(--secondary-color, var(--tertiary-color, #ff0000)))',
          );
          expect(result).toEqual({ h: 0, s: 100, l: 50, a: 1 });
        });

        it('should handle the specific Clerk CSS variable pattern', () => {
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi
              .fn()
              .mockReturnValueOnce('') // --clerk-color-border not found
              .mockReturnValueOnce(''), // --clerk-color-neutral not found
          });

          const result = colors.toHslaColor('var(--clerk-color-border, var(--clerk-color-neutral, #000000))');
          expect(result).toEqual({ h: 0, s: 0, l: 0, a: 1 });
        });

        it('should resolve nested variables with complex static fallbacks', () => {
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi
              .fn()
              .mockReturnValueOnce('') // --border-color not found
              .mockReturnValueOnce(''), // --neutral-color not found
          });

          const result = colors.toHslaColor('var(--border-color, var(--neutral-color, rgba(255, 0, 0, 0.5)))');
          expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5 });
        });

        it('should handle nested variables with whitespace', () => {
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi
              .fn()
              .mockReturnValueOnce('') // --primary-color not found
              .mockReturnValueOnce('hsl(60, 100%, 50%)'), // --fallback-color found
          });

          const result = colors.toHslaColor('var( --primary-color , var( --fallback-color , red ) )');
          expect(result).toEqual({ h: 60, s: 100, l: 50, a: 1 });
        });

        it('should return the first resolved variable in the chain', () => {
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi.fn().mockReturnValueOnce('#800080'), // --primary-color found
          });

          const result = colors.toHslaColor('var(--primary-color, var(--fallback-color, red))');
          expect(result).toEqual({ h: 300, s: 100, l: 25, a: 1 });
        });

        it('should handle nested variables where intermediate variable is found', () => {
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi
              .fn()
              .mockReturnValueOnce('') // --primary-color not found
              .mockReturnValueOnce('rgb(255, 165, 0)'), // --secondary-color found
          });

          const result = colors.toHslaColor('var(--primary-color, var(--secondary-color, var(--tertiary-color, red)))');
          expect(result).toEqual({ h: 38, s: 100, l: 50, a: 1 });
        });

        it('should handle deeply nested variables (4+ levels)', () => {
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi
              .fn()
              .mockReturnValueOnce('') // --level1 not found
              .mockReturnValueOnce('') // --level2 not found
              .mockReturnValueOnce('') // --level3 not found
              .mockReturnValueOnce('#ff00ff'), // --level4 found
          });

          const result = colors.toHslaColor('var(--level1, var(--level2, var(--level3, var(--level4))))');
          expect(result).toEqual({ h: 300, s: 100, l: 50, a: 1 });
        });

        it('should throw error when nested variables cannot be resolved and no static fallback', () => {
          mockGetComputedStyle.mockReturnValue({
            getPropertyValue: vi
              .fn()
              .mockReturnValueOnce('') // --primary-color not found
              .mockReturnValueOnce(''), // --fallback-color not found
          });

          expect(() => colors.toHslaColor('var(--primary-color, var(--fallback-color))')).toThrow();
        });

        it('should handle real-world Clerk color variable patterns', () => {
          const testCases = [
            {
              input: 'var(--clerk-color-danger, #ef4444)',
              mockValue: '#ef4444',
              expected: { h: 0, s: 84, l: 60, a: 1 },
            },
            {
              input: 'var(--clerk-color-success, #22c543)',
              mockValue: '#22c543',
              expected: { h: 132, s: 70, l: 45, a: 1 },
            },
            {
              input: 'var(--clerk-color-warning, #f36b16)',
              mockValue: '#f36b16',
              expected: { h: 23, s: 90, l: 51, a: 1 },
            },
          ];

          testCases.forEach(({ input, mockValue, expected }) => {
            mockGetComputedStyle.mockReturnValue({
              getPropertyValue: vi.fn().mockReturnValue(mockValue),
            });

            const result = colors.toHslaColor(input);
            expect(result).toEqual(expected);
          });
        });
      });
    });

    describe('error cases', () => {
      it('should throw error for invalid color strings', () => {
        expect(() => colors.toHslaColor('invalid')).toThrow();
        expect(() => colors.toHslaColor('')).toThrow();
        expect(() => colors.toHslaColor('not-a-color')).toThrow();
      });

      it('should throw error with helpful message', () => {
        expect(() => colors.toHslaColor('invalid')).toThrow(/cannot be used as a color within 'variables'/);
      });
    });
  });

  describe('toHslaString', () => {
    it('should convert HslaColor object to string', () => {
      const hsla = { h: 0, s: 100, l: 50, a: 1 };
      const result = colors.toHslaString(hsla);
      expect(result).toBe('hsla(0, 100%, 50%, 1)');
    });

    it('should convert HslaColor object with alpha to string', () => {
      const hsla = { h: 120, s: 50, l: 25, a: 0.8 };
      const result = colors.toHslaString(hsla);
      expect(result).toBe('hsla(120, 50%, 25%, 0.8)');
    });

    it('should convert color string to hsla string', () => {
      const result = colors.toHslaString('#ff0000');
      expect(result).toBe('hsla(0, 100%, 50%, 1)');
    });

    it('should handle undefined alpha', () => {
      const hsla = { h: 0, s: 100, l: 50, a: undefined };
      const result = colors.toHslaString(hsla);
      expect(result).toBe('hsla(0, 100%, 50%, 1)');
    });
  });

  describe('changeHslaLightness', () => {
    it('should increase lightness', () => {
      const hsla = { h: 0, s: 100, l: 50, a: 1 };
      const result = colors.changeHslaLightness(hsla, 10);
      expect(result).toEqual({ h: 0, s: 100, l: 60, a: 1 });
    });

    it('should decrease lightness', () => {
      const hsla = { h: 0, s: 100, l: 50, a: 1 };
      const result = colors.changeHslaLightness(hsla, -10);
      expect(result).toEqual({ h: 0, s: 100, l: 40, a: 1 });
    });

    it('should preserve other properties', () => {
      const hsla = { h: 240, s: 75, l: 30, a: 0.8 };
      const result = colors.changeHslaLightness(hsla, 20);
      expect(result).toEqual({ h: 240, s: 75, l: 50, a: 0.8 });
    });
  });

  describe('setHslaAlpha', () => {
    it('should set alpha value', () => {
      const hsla = { h: 0, s: 100, l: 50, a: 1 };
      const result = colors.setHslaAlpha(hsla, 0.5);
      expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5 });
    });

    it('should preserve other properties', () => {
      const hsla = { h: 240, s: 75, l: 30, a: 0.8 };
      const result = colors.setHslaAlpha(hsla, 0.2);
      expect(result).toEqual({ h: 240, s: 75, l: 30, a: 0.2 });
    });
  });

  describe('lighten', () => {
    it('should return undefined for undefined color', () => {
      expect(colors.lighten(undefined)).toBeUndefined();
    });

    it('should lighten color by percentage', () => {
      const result = colors.lighten('hsl(0, 100%, 50%)', 0.2);
      expect(result).toBe('hsla(0, 100%, 60%, 1)');
    });

    it('should handle zero percentage', () => {
      const result = colors.lighten('hsl(0, 100%, 50%)', 0);
      expect(result).toBe('hsla(0, 100%, 50%, 1)');
    });

    it('should handle different color formats', () => {
      const result = colors.lighten('#ff0000', 0.1);
      expect(result).toBe('hsla(0, 100%, 55%, 1)');
    });
  });

  describe('makeSolid', () => {
    it('should return undefined for undefined color', () => {
      expect(colors.makeSolid(undefined)).toBeUndefined();
    });

    it('should make transparent color solid', () => {
      const result = colors.makeSolid('rgba(255, 0, 0, 0.5)');
      expect(result).toBe('hsla(0, 100%, 50%, 1)');
    });

    it('should keep solid color solid', () => {
      const result = colors.makeSolid('rgb(255, 0, 0)');
      expect(result).toBe('hsla(0, 100%, 50%, 1)');
    });
  });

  describe('makeTransparent', () => {
    it('should return undefined for undefined color', () => {
      expect(colors.makeTransparent(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(colors.makeTransparent('')).toBeUndefined();
    });

    it('should make color transparent by percentage', () => {
      const result = colors.makeTransparent('rgb(255, 0, 0)', 0.5);
      expect(result).toBe('hsla(0, 100%, 50%, 0.5)');
    });

    it('should handle zero percentage', () => {
      const result = colors.makeTransparent('rgb(255, 0, 0)', 0);
      expect(result).toBe('hsla(0, 100%, 50%, 1)');
    });

    it('should handle already transparent colors', () => {
      const result = colors.makeTransparent('rgba(255, 0, 0, 0.8)', 0.5);
      expect(result).toBe('hsla(0, 100%, 50%, 0.4)');
    });
  });

  describe('setAlpha', () => {
    it('should set alpha value', () => {
      const result = colors.setAlpha('rgb(255, 0, 0)', 0.5);
      expect(result).toBe('hsla(0, 100%, 50%, 0.5)');
    });

    it('should handle empty string', () => {
      const result = colors.setAlpha('', 0.5);
      expect(result).toBe('');
    });

    it('should replace existing alpha', () => {
      const result = colors.setAlpha('rgba(255, 0, 0, 0.8)', 0.3);
      expect(result).toBe('hsla(0, 100%, 50%, 0.3)');
    });
  });

  describe('adjustForLightness', () => {
    it('should return undefined for undefined color', () => {
      expect(colors.adjustForLightness(undefined)).toBeUndefined();
    });

    it('should adjust lightness with default value', () => {
      const result = colors.adjustForLightness('hsl(0, 100%, 50%)');
      expect(result).toBe('hsla(0, 100%, 60%, 1)');
    });

    it('should adjust lightness with custom value', () => {
      const result = colors.adjustForLightness('hsl(0, 100%, 50%)', 10);
      expect(result).toBe('hsla(0, 100%, 70%, 1)');
    });

    it('should handle maximum lightness', () => {
      const result = colors.adjustForLightness('hsl(0, 100%, 100%)', 5);
      expect(result).toBe('hsla(0, 100%, 95%, 1)');
    });

    it('should cap lightness at 100%', () => {
      const result = colors.adjustForLightness('hsl(0, 100%, 90%)', 10);
      expect(result).toBe('hsla(0, 100%, 100%, 1)');
    });

    it('should handle different color formats', () => {
      const result = colors.adjustForLightness('#ff0000', 5);
      expect(result).toBe('hsla(0, 100%, 60%, 1)');
    });
  });

  describe('edge cases and clamping', () => {
    it('should clamp RGB values to valid range', () => {
      const result = colors.toHslaColor('rgb(300, -50, 500)');
      expect(result.h).toBeGreaterThanOrEqual(0);
      expect(result.s).toBeGreaterThanOrEqual(0);
      expect(result.l).toBeGreaterThanOrEqual(0);
      expect(result.a).toBe(1);
    });

    it('should clamp alpha values to valid range', () => {
      const result = colors.toHslaColor('rgba(255, 0, 0, 2)');
      expect(result.a).toBe(1);
    });

    it('should throw error for whitespace in color strings', () => {
      expect(() => colors.toHslaColor('  rgb(255, 0, 0)  ')).toThrow();
    });

    it('should throw error for uppercase RGB', () => {
      expect(() => colors.toHslaColor('RGB(255, 0, 0)')).toThrow();
    });
  });

  describe('complex color conversions', () => {
    it('should handle grayscale colors correctly', () => {
      const white = colors.toHslaColor('#ffffff');
      expect(white).toEqual({ h: 0, s: 0, l: 100, a: 1 });

      const black = colors.toHslaColor('#000000');
      expect(black).toEqual({ h: 0, s: 0, l: 0, a: 1 });

      const gray = colors.toHslaColor('#808080');
      expect(gray.s).toBe(0);
      expect(gray.l).toBe(50);
    });

    it('should handle bright colors correctly', () => {
      const cyan = colors.toHslaColor('#00ffff');
      expect(cyan).toEqual({ h: 180, s: 100, l: 50, a: 1 });

      const magenta = colors.toHslaColor('#ff00ff');
      expect(magenta).toEqual({ h: 300, s: 100, l: 50, a: 1 });
    });

    it('should handle dark colors correctly', () => {
      const darkRed = colors.toHslaColor('#800000');
      expect(darkRed.h).toBe(0);
      expect(darkRed.s).toBe(100);
      expect(darkRed.l).toBe(25);
    });
  });
});
