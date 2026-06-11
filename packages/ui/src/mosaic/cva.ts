import { fastDeepMergeAndReplace } from '@clerk/shared/utils';

import { defaultMosaicVariables, resolveVariables } from './variables';
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
  variants?: V;
  compoundVariants?: Array<CompoundVariant<V>>;
  defaultVariants?: VariantPropsOf<V>;
};

/** The curried function returned by `cva`: receives variant props, returns a theme → StyleRule resolver. */
type CvaFn<V extends Variants> = {
  (props?: VariantPropsOf<V> & { sx?: SxProp }): (theme: MosaicTheme) => StyleRule;
  /** Variant definitions exposed for tooling. Not part of the public API. */
  _variants: V;
  /** Default variant values exposed for tooling. Not part of the public API. */
  _defaultVariants: VariantPropsOf<V>;
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
export function cva<V extends Variants = Record<never, never>>(config: CvaConfig<V>): CvaFn<V>;
export function cva<V extends Variants = Record<never, never>>(
  configFn: (theme: MosaicTheme) => CvaConfig<V>,
): CvaFn<V>;
export function cva<V extends Variants = Record<never, never>>(
  configOrFn: CvaConfig<V> | ((theme: MosaicTheme) => CvaConfig<V>),
): CvaFn<V> {
  const configCache = typeof configOrFn === 'function' ? new WeakMap<MosaicTheme, CvaConfig<V>>() : null;
  const fn = ((props: VariantPropsOf<V> & { sx?: SxProp } = {} as VariantPropsOf<V>) =>
    (theme: MosaicTheme): StyleRule => {
      let config: CvaConfig<V>;
      if (configCache) {
        let cached = configCache.get(theme);
        if (!cached) {
          cached = (configOrFn as (theme: MosaicTheme) => CvaConfig<V>)(theme);
          configCache.set(theme, cached);
        }
        config = cached;
      } else {
        config = configOrFn as CvaConfig<V>;
      }
      const { base, variants, compoundVariants, defaultVariants = EMPTY } = config;
      const computedStyles: StyleRule = {};
      if (base) fastDeepMergeAndReplace(base, computedStyles);

      // Resolve and merge each variant axis in a single pass. The `resolved` map is only
      // needed to match compound variants, so it's built lazily — components without
      // compound variants (the common case) skip the allocation entirely.
      const hasCompounds = !!compoundVariants && compoundVariants.length > 0;
      const resolved: Record<string, string> | null = hasCompounds ? {} : null;
      for (const key in variants) {
        const propValue = (props as Record<string, any>)[key];
        const raw = propValue !== undefined ? propValue : defaultVariants[key];
        if (raw === undefined) continue;
        const value = typeof raw === 'boolean' ? String(raw) : raw;
        const rule = variants[key][value];
        if (rule) fastDeepMergeAndReplace(rule, computedStyles);
        if (resolved) resolved[key] = value;
      }
      if (resolved) {
        for (const cv of compoundVariants!) {
          if (compoundMatches(cv, resolved)) fastDeepMergeAndReplace(cv.css, computedStyles);
        }
      }

      if (props.sx) {
        const sxStyles = typeof props.sx === 'function' ? props.sx(theme) : props.sx;
        fastDeepMergeAndReplace(sxStyles, computedStyles);
      }
      return computedStyles;
    }) as CvaFn<V>;

  const resolvedConfig =
    typeof configOrFn === 'function' ? configOrFn(resolveVariables(defaultMosaicVariables)) : configOrFn;
  fn._variants = (resolvedConfig.variants ?? {}) as V;
  fn._defaultVariants = (resolvedConfig.defaultVariants ?? {}) as VariantPropsOf<V>;

  return fn;
}

// ─── cx ─────────────────────────────────────────────────────────────────────--

/**
 * Sugar over `cva` for styles with no variants — just base rules plus `sx`.
 *
 * Equivalent to `cva({ base })` but skips the `base:` wrapper. The result is a
 * full `cva` function (carries empty `_variants`/`_defaultVariants`), so it stays
 * compatible with tooling that reads variant metadata.
 *
 * @example
 * const boxStyles = cx(theme => ({ color: theme.color.primary }));
 * // In a component:
 * css={boxStyles({ sx: { opacity: 0.8 } })(theme)}
 */
export function cx(styles: StyleRule | ((theme: MosaicTheme) => StyleRule)): CvaFn<Record<never, never>> {
  return typeof styles === 'function' ? cva(theme => ({ base: styles(theme) })) : cva({ base: styles });
}

// ─── Internal ─────────────────────────────────────────────────────────────────

/** Shared empty defaults object — avoids allocating one per resolve when a config omits `defaultVariants`. */
const EMPTY: Record<string, any> = {};

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
