import * as React from 'react';

import type { IconName } from './registry';

/**
 * A replacement glyph for a named icon, authored as a React element (`<MyIcon />` or a raw
 * `<svg>…</svg>`). Mosaic injects its sizing/color `className`, `data-size`/`data-icon`, and any svg props
 * forwarded from the `<Icon>` call site into this element via `cloneElement`, so the override is
 * styled and targetable exactly like the built-in glyph. Author the element to accept those props
 * (a component should spread them onto its root svg; a raw svg receives them directly).
 *
 * An element rather than a render function so overrides serialize across the RSC server→client
 * boundary: `icons` can then be supplied from a Server Component. An inline function cannot cross
 * that boundary; an element (or a `'use client'` component reference) can.
 */
export type MosaicIconOverride = React.ReactElement;

/** The `icons` prop: per-name glyph overrides, applied globally. */
export type MosaicIconOverrides = Partial<Record<IconName, MosaicIconOverride>>;

const MosaicIconsContext = React.createContext<MosaicIconOverrides>({});

export const MosaicIconsProvider = MosaicIconsContext.Provider;

/** Returns the icon glyph overrides from the nearest `MosaicProvider` (or `{}` standalone). */
export const useMosaicIcons = (): MosaicIconOverrides => React.useContext(MosaicIconsContext);
