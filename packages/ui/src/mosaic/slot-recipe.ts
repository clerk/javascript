import { fastDeepMergeAndReplace } from '@clerk/shared/utils';
import type * as CSS from 'csstype';

import { useMosaicAppearance } from './appearance';
import { expandConditions } from './conditions';
import type { MosaicConditionKey } from './conditions';
import { useMosaicTheme } from './MosaicProvider';
import { resolveSlotClassName, resolveSlotCss } from './resolveSlot';
import { defaultMosaicVariables, resolveVariables } from './variables';
import type { MosaicTheme } from './variables';

// ─── Public Types ─────────────────────────────────────────────────────────────

/** Typed CSS properties (camelCase), with `number | string` length values so `border: 0` etc. are valid. */
type CSSProperties = CSS.Properties<number | string>;

/** Condition keys (`_hover`, `_focusVisible`, …) surfaced for autocomplete; each holds a nested `StyleRule`. */
type ConditionStyles = { [K in MosaicConditionKey]?: StyleRule };

/**
 * A CSS-in-JS style object — typed CSS properties, named conditions (`_hover`, `_disabled`, …),
 * plus arbitrary nested selectors / at-rules (`'&:hover'`, `'&[data-cl-disabled]'`, `'@media …'`).
 * Mirrors Emotion's `CSSObject`, so the `appearance.elements`, `sx`, and recipe surfaces autocomplete
 * CSS properties and conditions while still allowing raw nesting. The string index signature keeps it
 * permissive (selectors / spreads), like Emotion. Conditions are rewritten to selectors at resolve
 * time by `expandConditions`.
 */
export interface StyleRule extends CSSProperties, ConditionStyles {
  [selectorOrAtRule: string]: StyleRule | string | number | undefined;
}

/** Per-instance style override — either a static object or a function that receives the resolved theme. */
export type SxProp = StyleRule | ((theme: MosaicTheme) => StyleRule);

/** Dynamic `data-cl-*` attributes emitted by variant/state mappers — template-literal key keeps `keyof` specific. */
type SlotDataAttrs = { [K in `data-cl-${string}`]?: string };

/** The props a styled element receives: the slot id, the merged `css`, and any state data-attributes. */
export interface SlotProps extends SlotDataAttrs {
  'data-cl-slot': string;
  css: StyleRule;
  className?: string;
}

/** Maps each variant axis to its allowed values (a string union, or `boolean` for `true`/`false` axes). */
type VariantSelection<V> = {
  [A in keyof V]?: keyof V[A] extends 'true' | 'false' ? boolean : keyof V[A];
};

/**
 * Extracts the variant prop types (plus `sx`) from a recipe — the recipe equivalent of the old
 * `VariantProps<typeof buttonStyles>`. Lets a component derive its props from its recipe instead
 * of re-declaring the variant axes by hand.
 *
 * @example
 * export type ButtonProps = React.ComponentPropsWithRef<'button'> & RecipeVariantProps<typeof buttonRecipe>;
 */
export type RecipeVariantProps<R> = R extends SlotRecipe<any, infer V> ? VariantSelection<V> & { sx?: SxProp } : never;

/** Options accepted by `useRecipe`. */
export interface UseRecipeOptions<V> {
  variants?: VariantSelection<V>;
  state?: Record<string, boolean>;
  sx?: SxProp;
}

/** The compiled recipe handle returned by `defineSlotRecipe`. */
export interface SlotRecipe<SlotKeys extends string, V> {
  /** Ordered slot keys (always `['root', …]`). */
  readonly slotKeys: SlotKeys[];
  /** slotKey → public slot id (the `data-cl-slot` value). */
  readonly slotMap: Record<SlotKeys, string>;
  /** Whether this recipe was declared with the single-slot `slot:` shorthand. */
  readonly single: boolean;
  /** Resolves the (possibly theme-dependent) config for a given theme. */
  readonly resolveConfig: (theme: MosaicTheme) => SlotRecipeConfig;
  /** Variant definitions resolved against the default theme. Exposed for tooling (e.g. swingset knobs), not the public API. */
  readonly _variants: Record<string, Record<string, unknown>>;
  /** Default variant values resolved against the default theme. Exposed for tooling, not the public API. */
  readonly _defaultVariants: Record<string, unknown>;
  /** Phantom carrier for variant-prop inference. */
  readonly __variants?: V;
}

// ─── Config Shapes ──────────────────────────────────────────────────────────────

type SlotStyleMap<SlotKey extends string = string> = Partial<Record<SlotKey, StyleRule>>;

interface MultiSlotConfig<S extends Record<string, { slot: string }>, V> {
  slots: S;
  slot?: never;
  base?: Partial<Record<keyof S, StyleRule>>;
  variants?: V;
  compoundVariants?: Array<VariantSelection<V> & { css: Partial<Record<keyof S, StyleRule>> }>;
  defaultVariants?: VariantSelection<V>;
}

