import type { Appearance, BaseTheme, Elements, Variables } from '@clerk/types';

export type DarkModeElementsFunction = (darkModeSelector: string) => Elements;

// Support for tuple values in variables like ['#ffffff', '#212126'] (light, dark)
export type VariableValue = string | readonly [light: string, dark: string];

// Extended Variables type that supports tuple values for color properties
export type VariablesWithTuples = {
  [K in keyof Variables]: K extends
    | 'colorBackground'
    | 'colorPrimary'
    | 'colorNeutral'
    | 'colorForeground'
    | 'colorInput'
    | 'colorInputForeground'
    | 'colorPrimaryForeground'
    ? string | [string, string]
    : Variables[K];
};

type ProcessedVariables = {
  cssString: string | null;
  processedVariables: Record<string, string | number | undefined>;
};

type ThemeConfiguration = {
  variables?: VariablesWithTuples;
  elements?: Elements | DarkModeElementsFunction;
  baseTheme?: BaseTheme;
};

type ThemeOptions = {
  darkModeSelector?: string | false;
};

const CAMEL_CASE_REGEX = /[A-Z]/g;
const LEADING_HYPHEN_REGEX = /^-/;
const CSS_VAR_PREFIX = '--clerk-';
const THEME_TYPE = 'prebuilt_appearance';
const MEDIA_QUERY_PREFIX = '@media';
const CLASS_SELECTOR_PREFIX = '.';
const ID_SELECTOR_PREFIX = '#';
const INTERNAL_GLOBAL_CSS_KEY = '__internal_globalCss';

/**
 * Converts camelCase to kebab-case for CSS variables
 * @example toKebabCase('colorBackground') => 'color-background'
 * @example toKebabCase('XMLParser') => 'x-m-l-parser' (no leading hyphen)
 */
export function toKebabCase(str: string): string {
  return str.replace(CAMEL_CASE_REGEX, letter => `-${letter.toLowerCase()}`).replace(LEADING_HYPHEN_REGEX, '');
}

/**
 * Normalizes darkModeSelector with support for opting out
 * @param selector - The dark mode selector, false to opt out, or undefined for media query fallback
 * @returns null if opted out, otherwise a valid selector string
 */
export function normalizeDarkModeSelector(selector?: string | false): string | null {
  if (selector === false) {
    return null; // Opt out of dark mode CSS generation
  }

  // If no selector provided, opt out by default (light-only theme)
  // Dark mode should be explicit opt-in behavior
  if (selector === undefined) {
    return null;
  }

  // Use provided selector, trimmed
  return selector.trim() || null;
}

/**
 * Converts tuple variables to CSS variables and generates theme CSS
 * Transforms tuples like ['#ffffff', '#000000'] into CSS custom properties
 * @param variables - Variables object that may contain tuples
 * @param darkModeSelector - Dark mode selector string, or null to opt out of CSS generation
 */
export function convertTuplesToCssVariables(
  variables: Record<string, string | [string, string] | number | undefined>,
  darkModeSelector?: string | null,
): ProcessedVariables {
  const lightRules: string[] = [];
  const darkRules: string[] = [];
  const processedVariables: Record<string, string | number | undefined> = {};

  for (const [key, value] of Object.entries(variables)) {
    if (Array.isArray(value) && value.length === 2) {
      // This is a tuple [light, dark]
      const [lightValue, darkValue] = value;

      if (darkModeSelector === null) {
        // Opted out of dark mode - use light value only
        processedVariables[key] = lightValue;
      } else {
        // Generate CSS and use CSS variable reference
        const cssVarName = `${CSS_VAR_PREFIX}${toKebabCase(key)}`;

        // Add CSS rules for light and dark modes
        lightRules.push(`    ${cssVarName}: ${lightValue};`);
        darkRules.push(`    ${cssVarName}: ${darkValue};`);

        // Replace tuple with CSS variable reference in variables object
        processedVariables[key] = `var(${cssVarName})`;
      }
    } else {
      // Not a tuple - pass through as is
      processedVariables[key] = value;
    }
  }

  // Generate CSS string - handle media queries vs regular selectors
  let cssString: string | null = null;
  if (lightRules.length > 0 && darkModeSelector !== null) {
    // Use the explicit selector provided (no fallbacks)
    // darkModeSelector is guaranteed to be string here due to null check above
    const normalizedSelector = darkModeSelector as string;

    // Check if it's a media query
    if (normalizedSelector.startsWith(MEDIA_QUERY_PREFIX)) {
      // Media query - wrap dark rules in :root
      cssString = `
    :root {
${lightRules.join('\n')}
    }
    ${normalizedSelector} {
      :root {
${darkRules.join('\n')}
      }
    }
  `.trim();
    } else {
      // Regular selector - use as-is
      cssString = `
    :root {
${lightRules.join('\n')}
    }
    ${normalizedSelector} {
${darkRules.join('\n')}
    }
  `.trim();
    }
  }

  return { cssString, processedVariables };
}

/**
 * Transforms a CSS selector for proper nesting context
 * Class selectors like '.dark' become '.dark &' for parent-child relationship
 * ID selectors like '#theme' become '#theme &' for parent-child relationship
 */
export function transformSelectorForNesting(selector: string): string {
  // If it's a class or ID selector, append & for proper CSS nesting
  if (
    (selector.startsWith(CLASS_SELECTOR_PREFIX) || selector.startsWith(ID_SELECTOR_PREFIX)) &&
    !selector.includes('&')
  ) {
    return `${selector} &`;
  }
  // For media queries and other selectors, return as-is
  return selector;
}

