import { fastDeepMergeAndReplace } from '@clerk/shared/utils';

import type { MosaicTheme } from './variables';

export type StyleRule = Record<string, any>;

export type SxProp = StyleRule | ((theme: MosaicTheme) => StyleRule);

type Variants = Record<string, Record<string, StyleRule | null>>;

type UnwrapBooleanVariant<T> = T extends 'true' | 'false' ? boolean : T;

type VariantPropsOf<V extends Variants> = {
  [K in keyof V]?: UnwrapBooleanVariant<keyof V[K]>;
};

type CompoundVariant<V extends Variants> = VariantPropsOf<V> & { css: StyleRule };

type CvaConfig<V extends Variants> = {
  base?: StyleRule;
  variants: V;
  compoundVariants?: Array<CompoundVariant<V>>;
  defaultVariants?: VariantPropsOf<V>;
};

type CvaFn<V extends Variants> = {
  (props?: VariantPropsOf<V> & { sx?: SxProp }): (theme: MosaicTheme) => StyleRule;
};

export type VariantProps<T extends (...args: any) => any> =
  T extends CvaFn<infer V> ? VariantPropsOf<V> & { sx?: SxProp } : never;

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
      applyBase(computedStyles, base);
      applyVariantRules(computedStyles, resolved, variants);
      applyCompoundRules(computedStyles, resolved, compoundVariants);
      if (sx) {
        const sxStyles = typeof sx === 'function' ? sx(theme) : sx;
        fastDeepMergeAndReplace(sxStyles, computedStyles);
      }
      sanitizeCssVariables(computedStyles);
      return computedStyles;
    }) as CvaFn<V>;
}

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

function applyBase(target: StyleRule, base?: StyleRule) {
  if (base && typeof base === 'object') {
    fastDeepMergeAndReplace(base, target);
  }
}

function applyVariantRules(target: StyleRule, resolved: Record<string, string>, variants: Variants) {
  for (const key in resolved) {
    const variantStyles = variants[key]?.[resolved[key]];
    if (variantStyles) {
      fastDeepMergeAndReplace(variantStyles, target);
    }
  }
}

function applyCompoundRules(
  target: StyleRule,
  resolved: Record<string, string>,
  compoundVariants: Array<Record<string, any>>,
) {
  for (const cv of compoundVariants) {
    if (compoundMatches(cv, resolved)) {
      fastDeepMergeAndReplace(cv.css, target);
    }
  }
}

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

function sanitizeCssVariables(styles: StyleRule) {
  for (const key in styles) {
    if (key.startsWith('var(')) {
      styles[key.slice(4, -1)] = styles[key];
      delete styles[key];
    } else if (styles[key] !== null && typeof styles[key] === 'object') {
      sanitizeCssVariables(styles[key]);
    }
  }
}
