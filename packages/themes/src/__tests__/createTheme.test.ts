import { describe, expect, it, vi } from 'vitest';

import { experimental_createTheme } from '../createTheme';

describe('experimental_createTheme', () => {
  describe('Basic theme creation', () => {
    it('should create a theme with basic properties', () => {
      const theme = experimental_createTheme({
        variables: {
          colorPrimary: '#ff0000',
          colorBackground: '#ffffff',
        },
      });

      expect(theme).toHaveProperty('__type', 'prebuilt_appearance');
      expect(theme.variables).toEqual({
        colorPrimary: '#ff0000',
        colorBackground: '#ffffff',
      });
    });

    it('should create a theme with static elements', () => {
      const theme = experimental_createTheme({
        elements: {
          button: {
            backgroundColor: 'blue',
          },
        },
      });

      expect(theme).toHaveProperty('__type', 'prebuilt_appearance');
      expect(theme.elements).toEqual({
        button: {
          backgroundColor: 'blue',
        },
      });
    });
  });

  describe('Factory function behavior', () => {
    it('should return a hybrid object that works as BaseTheme', () => {
      const themeFactory = experimental_createTheme({
        variables: { colorPrimary: '#ff0000' },
      });

      // Should work as BaseTheme directly
      expect(themeFactory).toHaveProperty('__type', 'prebuilt_appearance');
      expect(themeFactory.variables).toEqual({ colorPrimary: '#ff0000' });
    });

    it('should be callable as a factory function', () => {
      const themeFactory = experimental_createTheme({
        variables: { colorPrimary: '#ff0000' },
      });

      // Should be callable
      expect(typeof themeFactory).toBe('function');

      const themeInstance = themeFactory();
      expect(themeInstance).toHaveProperty('__type', 'prebuilt_appearance');
      expect(themeInstance.variables).toEqual({ colorPrimary: '#ff0000' });
    });

    it('should accept darkModeSelector option when called as factory', () => {
      const themeFactory = experimental_createTheme({
        variables: { colorPrimary: '#ff0000' },
      });

      const themeInstance = themeFactory({ darkModeSelector: '.my-dark' });
      expect(themeInstance).toHaveProperty('__type', 'prebuilt_appearance');
      expect(themeInstance.variables).toEqual({ colorPrimary: '#ff0000' });
    });
  });

  describe('darkModeSelector with elements callback', () => {
    it('should call elements function with default darkModeSelector', () => {
      const elementsFn = vi.fn().mockReturnValue({
        button: { backgroundColor: 'red' },
      });

      const themeFactory = experimental_createTheme({
        elements: elementsFn,
      });

      // When accessed as BaseTheme (default behavior)
      expect(elementsFn).toHaveBeenCalledWith('.dark');
      expect(themeFactory.elements).toEqual({
        button: { backgroundColor: 'red' },
      });
    });

    it('should call elements function with custom darkModeSelector', () => {
      const elementsFn = vi.fn().mockReturnValue({
        button: { backgroundColor: 'blue' },
      });

      const themeFactory = experimental_createTheme({
        elements: elementsFn,
      });

      // Reset the mock since it was called during theme creation
      elementsFn.mockClear();

      // When called as factory with custom selector
      const themeInstance = themeFactory({ darkModeSelector: '.custom-dark' });

      expect(elementsFn).toHaveBeenCalledWith('.custom-dark');
      expect(themeInstance.elements).toEqual({
        button: { backgroundColor: 'blue' },
      });
    });

    it('should use darkModeSelector in CSS selectors', () => {
      const themeFactory = experimental_createTheme({
        elements: (darkModeSelector: string) => ({
          button: {
            backgroundColor: 'red',
            [darkModeSelector]: {
              backgroundColor: 'blue',
            },
          },
        }),
      });

      const themeInstance = themeFactory({ darkModeSelector: '.my-dark-mode' });

      expect(themeInstance.elements).toEqual({
        button: {
          backgroundColor: 'red',
          '.my-dark-mode': {
            backgroundColor: 'blue',
          },
        },
      });
    });

    it('should handle complex selectors with darkModeSelector', () => {
      const themeFactory = experimental_createTheme({
        elements: (darkModeSelector: string) => ({
          button: {
            backgroundColor: 'red',
            [`${darkModeSelector} &`]: {
              backgroundColor: 'blue',
            },
            [`${darkModeSelector} &:hover`]: {
              backgroundColor: 'green',
            },
          },
        }),
      });

      const themeInstance = themeFactory({ darkModeSelector: '.dark' });

      expect(themeInstance.elements).toEqual({
        button: {
          backgroundColor: 'red',
          '.dark &': {
            backgroundColor: 'blue',
          },
          '.dark &:hover': {
            backgroundColor: 'green',
          },
        },
      });
    });
  });

  describe('baseTheme inheritance', () => {
    it('should merge variables from baseTheme', () => {
      const baseTheme = experimental_createTheme({
        variables: {
          colorPrimary: '#base-primary',
          colorBackground: '#base-bg',
        },
      });

      const childTheme = experimental_createTheme({
        baseTheme,
        variables: {
          colorPrimary: '#child-primary', // Should override
        },
      });

      expect(childTheme.variables).toEqual({
        colorPrimary: '#child-primary', // Overridden
        colorBackground: '#base-bg', // Inherited
      });
    });

    it('should merge elements from baseTheme', () => {
      const baseTheme = experimental_createTheme({
        elements: {
          button: { backgroundColor: 'base-color' },
          input: { borderColor: 'base-border' },
        },
      });

      const childTheme = experimental_createTheme({
        baseTheme,
        elements: {
          button: { backgroundColor: 'child-color' }, // Should override
        },
      });

      expect(childTheme.elements).toEqual({
        button: { backgroundColor: 'child-color' }, // Overridden
        input: { borderColor: 'base-border' }, // Inherited
      });
    });

    it('should work with baseTheme and darkModeSelector elements callback', () => {
      const baseTheme = experimental_createTheme({
        variables: { colorPrimary: '#base' },
        elements: { input: { borderColor: 'gray' } },
      });

      const childTheme = experimental_createTheme({
        baseTheme,
        elements: (darkModeSelector: string) => ({
          button: {
            backgroundColor: 'red',
            [darkModeSelector]: { backgroundColor: 'blue' },
          },
        }),
      });

      expect(childTheme.variables).toEqual({ colorPrimary: '#base' });
      expect(childTheme.elements).toEqual({
        input: { borderColor: 'gray' }, // From base
        button: {
          backgroundColor: 'red',
          '.dark': { backgroundColor: 'blue' },
        },
      });
    });
  });

  describe('Backwards compatibility', () => {
    it('should work with existing theme usage patterns', () => {
      // Simulate existing usage
      const myTheme = experimental_createTheme({
        variables: { colorPrimary: '#legacy' },
        elements: { button: { padding: '10px' } },
      });

      // Should work as BaseTheme directly (backwards compatibility)
      const appearance = { theme: myTheme };

      expect(appearance.theme).toHaveProperty('__type', 'prebuilt_appearance');
      expect(appearance.theme.variables).toEqual({ colorPrimary: '#legacy' });
      expect(appearance.theme.elements).toEqual({ button: { padding: '10px' } });
    });

    it('should maintain type compatibility', () => {
      const theme = experimental_createTheme({
        variables: { colorPrimary: '#test' },
      });

      // These should all work without TypeScript errors
      const directUsage = theme;
      const factoryUsage = theme();
      const withOptions = theme({ darkModeSelector: '.custom' });

      expect(directUsage.__type).toBe('prebuilt_appearance');
      expect(factoryUsage.__type).toBe('prebuilt_appearance');
      expect(withOptions.__type).toBe('prebuilt_appearance');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty theme configuration', () => {
      const theme = experimental_createTheme({});

      expect(theme).toHaveProperty('__type', 'prebuilt_appearance');
      expect(theme.variables).toBeUndefined();
      expect(theme.elements).toBeUndefined();
    });

    it('should handle undefined darkModeSelector (use default)', () => {
      const elementsFn = vi.fn().mockReturnValue({ button: {} });

      const themeFactory = experimental_createTheme({
        elements: elementsFn,
      });

      elementsFn.mockClear();
      const themeInstance = themeFactory({ darkModeSelector: undefined });

      expect(elementsFn).toHaveBeenCalledWith('.dark'); // Should use default
    });

    it('should handle empty string darkModeSelector', () => {
      const elementsFn = vi.fn().mockReturnValue({ button: {} });

      const themeFactory = experimental_createTheme({
        elements: elementsFn,
      });

      elementsFn.mockClear();
      const themeInstance = themeFactory({ darkModeSelector: '' });

      expect(elementsFn).toHaveBeenCalledWith('.dark'); // Should fallback to default
    });
  });
});