interface SingleSlotConfig<V> {
  slot: string;
  slots?: never;
  base?: StyleRule;
  variants?: V;
  compoundVariants?: Array<VariantSelection<V> & { css: StyleRule }>;
  defaultVariants?: VariantSelection<V>;
}

/** Normalized internal config — slot-style values are always keyed by slot key. */
interface SlotRecipeConfig {
  slots?: Record<string, { slot: string }>;
  slot?: string;
  base?: SlotStyleMap | StyleRule;
  variants?: Record<string, Record<string, SlotStyleMap | StyleRule>>;
  compoundVariants?: Array<Record<string, unknown> & { css: SlotStyleMap | StyleRule }>;
  defaultVariants?: Record<string, unknown>;
}

// ─── defineSlotRecipe ────────────────────────────────────────────────────────────

/**
 * Defines a component's styles as a slot recipe — variants + slot identity + state attrs +
 * appearance cascade in one object.
 *
 * Two forms:
 * - **Single-slot shorthand** (`slot: 'button'`) — replaces the old `cva` use case; styles target
 *   an implicit `root` slot.
 * - **Multi-slot** (`slots: { root: { slot: 'card' }, … }`) — each style block is keyed by slot key.
 *
 * Either form may be a static config or a `theme => config` function so token values can be used
 * inline while still honoring per-provider variable overrides.
 *
 * Styles resolve in order: base → variants → compound variants → sx → appearance overrides.
 */
export function defineSlotRecipe<
  S extends Record<string, { slot: string }>,
  V extends Record<string, Record<string, SlotStyleMap<keyof S & string>>> = Record<string, never>,
>(config: MultiSlotConfig<S, V> | ((theme: MosaicTheme) => MultiSlotConfig<S, V>)): SlotRecipe<keyof S & string, V>;
export function defineSlotRecipe<V extends Record<string, Record<string, StyleRule>> = Record<string, never>>(
  config: SingleSlotConfig<V> | ((theme: MosaicTheme) => SingleSlotConfig<V>),
): SlotRecipe<'root', V>;
export function defineSlotRecipe(
  configOrFn: SlotRecipeConfig | ((theme: MosaicTheme) => SlotRecipeConfig),
): SlotRecipe<string, unknown> {
  const cache = typeof configOrFn === 'function' ? new WeakMap<MosaicTheme, SlotRecipeConfig>() : null;
  const resolveConfig = (theme: MosaicTheme): SlotRecipeConfig => {
    if (typeof configOrFn !== 'function') {
      return configOrFn;
    }
    let cached = cache!.get(theme);
    if (!cached) {
      cached = configOrFn(theme);
      cache!.set(theme, cached);
    }
    return cached;
  };

  // Slot identity is theme-independent, so probe once against the default theme.
  const probe = resolveConfig(resolveVariables(defaultMosaicVariables));
  const single = probe.slot !== undefined;
  const slotMap: Record<string, string> = single
    ? { root: probe.slot as string }
    : Object.fromEntries(Object.entries(probe.slots ?? {}).map(([key, def]) => [key, def.slot]));

  return {
    slotKeys: Object.keys(slotMap),
    slotMap,
    single,
    resolveConfig,
    _variants: (probe.variants ?? {}) as Record<string, Record<string, unknown>>,
    _defaultVariants: probe.defaultVariants ?? {},
  };
}

// ─── useRecipe ───────────────────────────────────────────────────────────────────

/**
 * Resolves a slot recipe against the active theme + appearance and returns per-slot props with
 * `css` already merged (base → variants → compound → sx → appearance) and the `data-cl-slot` +
 * state data-attributes attached. The author never hand-threads `css={[cva(...), ...slot.css]}`.
 */
