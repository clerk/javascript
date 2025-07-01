import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cssSupports } from '../../cssSupports';
import {
  createAlphaColorMixString,
  createColorMixString,
  createEmptyColorScale,
  createRelativeColorString,
  extractCSSVariableValue,
  extractCSSVariableValueWithFallback,
  extractMultipleCSSVariables,
  generateAlphaColorMix,
  generateColorMixSyntax,
  generateRelativeColorSyntax,
  getSupportedColorVariant,
  isCSSVariable,
  resolveComputedCSSColor,
  resolveComputedCSSProperty,
  resolveCSSVariable,
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

  describe('CSS Variable Utilities', () => {
    describe('isCSSVariable', () => {
      it('should return true for valid CSS variables', () => {
        expect(isCSSVariable('var(--color)')).toBe(true);
        expect(isCSSVariable('var(--primary-color)')).toBe(true);
        expect(isCSSVariable('var(--color, red)')).toBe(true);
        expect(isCSSVariable('var(--color, rgba(255, 0, 0, 0.5))')).toBe(true);
        expect(isCSSVariable('var( --color )')).toBe(true); // with spaces
      });

      it('should return false for invalid CSS variables', () => {
        expect(isCSSVariable('--color')).toBe(false);
        expect(isCSSVariable('color')).toBe(false);
        expect(isCSSVariable('red')).toBe(false);
        expect(isCSSVariable('#ff0000')).toBe(false);
        expect(isCSSVariable('rgb(255, 0, 0)')).toBe(false);
        expect(isCSSVariable('var(color)')).toBe(false); // missing --
        expect(isCSSVariable('var(--)')).toBe(false); // empty variable name
      });

      it('should handle edge cases', () => {
        expect(isCSSVariable('')).toBe(false);
        expect(isCSSVariable(' ')).toBe(false);
        // @ts-expect-error Testing runtime behavior
        expect(isCSSVariable(null)).toBe(false);
        // @ts-expect-error Testing runtime behavior
        expect(isCSSVariable(undefined)).toBe(false);
      });
    });

    describe('extractCSSVariableValue', () => {
      it('should extract values from different variable name formats', () => {
        mockGetPropertyValue.mockReturnValue('red');

        expect(extractCSSVariableValue('var(--color)')).toBe('red');
        expect(extractCSSVariableValue('--color')).toBe('red');
        expect(extractCSSVariableValue('color')).toBe('red');

        expect(mockGetPropertyValue).toHaveBeenCalledWith('--color');
      });

      it('should return null for non-existent variables', () => {
        mockGetPropertyValue.mockReturnValue('');

        expect(extractCSSVariableValue('--nonexistent')).toBe(null);
      });

      it('should trim whitespace from values', () => {
        mockGetPropertyValue.mockReturnValue('  red  ');

        expect(extractCSSVariableValue('--color')).toBe('red');
      });

      it('should use custom element when provided', () => {
        const mockElement = document.createElement('div');
        mockGetPropertyValue.mockReturnValue('blue');

        extractCSSVariableValue('--color', mockElement);

        expect(mockGetComputedStyle).toHaveBeenCalledWith(mockElement);
      });

      it('should use document.documentElement by default', () => {
        mockGetPropertyValue.mockReturnValue('green');

        extractCSSVariableValue('--color');

        expect(mockGetComputedStyle).toHaveBeenCalledWith(document.documentElement);
      });
    });

    describe('extractCSSVariableValueWithFallback', () => {
      it('should return variable value when found', () => {
        mockGetPropertyValue.mockReturnValue('red');

        expect(extractCSSVariableValueWithFallback('--color', 'blue')).toBe('red');
      });

      it('should return fallback when variable not found', () => {
        mockGetPropertyValue.mockReturnValue('');

        expect(extractCSSVariableValueWithFallback('--color', 'blue')).toBe('blue');
        expect(extractCSSVariableValueWithFallback('--color', 42)).toBe(42);
        expect(extractCSSVariableValueWithFallback('--color', null)).toBe(null);
      });
    });

    describe('extractMultipleCSSVariables', () => {
      it('should extract multiple variables', () => {
        mockGetPropertyValue.mockReturnValueOnce('red').mockReturnValueOnce('blue').mockReturnValueOnce('');

        const result = extractMultipleCSSVariables(['--primary-color', '--secondary-color', '--nonexistent-color']);

        expect(result).toEqual({
          '--primary-color': 'red',
          '--secondary-color': 'blue',
          '--nonexistent-color': null,
        });
      });

      it('should handle empty array', () => {
        const result = extractMultipleCSSVariables([]);
        expect(result).toEqual({});
      });
    });

    describe('resolveCSSVariable', () => {
      it('should resolve CSS variables with values', () => {
        mockGetPropertyValue.mockReturnValue('red');

        expect(resolveCSSVariable('var(--color)')).toBe('red');
      });

      it('should return fallback when variable not found', () => {
        mockGetPropertyValue.mockReturnValue('');

        expect(resolveCSSVariable('var(--color, blue)')).toBe('blue');
        expect(resolveCSSVariable('var(--color, rgba(255, 0, 0, 0.5))')).toBe('rgba(255, 0, 0, 0.5)');
      });

      it('should return null when variable not found and no fallback', () => {
        mockGetPropertyValue.mockReturnValue('');

        expect(resolveCSSVariable('var(--color)')).toBe(null);
      });

      it('should return null for non-CSS variables', () => {
        expect(resolveCSSVariable('red')).toBe(null);
        expect(resolveCSSVariable('#ff0000')).toBe(null);
        expect(resolveCSSVariable('--color')).toBe(null);
      });

      it('should handle whitespace in fallback values', () => {
        mockGetPropertyValue.mockReturnValue('');

        expect(resolveCSSVariable('var(--color,  blue  )')).toBe('blue');
      });

      it('should use custom element when provided', () => {
        const mockElement = document.createElement('div');
        mockGetPropertyValue.mockReturnValue('purple');

        const result = resolveCSSVariable('var(--color)', mockElement);

        expect(result).toBe('purple');
        expect(mockGetComputedStyle).toHaveBeenCalledWith(mockElement);
      });
    });
  });

  describe('resolveComputedCSSProperty', () => {
    const mockElement = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    } as any;

    const mockCreatedElement = {
      style: {
        setProperty: vi.fn(),
      },
    } as any;

    const mockGetComputedStyle = vi.fn();
    const mockCreateElement = vi.fn();

    beforeEach(() => {
      // Reset mocks
      vi.clearAllMocks();

      // Mock document.createElement
      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement,
        writable: true,
      });

      // Mock window.getComputedStyle
      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true,
      });

      // Setup createElement to return our mock element
      mockCreateElement.mockReturnValue(mockCreatedElement);

      // Setup getComputedStyle to return mock styles
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('resolved-value'),
      });
    });

    it('should resolve a basic CSS property', () => {
      const result = resolveComputedCSSProperty(mockElement, 'font-weight', '400');

      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockCreatedElement.style.setProperty).toHaveBeenCalledWith('font-weight', '400');
      expect(mockElement.appendChild).toHaveBeenCalledWith(mockCreatedElement);
      expect(mockGetComputedStyle).toHaveBeenCalledWith(mockCreatedElement);
      expect(mockElement.removeChild).toHaveBeenCalledWith(mockCreatedElement);
      expect(result).toBe('resolved-value');
    });

    it('should resolve CSS variables', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('16px'),
      });

      const result = resolveComputedCSSProperty(mockElement, 'font-size', 'var(--font-size-base)');

      expect(mockCreatedElement.style.setProperty).toHaveBeenCalledWith('font-size', 'var(--font-size-base)');
      expect(result).toBe('16px');
    });

    it('should handle font-weight properties', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('700'),
      });

      const result = resolveComputedCSSProperty(mockElement, 'font-weight', 'var(--font-weight-bold)');

      expect(result).toBe('700');
    });

    it('should handle border-radius properties', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('8px'),
      });

      const result = resolveComputedCSSProperty(mockElement, 'border-radius', 'var(--border-radius-lg)');

      expect(result).toBe('8px');
    });

    it('should handle spacing/padding properties', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('4px'),
      });

      const result = resolveComputedCSSProperty(mockElement, 'padding', 'var(--space-1)');

      expect(result).toBe('4px');
    });

    it('should trim whitespace from resolved values', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('  500  '),
      });

      const result = resolveComputedCSSProperty(mockElement, 'font-weight', 'var(--font-weight-medium)');

      expect(result).toBe('500');
    });

    it('should handle multiple property types in sequence', () => {
      const properties = [
        { name: 'font-size', value: 'var(--text-lg)', expected: '18px' },
        { name: 'font-weight', value: 'var(--font-bold)', expected: '700' },
        { name: 'border-radius', value: 'var(--radius-md)', expected: '6px' },
      ];

      properties.forEach(({ name, value, expected }) => {
        mockGetComputedStyle.mockReturnValueOnce({
          getPropertyValue: vi.fn().mockReturnValue(expected),
        });

        const result = resolveComputedCSSProperty(mockElement, name, value);
        expect(result).toBe(expected);
      });

      expect(mockCreateElement).toHaveBeenCalledTimes(3);
    });

    it('should properly clean up DOM elements', () => {
      resolveComputedCSSProperty(mockElement, 'font-size', '14px');

      expect(mockElement.appendChild).toHaveBeenCalledWith(mockCreatedElement);
      expect(mockElement.removeChild).toHaveBeenCalledWith(mockCreatedElement);
      expect(mockElement.appendChild).toHaveBeenCalledBefore(mockElement.removeChild);
    });
  });

  describe('resolveComputedCSSColor', () => {
    const mockElement = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    } as any;

    let mockCanvasInstance: any;

    const createMockCanvas = () => ({
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCanvasContext),
    });

    const mockCanvasContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      getImageData: vi.fn(),
    } as any;

    const mockCreatedElement = {
      style: {
        setProperty: vi.fn(),
      },
    } as any;

    const mockCreateElement = vi.fn();
    const mockGetComputedStyle = vi.fn();

    beforeEach(() => {
      // Reset mocks
      vi.clearAllMocks();

      // Mock document.createElement
      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement,
        writable: true,
      });

      // Mock window.getComputedStyle
      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true,
      });

      // Setup createElement to return appropriate mocks
      mockCreateElement.mockImplementation((tagName: string) => {
        if (tagName === 'div') {
          return mockCreatedElement;
        }
        if (tagName === 'canvas') {
          mockCanvasInstance = createMockCanvas();
          return mockCanvasInstance;
        }
        return {};
      });

      // Setup getComputedStyle to return mock styles
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('rgb(255, 0, 0)'),
      });

      // Setup canvas context
      mockCanvasContext.getImageData.mockReturnValue({
        data: [255, 0, 0, 255], // Red color
      });
    });

    it('should resolve a basic color to hex format', () => {
      const result = resolveComputedCSSColor(mockElement, 'red');

      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockCreatedElement.style.setProperty).toHaveBeenCalledWith('color', 'red');
      expect(mockElement.appendChild).toHaveBeenCalledWith(mockCreatedElement);
      expect(mockGetComputedStyle).toHaveBeenCalledWith(mockCreatedElement);
      expect(mockElement.removeChild).toHaveBeenCalledWith(mockCreatedElement);
      expect(result).toBe('#ff0000');
    });

    it('should handle CSS variables', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('rgb(0, 128, 255)'),
      });
      mockCanvasContext.getImageData.mockReturnValue({
        data: [0, 128, 255, 255],
      });

      const result = resolveComputedCSSColor(mockElement, 'var(--primary-color)');

      expect(mockCreatedElement.style.setProperty).toHaveBeenCalledWith('color', 'var(--primary-color)');
      expect(result).toBe('#0080ff');
    });

    it('should use custom background color', () => {
      const result = resolveComputedCSSColor(mockElement, 'blue', 'black');

      expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(0, 0, 1, 1);
      expect(result).toBe('#ff0000');
    });

    it('should default to white background when not specified', () => {
      const result = resolveComputedCSSColor(mockElement, 'green');

      expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(0, 0, 1, 1);
      expect(result).toBe('#ff0000');
    });

    it('should handle canvas context creation failure', () => {
      mockCanvasInstance = createMockCanvas();
      mockCanvasInstance.getContext.mockReturnValue(null);
      mockCreateElement.mockImplementation((tagName: string) => {
        if (tagName === 'div') {
          return mockCreatedElement;
        }
        if (tagName === 'canvas') {
          return mockCanvasInstance;
        }
        return {};
      });

      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('rgb(255, 0, 0)'),
      });

      const result = resolveComputedCSSColor(mockElement, 'red');

      expect(result).toBe('rgb(255, 0, 0)');
    });

    it('should properly format single-digit hex values', () => {
      mockCanvasContext.getImageData.mockReturnValue({
        data: [15, 5, 10, 255], // RGB values that would be single digit in hex
      });

      const result = resolveComputedCSSColor(mockElement, 'red');

      // Should pad single digits with 0
      expect(result).toBe('#0f050a');
    });

    it('should handle rgba colors with transparency', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('rgba(255, 128, 64, 0.5)'),
      });
      mockCanvasContext.getImageData.mockReturnValue({
        data: [255, 128, 64, 128], // With alpha
      });

      const result = resolveComputedCSSColor(mockElement, 'rgba(255, 128, 64, 0.5)');

      expect(result).toBe('#ff8040');
    });

    it('should handle complex CSS color functions', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('rgb(120, 60, 180)'),
      });
      mockCanvasContext.getImageData.mockReturnValue({
        data: [120, 60, 180, 255],
      });

      const result = resolveComputedCSSColor(mockElement, 'hsl(270, 50%, 47%)');

      expect(result).toBe('#783cb4');
    });

    it('should create canvas with correct dimensions', () => {
      resolveComputedCSSColor(mockElement, 'red');

      const canvasCall = mockCreateElement.mock.calls.find(call => call[0] === 'canvas');
      expect(canvasCall).toBeDefined();

      // Verify canvas setup
      expect(mockCanvasInstance.width).toBe(1);
      expect(mockCanvasInstance.height).toBe(1);
    });

    it('should call getImageData with correct parameters', () => {
      resolveComputedCSSColor(mockElement, 'blue');

      expect(mockCanvasContext.getImageData).toHaveBeenCalledWith(0, 0, 1, 1);
    });

    it('should properly clean up DOM element', () => {
      resolveComputedCSSColor(mockElement, 'purple');

      expect(mockElement.appendChild).toHaveBeenCalledWith(mockCreatedElement);
      expect(mockElement.removeChild).toHaveBeenCalledWith(mockCreatedElement);
      expect(mockElement.appendChild).toHaveBeenCalledBefore(mockElement.removeChild);
    });

    it('should set color style on temporary element', () => {
      const testColor = 'var(--test-color)';

      resolveComputedCSSColor(mockElement, testColor);

      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockCreatedElement.style.setProperty).toHaveBeenCalledWith('color', testColor);
      expect(mockElement.appendChild).toHaveBeenCalledWith(mockCreatedElement);
      expect(mockGetComputedStyle).toHaveBeenCalledWith(mockCreatedElement);
    });
  });
});
