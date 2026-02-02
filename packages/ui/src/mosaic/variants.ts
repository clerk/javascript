import { fastDeepMergeAndReplace } from '@clerk/shared/utils';
// eslint-disable-next-line no-restricted-imports
import type { Interpolation, Theme } from '@emotion/react';

import { type MosaicTheme } from './theme';

type CSSObject = Record<string, any>;
// StyleFunction uses MosaicTheme to provide proper typing for theme parameter
type StyleFunction = (theme: MosaicTheme) => CSSObject;
type StyleRule = CSSObject | StyleFunction;

// Convert string literal "true" | "false" to boolean (CVA's StringToBoolean)
type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;

// Maps variant names to their allowed values (with boolean conversion)
// This is the key type that allows boolean values for variants with true/false keys
type ConfigVariants<T> = {
  [K in keyof T]?: StringToBoolean<keyof T[K]> | null | undefined;
};

// Config type - no constraint on T to preserve literal types
// NoInfer prevents TypeScript from using defaultVariants/compoundVariants for T inference
type VariantsConfig<T> = {
  base?: StyleRule;
  variants?: T;
  defaultVariants?: ConfigVariants<NoInfer<T>>;
  compoundVariants?: Array<{
    condition: ConfigVariants<NoInfer<T>>;
    styles?: StyleRule;
  }>;
};

/**
 * Identity function that provides MosaicTheme typing for style functions.
 * Use this to get autocomplete and type checking for theme properties.
 *
 * @example
 * ```ts
 * const buttonStyles = variants({
 *   base: style(theme => ({ padding: theme.spacing[2] })),
 *   variants: {
 *     variant: {
 *       primary: style(theme => ({ background: theme.colors.purple[700] })),
 *     },
 *   },
 * });
 * ```
 */
export const style = (fn: StyleFunction): StyleFunction => fn;

// Resolves a StyleRule (either a CSS object or a theme function) to a CSS object
const resolveStyleRule = (rule: StyleRule | undefined, theme: MosaicTheme): CSSObject => {
  if (!rule) {
    return {};
  }
  if (typeof rule === 'function') {
    return rule(theme);
  }
  return rule;
};

// Converts a variant value to its string key (handles boolean -> 'true'/'false')
const normalizeVariantValue = (value: any): string => {
  if (typeof value === 'boolean') {
    return String(value);
  }
  return String(value);
};

// Calculates which variants should be applied based on props and defaults
const calculateVariantsToBeApplied = (
  variants: Record<string, Record<string, StyleRule>>,
  props: Record<string, any>,
  defaultVariants: Record<string, any>,
) => {
  const variantsToApply: Record<string, any> = {};
  for (const key in variants) {
    if (key in props && props[key] !== null && props[key] !== undefined) {
      variantsToApply[key] = props[key];
    } else if (key in defaultVariants && defaultVariants[key] !== null && defaultVariants[key] !== undefined) {
      variantsToApply[key] = defaultVariants[key];
    }
  }
  return variantsToApply;
};

// Checks if a compound variant condition matches the applied variants
const conditionMatches = (
  compoundVariant: { condition: Record<string, any>; styles?: StyleRule },
  variantsToApply: Record<string, any>,
) => {
  const { condition } = compoundVariant;
  for (const key in condition) {
    if (condition[key] !== variantsToApply[key]) {
      return false;
    }
  }
  return true;
};

/**
 * Creates a variant-based style function for Emotion CSS objects.
 * Similar to CVA but works with CSS-in-JS instead of class names.
 *
 * @example
 * ```ts
 * const buttonStyles = variants({
 *   base: (theme) => ({ padding: theme.spacing[2] }),
 *   variants: {
 *     variant: {
 *       primary: (theme) => ({ background: theme.colors.purple[700] }),
 *       secondary: (theme) => ({ background: theme.colors.gray[1200] }),
 *     },
 *     size: {
 *       sm: { fontSize: '0.75rem' },
 *       md: { fontSize: '1rem' },
 *     },
 *   },
 *   defaultVariants: {
 *     variant: 'primary',
 *     size: 'md',
 *   },
 * });
 *
 * // Usage:
 * <button css={buttonStyles({ variant: 'secondary' })}>Click</button>
 * ```
 */
export function variants<T>(config: VariantsConfig<T>) {
  const { base, variants: variantDefinitions = {} as T, defaultVariants = {}, compoundVariants = [] } = config;

  return (props: ConfigVariants<T> = {}): Interpolation<Theme> => {
    return ((theme: Theme) => {
      // At runtime, theme is MosaicTheme when used within MosaicThemeProvider
      const mosaicTheme = theme as unknown as MosaicTheme;

      // Start with an empty object that will accumulate all styles
      const computedStyles: CSSObject = {};

      // Apply base styles
      const baseStyles = resolveStyleRule(base, mosaicTheme);
      if (baseStyles && typeof baseStyles === 'object') {
        fastDeepMergeAndReplace(baseStyles, computedStyles);
      }

      // Calculate which variants to apply (cast to runtime type)
      const variantsToApply = calculateVariantsToBeApplied(
        variantDefinitions as Record<string, Record<string, StyleRule>>,
        props as Record<string, any>,
        defaultVariants as Record<string, any>,
      );

      // Apply variant styles
      const variantDefs = variantDefinitions as Record<string, Record<string, StyleRule>>;
      for (const variantKey in variantsToApply) {
        const variantValue = variantsToApply[variantKey];
        const variantDef = variantDefs[variantKey];
        // Convert boolean values to string keys for lookup
        const normalizedValue = normalizeVariantValue(variantValue);
        if (variantDef && normalizedValue in variantDef) {
          const variantStyle = resolveStyleRule(variantDef[normalizedValue], mosaicTheme);
          fastDeepMergeAndReplace(variantStyle, computedStyles);
        }
      }

      // Apply compound variant styles
      for (const compoundVariant of compoundVariants) {
        if (conditionMatches(compoundVariant, variantsToApply)) {
          const compoundStyles = resolveStyleRule(compoundVariant.styles, mosaicTheme);
          fastDeepMergeAndReplace(compoundStyles, computedStyles);
        }
      }

      return computedStyles;
    }) as unknown as Interpolation<Theme>;
  };
}