export function useRecipe<SlotKeys extends string, V>(
  recipe: SlotRecipe<SlotKeys, V>,
  opts: UseRecipeOptions<V> = {},
): Record<SlotKeys, SlotProps> {
  const theme = useMosaicTheme();
  const parsed = useMosaicAppearance();
  const config = recipe.resolveConfig(theme);
  const stateAttrs = stateToAttrs(opts.state);
  const resolvedVariants = resolveVariants(
    config.variants ?? {},
    (opts.variants ?? {}) as Record<string, unknown>,
    config.defaultVariants ?? {},
  );
  const result = {} as Record<SlotKeys, SlotProps>;
  for (const slotKey of recipe.slotKeys) {
    const slotId = recipe.slotMap[slotKey];
    const css: StyleRule = {};

    mergeInto(css, pickSlot(config.base, slotKey, recipe.single));
    for (const axis in resolvedVariants) {
      mergeInto(css, pickSlot(config.variants?.[axis]?.[resolvedVariants[axis]], slotKey, recipe.single));
    }
    for (const cv of config.compoundVariants ?? []) {
      if (compoundMatches(cv, resolvedVariants)) {
        mergeInto(css, pickSlot(cv.css, slotKey, recipe.single));
      }
    }
    if (opts.sx && slotKey === 'root') {
      mergeInto(css, typeof opts.sx === 'function' ? opts.sx(theme) : opts.sx);
    }
    for (const layer of resolveSlotCss(slotId, parsed)) {
      mergeInto(css, layer);
    }
    const className = resolveSlotClassName(slotId, parsed);

    result[slotKey] = {
      'data-cl-slot': slotId,
      ...variantsToAttrs(resolvedVariants, config.variants, slotKey, recipe.single),
      ...stateAttrs,
      css: expandConditions(css),
      ...(className !== undefined && { className }),
    };
  }
  return result;
}

// ─── Internal ────────────────────────────────────────────────────────────────────

/** Picks the style rule for one slot. Single-slot configs store a bare `StyleRule` for `root`. */
function pickSlot(
  value: SlotStyleMap | StyleRule | undefined,
  slotKey: string,
  single: boolean,
): StyleRule | undefined {
  if (!value) {
    return undefined;
  }
  return single ? (slotKey === 'root' ? value : undefined) : (value as SlotStyleMap)[slotKey];
}

/** Deep-merges `source` into `target` in place; later sources overwrite earlier leaves. */
function mergeInto(target: StyleRule, source: StyleRule | undefined): void {
  if (source) {
    fastDeepMergeAndReplace(source, target);
  }
}

/** Resolves each variant axis to a string key, preferring explicit props over defaults. Booleans are stringified to match variant map keys. */
function resolveVariants(
  variants: Record<string, Record<string, unknown>>,
  props: Record<string, unknown>,
  defaults: Record<string, unknown>,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const axis in variants) {
    const value = props[axis] !== undefined ? props[axis] : defaults[axis];
    if (value !== undefined) {
      resolved[axis] = typeof value === 'boolean' ? String(value) : (value as string);
    }
  }
  return resolved;
}

/** Returns true when every condition in a compound-variant entry matches the resolved variant set. */
function compoundMatches(cv: Record<string, unknown>, resolved: Record<string, string>): boolean {
  for (const key in cv) {
    if (key === 'css') {
      continue;
    }
    const cvValue = typeof cv[key] === 'boolean' ? String(cv[key]) : (cv[key] as string);
    if (resolved[key] !== cvValue) {
      return false;
    }
  }
  return true;
}

/**
 * Maps resolved variants to `data-cl-<axis>` attributes so consumers can target a specific variant
 * (e.g. `[data-cl-slot='button'][data-cl-size='sm']`). Boolean axes (`true`/`false` keys) use
 * presence semantics — the attr is emitted only when `true` — matching the state model; every other
 * axis emits its value (`data-cl-size="sm"`).
 *
 * For multi-slot recipes, a variant attr is only emitted on a slot that actually has styles for
 * that variant value — prevents parent-recipe variant attrs from leaking onto child components
 * that receive slot props via a render prop.
 */
function variantsToAttrs(
  resolved: Record<string, string>,
  variants?: Record<string, Record<string, unknown>>,
  slotKey?: string,
  single?: boolean,
): Record<`data-cl-${string}`, string> {
  const attrs: Record<`data-cl-${string}`, string> = {};
  for (const axis in resolved) {
    const value = resolved[axis];
    // Multi-slot: skip this attr if the variant value defines no styles for this slot.
    if (!single && slotKey !== undefined) {
      const variantStyles = variants?.[axis]?.[value];
      if (!variantStyles || typeof variantStyles !== 'object' || !(slotKey in variantStyles)) {
        continue;
      }
    }
    const keys = variants?.[axis] ? Object.keys(variants[axis]) : [];
    const isBoolean = keys.length > 0 && keys.every(key => key === 'true' || key === 'false');
    if (isBoolean) {
      if (value === 'true') {
        attrs[`data-cl-${kebab(axis)}`] = '';
      }
    } else {
      attrs[`data-cl-${kebab(axis)}`] = value;
    }
  }
  return attrs;
}

/** Converts a truthy state object into `data-cl-<kebab>` attributes; falsy keys are omitted. */
function stateToAttrs(state?: Record<string, boolean>): Record<`data-cl-${string}`, string> {
  const attrs: Record<`data-cl-${string}`, string> = {};
  if (!state) {
    return attrs;
  }
  for (const key in state) {
    if (state[key]) {
      attrs[`data-cl-${kebab(key)}`] = '';
    }
  }
  return attrs;
}

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