/**
 * Resolves elements configuration - handles both static elements and function-based elements
 */
export function resolveElementsConfiguration(
  elements: Elements | DarkModeElementsFunction | undefined,
  darkModeSelector: string | null,
): Elements | undefined {
  if (!elements) {
    return undefined;
  }

  // If it's a function, call it with darkModeSelector
  if (typeof elements === 'function') {
    // If opted out of dark mode, don't call the function at all
    // since it's designed to generate dark mode styles
    if (darkModeSelector === null) {
      return undefined;
    }

    try {
      // Use the explicit selector provided (no fallbacks)
      const rawSelector = darkModeSelector;
      const selector = transformSelectorForNesting(rawSelector);
      return (elements as DarkModeElementsFunction)(selector);
    } catch (error) {
      console.warn('[Clerk Theme] Failed to call elements function with darkModeSelector:', error);
      return undefined;
    }
  }

  // Static elements - return as-is
  return elements;
}

/**
 * Resolves a baseTheme, handling both static themes and factory functions
 */
export function resolveBaseTheme(baseTheme: BaseTheme | undefined, options?: ThemeOptions): BaseTheme | undefined {
  if (!baseTheme) {
    return undefined;
  }

  // If baseTheme is a factory function, call it with the same options
  if (typeof baseTheme === 'function') {
    try {
      return (baseTheme as any)(options);
    } catch (error) {
      console.warn('[Clerk Theme] Failed to call baseTheme factory function:', error);
      return baseTheme as BaseTheme; // Fallback to treating it as static theme
    }
  }

  // Static theme - return as-is
  return baseTheme;
}

/**
 * Merges theme configurations, with child theme taking precedence
 */
export function mergeThemeConfigurations(
  baseTheme: BaseTheme | undefined,
  childConfig: ThemeConfiguration,
): {
  mergedVariables: Record<string, any> | undefined;
  mergedElements: Elements | undefined;
  mergedConfig: Record<string, any>;
} {
  const resolvedBase = (baseTheme as any) || {};

  // Merge variables and elements, avoiding empty objects
  const mergedVariables =
    resolvedBase.variables || childConfig.variables
      ? { ...resolvedBase.variables, ...childConfig.variables }
      : undefined;

  const mergedElements =
    resolvedBase.elements || childConfig.elements ? { ...resolvedBase.elements, ...childConfig.elements } : undefined;

  // Merge the entire configuration
  const mergedConfig = {
    ...resolvedBase,
    ...childConfig,
  };

  return { mergedVariables, mergedElements, mergedConfig };
}

/**
 * Creates the final theme object with proper typing and internal properties
 */
export function createThemeObject(
  config: Record<string, any>,
  variables: Record<string, any> | undefined,
  elements: Elements | undefined,
  globalCss: string | null,
): BaseTheme {
  const result = {
    ...config,
    __type: THEME_TYPE,
  } as BaseTheme;

  // Only set variables/elements if they have content
  if (variables) (result as any).variables = variables;
  if (elements) (result as any).elements = elements;

  // Include global CSS string if it exists (for media query styles)
  if (globalCss) (result as any)[INTERNAL_GLOBAL_CSS_KEY] = globalCss;

  return result;
}

/**
 * Creates a theme factory function that can generate themed instances
 */
export function createThemeFactory(config: ThemeConfiguration): (options?: ThemeOptions) => BaseTheme {
  return (options?: ThemeOptions) => {
    const darkModeSelector = normalizeDarkModeSelector(options?.darkModeSelector);

    // Resolve base theme if provided
    const resolvedBaseTheme = resolveBaseTheme(config.baseTheme, options);

    // Process elements (static or function-based)
    const processedElements = resolveElementsConfiguration(config.elements, darkModeSelector);

    // Merge configurations
    const { mergedVariables, mergedElements, mergedConfig } = mergeThemeConfigurations(resolvedBaseTheme, {
      ...config,
      elements: processedElements,
    });

    // Process tuple variables and generate CSS
    let globalCssString: string | null = null;
    let finalVariables = mergedVariables;

    if (mergedVariables) {
      const { cssString, processedVariables } = convertTuplesToCssVariables(mergedVariables, darkModeSelector);
      globalCssString = cssString;
      finalVariables = processedVariables;
    }

    // Create final theme object
    return createThemeObject(mergedConfig, finalVariables, mergedElements, globalCssString);
  };
}

// Overload for themes with function-based elements
export function experimental_createTheme<
  T extends { variables?: VariablesWithTuples; elements: DarkModeElementsFunction; baseTheme?: BaseTheme },
>(appearance: Appearance<T>): BaseTheme & ((options?: ThemeOptions) => BaseTheme);
// Overload for themes with static elements or no elements
export function experimental_createTheme<T extends { variables?: VariablesWithTuples; baseTheme?: BaseTheme }>(
  appearance: Appearance<T>,
): BaseTheme & ((options?: ThemeOptions) => BaseTheme);
export function experimental_createTheme(appearance: any) {
  // Create theme factory
  const themeFactory = createThemeFactory(appearance);

  // Create the default theme (backwards compatibility)
  const defaultTheme = themeFactory();

  // Make the default theme callable as a factory function
  const callableTheme = Object.assign(themeFactory, defaultTheme);

  return callableTheme as BaseTheme & typeof themeFactory;
}
