import { fastDeepMergeAndReplace } from '@clerk/shared/utils';

import type { MosaicTheme } from './variables';

// ─── Public Types ─────────────────────────────────────────────────────────────

/** A plain CSS-in-JS style object: property names as camelCase or selector strings (e.g. `'&:hover'`). */
export type StyleRule = Record<string, any>;

/** Per-instance style override — either a static object or a function that receives the resolved theme. */
export type SxProp = StyleRule | ((theme: MosaicTheme) => StyleRule);

/**
 * Extracts the variant prop types from a `cva` result, including `sx`.
 *
 * @example
 * const buttonStyles = cva({ variants: { size: { sm: {}, md: {} } } });
 * type ButtonStyleProps = VariantProps<typeof buttonStyles>;
 * // { size?: 'sm' | 'md'; sx?: SxProp }
 */
export type VariantProps<T extends (...args: any) => any> =
  T extends CvaFn<infer V> ? VariantPropsOf<V> & { sx?: SxProp } : never;

// ─── Internal Types ───────────────────────────────────────────────────────────

type Variants = Record<string, Record<string, StyleRule | null>>;

/** Converts `'true' | 'false'` string literal keys to `boolean` so callers pass real booleans. */
type UnwrapBooleanVariant<T> = T extends 'true' | 'false' ? boolean : T;

type VariantPropsOf<V extends Variants> = {
  [K in keyof V]?: UnwrapBooleanVariant<keyof V[K]>;
};

/** A compound variant entry: all variant conditions plus a `css` block applied when they all match. */
type CompoundVariant<V extends Variants> = VariantPropsOf<V> & { css: StyleRule };

type CvaConfig<V extends Variants> = {
  base?: StyleRule;
  variants: V;
  compoundVariants?: Array<CompoundVariant<V>>;
  defaultVariants?: VariantPropsOf<V>;
};

/** The curried function returned by `cva`: receives variant props, returns a theme → StyleRule resolver. */
type CvaFn<V extends Variants> = {
  (props?: VariantPropsOf<V> & { sx?: SxProp }): (theme: MosaicTheme) => StyleRule;
};

// ─── cva ──────────────────────────────────────────────────────────────────────

/**
 * Defines a component's styles as a set of composable variants.
 *
 * Accepts either a static config object or a function that receives the resolved `MosaicTheme`,
 * allowing token values to be used directly in variant definitions.
 *
 * Styles are applied in order: base → variants → compound variants → sx.
 * Each layer deep-merges into the previous, so nested selectors (e.g. `'&:hover'`) accumulate
 * rather than replace.
 *
 * @example
 * const buttonStyles = cva(theme => ({
 *   base: { borderRadius: theme.radius.md },
 *   variants: {
 *     size: {
 *       sm: { ...theme.text('xs') },
 *       md: { ...theme.text('sm') },
 *     },
 *   },
 *   defaultVariants: { size: 'md' },
 * }));
 *
 * // In a component:
 * css={buttonStyles({ size: 'sm', sx: { opacity: 0.8 } })(theme)}
 */
export function cva<V extends Variants>(config: CvaConfig<V>): CvaFn<V>;
export function cva<V extends Variants>(configFn: (theme: MosaicTheme) => CvaConfig<V>): CvaFn<V>;
export function cva<V extends Variants>(configOrFn: CvaConfig<V> | ((theme: MosaicTheme) => CvaConfig<V>)): CvaFn<V> {
  return ((props: VariantPropsOf<V> & { sx?: SxProp } = {} as VariantPropsOf<V>) =>
    (theme: MosaicTheme): StyleRule => {
      const { sx, ...variantProps } = props;
      const config = typeof configOrFn === 'function' ? configOrFn(theme) : configOrFn;
      const { base, variants = {} as V, compoundVariants = [], defaultVariants = {} } = config;
      const resolved = resolveVariants(variants, variantProps, defaultVariants);
      const computedStyles: StyleRule = {};
      if (base) fastDeepMergeAndReplace(base, computedStyles);
      for (const key in resolved) {
        const rule = variants[key]?.[resolved[key]];
        if (rule) fastDeepMergeAndReplace(rule, computedStyles);
      }
      for (const cv of compoundVariants) {
        if (compoundMatches(cv, resolved)) fastDeepMergeAndReplace(cv.css, computedStyles);
      }
      if (sx) {
        const sxStyles = typeof sx === 'function' ? sx(theme) : sx;
        fastDeepMergeAndReplace(sxStyles, computedStyles);
      }
      return computedStyles;
    }) as CvaFn<V>;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

/** Resolves each variant axis to a string key, preferring explicit props over defaults. Booleans are stringified to match variant map keys. */
function resolveVariants(
  variants: Variants,
  props: Record<string, any>,
  defaults: Record<string, any>,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const key in variants) {
    const value = props[key] !== undefined ? props[key] : defaults[key];
    if (value !== undefined) {
      resolved[key] = typeof value === 'boolean' ? String(value) : value;
    }
  }
  return resolved;
}

/** Returns true when all conditions in a compound variant entry match the resolved variant set. */
function compoundMatches(cv: Record<string, any>, resolved: Record<string, string>): boolean {
  for (const key in cv) {
    if (key === 'css') {
      continue;
    }
    const cvValue = typeof cv[key] === 'boolean' ? String(cv[key]) : cv[key];
    if (resolved[key] !== cvValue) {
      return false;
    }
  }
  return true;
}
