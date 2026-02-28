import { fastDeepMergeAndReplace } from '@clerk/shared/utils';
// eslint-disable-next-line no-restricted-imports
import type { Interpolation, Theme } from '@emotion/react';

import { type CeramicTheme } from './theme';

type CSSObject = Record<string, any>;
// StyleFunction uses CeramicTheme to provide proper typing for theme parameter
type StyleFunction = (theme: CeramicTheme) => CSSObject;
type StyleRule = CSSObject | StyleFunction;

// Convert string literal "true" | "false" to boolean (CVA's StringToBoolean)
type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;

/**
 * Extracts variant props type from a variant style function.
 *
 * @example
 * ```ts
 * const buttonStyles = variants({
 *   variants: {
 *     size: { sm: {...}, md: {...} },
 *     variant: { primary: {...}, secondary: {...} },
 *   },
 * });
 *
 * type ButtonProps = VariantProps<typeof buttonStyles>;
 * // { size?: 'sm' | 'md' | null | undefined; variant?: 'primary' | 'secondary' | null | undefined }
 *
 * function Button(props: ButtonProps) {
 *   return <button css={buttonStyles(props)} />;
 * }
 * ```
 */
export type VariantProps<T extends (...args: any) => any> = Parameters<T>[0];

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
 * Identity function that provides CeramicTheme typing for style functions.
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

function resolveStyleRule(rule: StyleRule | undefined, theme: CeramicTheme): CSSObject {
  if (!rule) {
    return {};
  }
  if (typeof rule === 'function') {
    return rule(theme);
  }
  return rule;
}

function normalizeVariantValue(value: unknown): string {
  return String(value);
}

function calculateVariantsToBeApplied(
  variants: Record<string, Record<string, StyleRule>>,
  props: Record<string, unknown>,
  defaultVariants: Record<string, unknown>,
): Record<string, unknown> {
  const variantsToApply: Record<string, unknown> = {};
  for (const key in variants) {
    const value = props[key] ?? defaultVariants[key];
    if (value != null) {
      variantsToApply[key] = value;
    }
  }
  return variantsToApply;
}

function conditionMatches(
  compoundVariant: { condition: Record<string, unknown>; styles?: StyleRule },
  variantsToApply: Record<string, unknown>,
): boolean {
  const { condition } = compoundVariant;
  for (const key in condition) {
    if (condition[key] !== variantsToApply[key]) {
      return false;
    }
  }
  return true;
}

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
      const ceramicTheme = theme as unknown as CeramicTheme;
      const computedStyles: CSSObject = {};
      const variantDefs = variantDefinitions as Record<string, Record<string, StyleRule>>;

      const baseStyles = resolveStyleRule(base, ceramicTheme);
      if (baseStyles && typeof baseStyles === 'object') {
        fastDeepMergeAndReplace(baseStyles, computedStyles);
      }

      const variantsToApply = calculateVariantsToBeApplied(
        variantDefs,
        props as Record<string, unknown>,
        defaultVariants as Record<string, unknown>,
      );

      for (const variantKey in variantsToApply) {
        const variantValue = variantsToApply[variantKey];
        const variantDef = variantDefs[variantKey];
        const normalizedValue = normalizeVariantValue(variantValue);
        if (variantDef && normalizedValue in variantDef) {
          const variantStyle = resolveStyleRule(variantDef[normalizedValue], ceramicTheme);
          fastDeepMergeAndReplace(variantStyle, computedStyles);
        }
      }

      for (const compoundVariant of compoundVariants) {
        if (conditionMatches(compoundVariant, variantsToApply)) {
          const compoundStyles = resolveStyleRule(compoundVariant.styles, ceramicTheme);
          fastDeepMergeAndReplace(compoundStyles, computedStyles);
        }
      }

      return computedStyles;
    }) as unknown as Interpolation<Theme>;
  };
}
