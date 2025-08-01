import { describe, expect, it, vi } from 'vitest';

import {
  createThemeFactory,
  createThemeObject,
  experimental_createTheme,
  mergeThemeConfigurations,
  normalizeDarkModeSelector,
  processElements,
  processTupleVariables,
  resolveBaseTheme,
  toKebabCase,
  transformSelectorForNesting,
} from '../createTheme';

describe('Helper Functions', () => {
  describe('toKebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(toKebabCase('colorBackground')).toBe('color-background');
      expect(toKebabCase('colorPrimaryForeground')).toBe('color-primary-foreground');
      expect(toKebabCase('fontFamily')).toBe('font-family');
      expect(toKebabCase('backgroundColor')).toBe('background-color');
    });

    it('should handle single words', () => {
      expect(toKebabCase('color')).toBe('color');
    });

    it('should handle already lowercase strings', () => {
      expect(toKebabCase('background')).toBe('background');
    });

    it('should handle consecutive capitals', () => {
      expect(toKebabCase('XMLParser')).toBe('-x-m-l-parser');
    });
  });

  describe('transformSelectorForNesting', () => {
    it('should transform class selectors to use CSS nesting', () => {
      expect(transformSelectorForNesting('.dark')).toBe('.dark &');
      expect(transformSelectorForNesting('.theme-dark')).toBe('.theme-dark &');
      expect(transformSelectorForNesting('.custom-selector')).toBe('.custom-selector &');
    });

    it('should not transform selectors that already contain &', () => {
      expect(transformSelectorForNesting('.dark &')).toBe('.dark &');
      expect(transformSelectorForNesting('.theme & .dark')).toBe('.theme & .dark');
    });

    it('should not transform media queries', () => {
      expect(transformSelectorForNesting('@media (prefers-color-scheme: dark)')).toBe(
        '@media (prefers-color-scheme: dark)',
      );
      expect(transformSelectorForNesting('@media screen and (max-width: 768px)')).toBe(
        '@media screen and (max-width: 768px)',
      );
    });

    it('should not transform non-class selectors', () => {
      expect(transformSelectorForNesting('[data-theme="dark"]')).toBe('[data-theme="dark"]');
      expect(transformSelectorForNesting('html')).toBe('html');
      expect(transformSelectorForNesting('#dark-theme')).toBe('#dark-theme');
    });

    it('should handle complex class selectors', () => {
      expect(transformSelectorForNesting('.dark.active')).toBe('.dark.active &');
      expect(transformSelectorForNesting('.theme-dark .nested')).toBe('.theme-dark .nested &');
    });
  });

  describe('normalizeDarkModeSelector', () => {
    it('should return provided selector when valid', () => {
      expect(normalizeDarkModeSelector('.custom-dark')).toBe('.custom-dark');
      expect(normalizeDarkModeSelector('[data-theme="dark"]')).toBe('[data-theme="dark"]');
      expect(normalizeDarkModeSelector('.my-theme')).toBe('.my-theme');
    });

    it('should opt out by default when no selector provided', () => {
      expect(normalizeDarkModeSelector(undefined)).toBeNull(); // Light-only by default
      expect(normalizeDarkModeSelector('')).toBeNull(); // Empty string opts out
      expect(normalizeDarkModeSelector('   ')).toBeNull(); // Whitespace-only opts out
    });

    it('should return null when false is passed to opt out', () => {
      expect(normalizeDarkModeSelector(false)).toBeNull();
    });

    it('should trim whitespace', () => {
      expect(normalizeDarkModeSelector('  .custom-dark  ')).toBe('.custom-dark');
    });
  });

  describe('processTupleVariables', () => {
    it('should process tuple variables and generate CSS with default selector', () => {
      const variables = {
        colorBackground: ['#ffffff', '#000000'],
        colorPrimary: ['#blue', '#lightblue'],
        fontFamily: 'Arial', // Non-tuple should pass through
      };

      const result = processTupleVariables(variables, '.dark');

      expect(result.processedVariables).toEqual({
        colorBackground: 'var(--clerk-color-background)',
        colorPrimary: 'var(--clerk-color-primary)',
        fontFamily: 'Arial',
      });

      expect(result.cssString).toContain(':root {');
      expect(result.cssString).toContain('--clerk-color-background: #ffffff;');
      expect(result.cssString).toContain('--clerk-color-primary: #blue;');
      expect(result.cssString).toContain('.dark {');
      expect(result.cssString).toContain('--clerk-color-background: #000000;');
      expect(result.cssString).toContain('--clerk-color-primary: #lightblue;');
    });

    it('should generate CSS with custom dark mode selector', () => {
      const variables = {
        colorBackground: ['#fff', '#000'],
      };

      const result = processTupleVariables(variables, '[data-theme="dark"]');

      expect(result.cssString).toContain('[data-theme="dark"] {');
      expect(result.cssString).toContain('--clerk-color-background: #000;');
    });

    it('should require explicit media query selector', () => {
      const variables = {
        colorBackground: ['#fff', '#000'],
      };

      // Must be explicit - no fallbacks
      const result = processTupleVariables(variables, '@media (prefers-color-scheme: dark)');

      expect(result.cssString).toContain('@media (prefers-color-scheme: dark)');
      expect(result.cssString).toContain(':root {');
      expect(result.processedVariables.colorBackground).toBe('var(--clerk-color-background)');
    });

    it('should handle media query selectors correctly', () => {
      const variables = {
        colorBackground: ['#fff', '#000'],
      };

      const result = processTupleVariables(variables, '@media (prefers-color-scheme: dark)');

      expect(result.cssString).toContain('@media (prefers-color-scheme: dark) {');
      expect(result.cssString).toContain('      :root {'); // Check for nested :root
      expect(result.cssString).toContain('    --clerk-color-background: #000;');
      expect(result.cssString).toContain('      }'); // Closing :root
      expect(result.cssString).toContain('    }'); // Closing media query
    });

    it('should opt out of CSS generation when darkModeSelector is null', () => {
      const variables = {
        colorBackground: ['#fff', '#000'],
        colorPrimary: ['#blue', '#lightblue'],
        colorSecondary: '#red', // Non-tuple should pass through
      };

      const result = processTupleVariables(variables, null);

      expect(result.processedVariables).toEqual({
        colorBackground: '#fff', // Light value only
        colorPrimary: '#blue', // Light value only
        colorSecondary: '#red', // Non-tuple passes through
      });
      expect(result.cssString).toBeNull(); // No CSS generated
    });

    it('should handle empty variables', () => {
      const result = processTupleVariables({});
      expect(result.processedVariables).toEqual({});
      expect(result.cssString).toBeNull();
    });

    it('should handle non-tuple arrays gracefully', () => {
      const variables = {
        colorBackground: [], // Invalid tuple
        colorPrimary: ['#blue'], // Single value
        colorSecondary: ['#red', '#darkred'], // Valid tuple
      };

      const result = processTupleVariables(variables, '.dark');

      expect(result.processedVariables).toEqual({
        colorBackground: [],
        colorPrimary: ['#blue'],
        colorSecondary: 'var(--clerk-color-secondary)',
      });
      expect(result.cssString).toContain('--clerk-color-secondary: #red;');
      expect(result.cssString).toContain('--clerk-color-secondary: #darkred;');
    });

    it('should convert camelCase variable names to kebab-case CSS variables', () => {
      const variables = {
        colorPrimaryForeground: ['#000', '#fff'],
      };

      const result = processTupleVariables(variables, '.dark');

      expect(result.processedVariables.colorPrimaryForeground).toBe('var(--clerk-color-primary-foreground)');
      expect(result.cssString).toContain('--clerk-color-primary-foreground: #000;');
      expect(result.cssString).toContain('--clerk-color-primary-foreground: #fff;');
    });
  });

  describe('processElements', () => {
    it('should return undefined for no elements', () => {
      expect(processElements(undefined, '.dark')).toBeUndefined();
    });

    it('should return static elements as-is', () => {
      const elements = {
        button: { backgroundColor: 'red' },
        input: { borderColor: 'blue' },
      };

      const result = processElements(elements, '.dark');
      expect(result).toEqual(elements);
    });

    it('should call function-based elements with transformed darkModeSelector', () => {
      const elementsFn = vi.fn().mockReturnValue({
        button: { backgroundColor: 'red' },
      });

      const result = processElements(elementsFn, '.custom-dark');

      expect(elementsFn).toHaveBeenCalledWith('.custom-dark &'); // Now transformed with &
      expect(result).toEqual({ button: { backgroundColor: 'red' } });
    });

    it('should handle function errors gracefully', () => {
      const elementsFn = vi.fn().mockImplementation(() => {
        throw new Error('Function error');
      });

      // Mock console.warn to avoid test output noise
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = processElements(elementsFn, '.dark');

      expect(result).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to call elements function with darkModeSelector:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should return undefined when darkModeSelector is null (opted out)', () => {
      const elementsFn = vi.fn().mockReturnValue({
        button: { backgroundColor: 'red' },
      });

      const result = processElements(elementsFn, null);

      expect(elementsFn).not.toHaveBeenCalled(); // Function should not be called when opted out
      expect(result).toBeUndefined();
    });
  });

  describe('resolveBaseTheme', () => {
    it('should return undefined for no baseTheme', () => {
      expect(resolveBaseTheme(undefined)).toBeUndefined();
    });

    it('should return static theme as-is', () => {
      const baseTheme = {
        __type: 'prebuilt_appearance' as const,
        variables: { colorPrimary: '#blue' },
      };

      const result = resolveBaseTheme(baseTheme);
      expect(result).toBe(baseTheme);
    });

    it('should call factory function with options', () => {
      const baseThemeFactory = vi.fn().mockReturnValue({
        __type: 'prebuilt_appearance',
        variables: { colorPrimary: '#green' },
      });

      const options = { darkModeSelector: '.custom' };
      const result = resolveBaseTheme(baseThemeFactory as any, options);

      expect(baseThemeFactory).toHaveBeenCalledWith(options);
      expect(result).toEqual({
        __type: 'prebuilt_appearance',
        variables: { colorPrimary: '#green' },
      });
    });

    it('should handle factory function errors gracefully', () => {
      const baseThemeFactory = vi.fn().mockImplementation(() => {
        throw new Error('Factory error');
      });

      // Mock console.warn
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = resolveBaseTheme(baseThemeFactory as any);

      expect(result).toBe(baseThemeFactory);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to call baseTheme factory function:', expect.any(Error));

      consoleWarnSpy.mockRestore();
    });
  });

  describe('mergeThemeConfigurations', () => {
    it('should merge variables from base and child themes', () => {
      const baseTheme = {
        __type: 'prebuilt_appearance' as const,
        variables: {
          colorPrimary: '#base-blue',
          colorBackground: '#base-white',
        },
        elements: {
          button: { padding: '8px' },
        },
      };

      const childConfig = {
        variables: {
          colorPrimary: '#child-red', // Override
          colorSecondary: '#child-green', // Add new
        },
        elements: {
          input: { margin: '4px' }, // Add new
        },
      };

      const result = mergeThemeConfigurations(baseTheme, childConfig);

      expect(result.mergedVariables).toEqual({
        colorPrimary: '#child-red', // Overridden
        colorBackground: '#base-white', // Inherited
        colorSecondary: '#child-green', // Added
      });

      expect(result.mergedElements).toEqual({
        button: { padding: '8px' }, // Inherited
        input: { margin: '4px' }, // Added
      });

      expect(result.mergedConfig).toEqual({
        __type: 'prebuilt_appearance',
        variables: {
          colorPrimary: '#child-red', // Override
          colorSecondary: '#child-green', // Add new
        },
        elements: {
          input: { margin: '4px' }, // Add new
        },
      });
    });

    it('should handle missing base theme', () => {
      const childConfig = {
        variables: { colorPrimary: '#red' },
        elements: { button: { padding: '10px' } },
      };

      const result = mergeThemeConfigurations(undefined, childConfig);

      expect(result.mergedVariables).toEqual({ colorPrimary: '#red' });
      expect(result.mergedElements).toEqual({ button: { padding: '10px' } });
      expect(result.mergedConfig).toEqual(childConfig);
    });

    it('should handle empty configurations', () => {
      const result = mergeThemeConfigurations(undefined, {});

      expect(result.mergedVariables).toBeUndefined();
      expect(result.mergedElements).toBeUndefined();
      expect(result.mergedConfig).toEqual({});
    });
  });

  describe('createThemeObject', () => {
    it('should create theme object with all properties', () => {
      const config = { baseProperty: 'value' };
      const variables = { colorPrimary: '#red' };
      const elements = { button: { padding: '10px' } };
      const globalCss = ':root { --color: red; }';

      const result = createThemeObject(config, variables, elements, globalCss);

      expect(result).toEqual({
        baseProperty: 'value',
        __type: 'prebuilt_appearance',
        variables: { colorPrimary: '#red' },
        elements: { button: { padding: '10px' } },
        __internal_globalCss: ':root { --color: red; }',
      });
    });

    it('should omit undefined properties', () => {
      const config = { baseProperty: 'value' };

      const result = createThemeObject(config, undefined, undefined, null);

      expect(result).toEqual({
        baseProperty: 'value',
        __type: 'prebuilt_appearance',
      });
      expect(result).not.toHaveProperty('variables');
      expect(result).not.toHaveProperty('elements');
      expect(result).not.toHaveProperty('__internal_globalCss');
    });
  });

  describe('createThemeFactory', () => {
    it('should create a factory function that generates themes', () => {
      const config = {
        variables: {
          colorBackground: ['#ffffff', '#000000'],
          colorPrimary: '#blue',
        },
        elements: {
          button: { padding: '10px' },
        },
      };

      const factory = createThemeFactory(config);
      const theme = factory();

      expect(typeof factory).toBe('function');
      expect(theme).toHaveProperty('__type', 'prebuilt_appearance');
      expect(theme.variables?.colorBackground).toBe('#ffffff'); // Light value only by default
      expect(theme.variables?.colorPrimary).toBe('#blue');
      expect(theme.elements).toEqual({ button: { padding: '10px' } });
      expect((theme as any).__internal_globalCss).toBeUndefined(); // No CSS by default
    });

    it('should pass darkModeSelector to elements function', () => {
      const elementsFn = vi.fn().mockReturnValue({ button: { color: 'red' } });
      const config = { elements: elementsFn };

      const factory = createThemeFactory(config);
      const theme = factory({ darkModeSelector: '.custom-dark' });

      expect(elementsFn).toHaveBeenCalledWith('.custom-dark &');
      expect(theme.elements).toEqual({ button: { color: 'red' } });
    });

    it('should handle baseTheme with factory function', () => {
      const baseThemeFactory = vi.fn().mockReturnValue({
        __type: 'prebuilt_appearance',
        variables: { colorPrimary: '#base-blue' },
      });

      const config = {
        baseTheme: baseThemeFactory as any,
        variables: { colorSecondary: '#red' },
      };

      const factory = createThemeFactory(config);
      const options = { darkModeSelector: '.custom' };
      const theme = factory(options);

      expect(baseThemeFactory).toHaveBeenCalledWith(options);
      expect(theme.variables?.colorPrimary).toBe('#base-blue');
      expect(theme.variables?.colorSecondary).toBe('#red');
    });
  });
});

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
    it('should not call elements function by default (light-only theme)', () => {
      const elementsFn = vi.fn().mockReturnValue({
        button: { backgroundColor: 'red' },
      });

      const themeFactory = experimental_createTheme({
        elements: elementsFn,
      });

      // When accessed as BaseTheme (default behavior) - should be light-only
      expect(elementsFn).not.toHaveBeenCalled(); // No dark mode by default
      expect(themeFactory.elements).toBeUndefined(); // No elements without dark mode
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

      expect(elementsFn).toHaveBeenCalledWith('.custom-dark &');
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
          '.my-dark-mode &': {
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
            [darkModeSelector]: {
              backgroundColor: 'blue',
            },
            [`${darkModeSelector}:hover`]: {
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
        input: { borderColor: 'gray' }, // From base (static elements)
        // Button elements function not called by default (no dark mode)
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

    it('should handle undefined darkModeSelector (opt out)', () => {
      const elementsFn = vi.fn().mockReturnValue({ button: {} });

      const themeFactory = experimental_createTheme({
        elements: elementsFn,
      });

      elementsFn.mockClear();
      const themeInstance = themeFactory({ darkModeSelector: undefined });

      expect(elementsFn).not.toHaveBeenCalled(); // Should opt out by default
      expect(themeInstance.elements).toBeUndefined(); // No elements when opted out
    });

    it('should handle empty string darkModeSelector', () => {
      const elementsFn = vi.fn().mockReturnValue({ button: {} });

      const themeFactory = experimental_createTheme({
        elements: elementsFn,
      });

      elementsFn.mockClear();
      const themeInstance = themeFactory({ darkModeSelector: '' });

      expect(elementsFn).not.toHaveBeenCalled(); // Should opt out for empty string
      expect(themeInstance.elements).toBeUndefined(); // No elements when opted out
    });
  });

  describe('Variables with tuple values', () => {
    it('should convert tuple values to light-only by default', () => {
      const theme = experimental_createTheme({
        variables: {
          colorBackground: ['#ffffff', '#000000'],
          colorPrimary: ['#blue', '#lightblue'],
        },
      });

      // By default, tuples should use light values only (no dark mode)
      expect(theme.variables?.colorBackground).toBe('#ffffff');
      expect(theme.variables?.colorPrimary).toBe('#blue');
      expect((theme as any).__internal_globalCss).toBeUndefined(); // No CSS generated by default
    });

    it('should handle custom darkModeSelector with tuple values', () => {
      const themeFactory = experimental_createTheme({
        variables: {
          colorBackground: ['#ffffff', '#000000'],
        },
      });

      const theme = themeFactory({ darkModeSelector: '.my-dark-theme' });

      expect(theme.variables?.colorBackground).toBe('var(--clerk-color-background)');
      expect((theme as any).__internal_globalCss).toContain('.my-dark-theme');
      expect((theme as any).__internal_globalCss).toContain('--clerk-color-background: #000000;');
    });

    it('should convert camelCase tuple values to light values by default', () => {
      const theme = experimental_createTheme({
        variables: {
          colorPrimaryForeground: ['#000', '#fff'],
          colorInputBackground: ['#f0f0f0', '#333'],
        },
      });

      // By default, tuples should use light values only
      expect(theme.variables?.colorPrimaryForeground).toBe('#000');
      expect(theme.variables?.colorInputBackground).toBe('#f0f0f0');
      expect((theme as any).__internal_globalCss).toBeUndefined(); // No CSS by default

      // Test explicit dark mode with kebab-case CSS variables
      const darkTheme = experimental_createTheme({
        variables: {
          colorPrimaryForeground: ['#000', '#fff'],
          colorInputBackground: ['#f0f0f0', '#333'],
        },
      })({ darkModeSelector: '.dark' });

      expect(darkTheme.variables?.colorPrimaryForeground).toBe('var(--clerk-color-primary-foreground)');
      expect(darkTheme.variables?.colorInputBackground).toBe('var(--clerk-color-input-background)');
      expect((darkTheme as any).__internal_globalCss).toContain('--clerk-color-primary-foreground:');
      expect((darkTheme as any).__internal_globalCss).toContain('--clerk-color-input-background:');
    });

    it('should preserve string variables as-is', () => {
      const theme = experimental_createTheme({
        variables: {
          colorBackground: ['#ffffff', '#000000'], // tuple
          colorPrimary: '#blue', // string
          fontFamily: 'Arial', // string
        },
      });

      // By default, tuples use light values only, strings preserved
      expect(theme.variables?.colorBackground).toBe('#ffffff'); // Light value from tuple
      expect(theme.variables?.colorPrimary).toBe('#blue');
      expect(theme.variables?.fontFamily).toBe('Arial');
    });

    it('should work with baseTheme inheritance and tuple values', () => {
      const baseTheme = experimental_createTheme({
        variables: {
          colorBackground: ['#f0f0f0', '#111'],
          colorPrimary: '#base-blue',
        },
      });

      const childTheme = experimental_createTheme({
        baseTheme,
        variables: {
          colorBackground: ['#ffffff', '#000000'], // Override with tuple
          colorSecondary: '#child-red', // Add new variable
        },
      });

      // By default, tuples use light values only
      expect(childTheme.variables?.colorBackground).toBe('#ffffff'); // Light value from tuple
      expect(childTheme.variables?.colorPrimary).toBe('#base-blue'); // Inherited
      expect(childTheme.variables?.colorSecondary).toBe('#child-red');
      expect((childTheme as any).__internal_globalCss).toBeUndefined(); // No CSS by default
    });

    it('should not generate global CSS if no tuple values exist', () => {
      const theme = experimental_createTheme({
        variables: {
          colorPrimary: '#blue',
          fontFamily: 'Arial',
        },
      });

      expect((theme as any).__internal_globalCss).toBeUndefined();
    });

    it('should handle empty tuple arrays gracefully', () => {
      const theme = experimental_createTheme({
        variables: {
          colorBackground: [], // Invalid tuple
          colorPrimary: ['#blue'], // Invalid tuple (only one value)
          colorSecondary: ['#red', '#darkred'], // Valid tuple
        } as any,
      });

      // Invalid tuples pass through as-is, valid tuples use light values by default
      expect(theme.variables?.colorBackground).toEqual([]);
      expect(theme.variables?.colorPrimary).toEqual(['#blue']);
      expect(theme.variables?.colorSecondary).toBe('#red'); // Light value from valid tuple
      expect((theme as any).__internal_globalCss).toBeUndefined(); // No CSS by default
    });

    it('should require explicit darkModeSelector for CSS generation', () => {
      // Test explicit media query selector
      const mediaTheme = experimental_createTheme({
        variables: {
          colorBackground: ['#ffffff', '#000000'],
        },
      })({ darkModeSelector: '@media (prefers-color-scheme: dark)' });

      expect((mediaTheme as any).__internal_globalCss).toContain('@media (prefers-color-scheme: dark)');
      expect((mediaTheme as any).__internal_globalCss).toContain(':root {');
      expect((mediaTheme as any).__internal_globalCss).toContain('--clerk-color-background: #000000');
      expect(mediaTheme.variables?.colorBackground).toBe('var(--clerk-color-background)');

      // Test explicit class selector
      const classTheme = experimental_createTheme({
        variables: {
          colorBackground: ['#ffffff', '#000000'],
        },
      })({ darkModeSelector: '.dark' });

      expect((classTheme as any).__internal_globalCss).toContain('.dark {');
      expect((classTheme as any).__internal_globalCss).toContain('--clerk-color-background: #000000');
      expect(classTheme.variables?.colorBackground).toBe('var(--clerk-color-background)');
    });

    it('should opt out of tuple CSS generation when darkModeSelector is false', () => {
      const themeFactory = experimental_createTheme({
        variables: {
          colorBackground: ['#ffffff', '#000000'],
          colorPrimary: ['#blue', '#lightblue'],
          colorSecondary: '#red', // Non-tuple
        },
      });

      const theme = themeFactory({ darkModeSelector: false });

      expect(theme.variables?.colorBackground).toBe('#ffffff'); // Light value only
      expect(theme.variables?.colorPrimary).toBe('#blue'); // Light value only
      expect(theme.variables?.colorSecondary).toBe('#red'); // Non-tuple passes through
      expect((theme as any).__internal_globalCss).toBeUndefined(); // No CSS generated
    });

    it('should not process elements function when opted out of dark mode', () => {
      const themeFactory = experimental_createTheme({
        variables: {
          colorBackground: ['#ffffff', '#000000'],
        },
        elements: darkModeSelector => ({
          button: {
            backgroundColor: 'red',
            [darkModeSelector]: { backgroundColor: 'blue' },
          },
        }),
      });

      const theme = themeFactory({ darkModeSelector: false });

      expect(theme.variables?.colorBackground).toBe('#ffffff'); // Light value only
      expect((theme as any).__internal_globalCss).toBeUndefined(); // No tuple CSS
      expect(theme.elements).toBeUndefined(); // No elements generated when opted out
    });

    it('should still work with static elements when opted out', () => {
      const themeFactory = experimental_createTheme({
        variables: {
          colorBackground: ['#ffffff', '#000000'],
        },
        elements: {
          button: {
            backgroundColor: 'red',
          },
        },
      });

      const theme = themeFactory({ darkModeSelector: false });

      expect(theme.variables?.colorBackground).toBe('#ffffff'); // Light value only
      expect((theme as any).__internal_globalCss).toBeUndefined(); // No tuple CSS
      expect(theme.elements).toEqual({
        button: { backgroundColor: 'red' }, // Static elements still work
      });
    });
  });
});
