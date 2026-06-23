import * as React from 'react';

import type { IconName } from './icons/registry';
import type { MosaicElements } from './registry';
import type { MosaicVariables } from './variables';

/**
 * The props handed to an icon override: the resolved `className` (Mosaic's sizing/color, applied to
 * the override exactly as to the built-in glyph, so icons stay visually consistent), `data-cl-slot`
 * for targeting, and any forwarded `svg` props. Spread them onto your element.
 */
export type MosaicIconRenderProps = React.ComponentPropsWithoutRef<'svg'> & { 'data-cl-slot'?: string };

/** Replaces a named icon's glyph. Spread the received props onto your element so Mosaic styling applies. */
export type MosaicIconRenderer = (props: MosaicIconRenderProps) => React.ReactElement;

/** `appearance.icons`: per-name glyph overrides, applied globally. */
export type MosaicIconOverrides = Partial<Record<IconName, MosaicIconRenderer>>;

/**
 * The flow-scope keys an `appearance` may carry. Overrides nested under one of these keys (inside
 * `elements`) apply only inside the matching mounted flow — e.g. `appearance.elements.signIn.button`
 * styles `button` only inside `<SignIn>`. Mirrors the legacy `parseAppearance` scoping.
 */
const SCOPE_KEYS = [
  'signIn',
  'signUp',
  'userButton',
  'userProfile',
  'organizationProfile',
  'organizationSwitcher',
  'createOrganization',
  'organizationList',
  'oneTap',
  'waitlist',
] as const;

export type MosaicScopeKey = (typeof SCOPE_KEYS)[number];

const SCOPE_KEY_SET = new Set<string>(SCOPE_KEYS);

/**
 * The `elements` map: slot id → style override, plus optional per-flow scope keys whose values are
 * nested slot → style maps. Scoping lives *inside* `elements`; it never carries `variables`.
 */
export type MosaicScopedElements = MosaicElements & {
  [K in MosaicScopeKey]?: MosaicElements;
};

/**
 * The public `appearance` object. `variables` overrides design tokens **globally** (not scopable);
 * `elements` styles parts globally and, via nested scope keys, per flow.
 */
export interface MosaicAppearance {
  variables?: MosaicVariables;
  elements?: MosaicScopedElements;
  /** Per-name icon glyph overrides (global). See `MosaicIconOverrides`. */
  icons?: MosaicIconOverrides;
}

/**
 * The resolver input: an ordered array of element layers, low → high precedence
 * (`[global, scoped]`). Later layers win — scoping falls out of order, so the resolver needs no
 * special-casing.
 */
export type ParsedMosaicElements = MosaicElements[];

const MosaicAppearanceContext = React.createContext<ParsedMosaicElements>([]);

export const MosaicAppearanceProvider = MosaicAppearanceContext.Provider;

/** Returns the ordered element layers from the nearest `MosaicProvider` (or `[]` standalone). */
export const useMosaicAppearance = (): ParsedMosaicElements => React.useContext(MosaicAppearanceContext);

const MosaicIconsContext = React.createContext<MosaicIconOverrides>({});

export const MosaicIconsProvider = MosaicIconsContext.Provider;

/** Returns the icon glyph overrides from the nearest `MosaicProvider` (or `{}` standalone). */
export const useMosaicIcons = (): MosaicIconOverrides => React.useContext(MosaicIconsContext);

/**
 * Flattens `appearance.elements` into ordered layers for the active `scope`: the global slot
 * overrides (scope keys stripped out) first, then the scoped overrides, so scoped wins by order.
 */
export function parseMosaicAppearance(appearance?: MosaicAppearance, scope?: string): ParsedMosaicElements {
  const elements = appearance?.elements;
  if (!elements) {
    return [];
  }

  const entries = elements as Record<string, MosaicElements[string] | MosaicElements | undefined>;
  const global: MosaicElements = {};
  for (const key in entries) {
    if (!SCOPE_KEY_SET.has(key)) {
      global[key] = entries[key] as MosaicElements[string];
    }
  }

  const layers: ParsedMosaicElements = [];
  if (Object.keys(global).length > 0) {
    layers.push(global);
  }
  if (scope && SCOPE_KEY_SET.has(scope)) {
    const scoped = entries[scope] as MosaicElements | undefined;
    if (scoped) {
      layers.push(scoped);
    }
  }
  return layers;
}
