import { fastDeepMergeAndReplace } from '@clerk/shared/utils';

import { useMosaicAppearance } from './appearance';
import { expandConditions } from './conditions';
import { useMosaicTheme } from './MosaicProvider';
import type { MosaicSlotId } from './registry';
import { resolveSlotCss } from './resolveSlot';
import type { SlotProps, StyleRule, SxProp } from './slot-recipe';

/** Options accepted by `useSlot`. */
export interface UseSlotOptions {
  state?: Record<string, boolean>;
  sx?: SxProp;
}

/**
 * Sugar over `useRecipe` for an element that needs no variants — just a targetable, themeable slot.
 * Returns the `data-cl-slot` id, any truthy `state` as `data-cl-<state>` attrs, and `css` containing
 * only `sx` + the appearance cascade (no base/variant styles).
 */
export function useSlot(slot: MosaicSlotId | (string & {}), opts: UseSlotOptions = {}): SlotProps {
  const theme = useMosaicTheme();
  const parsed = useMosaicAppearance();
  const css: StyleRule = {};

  if (opts.sx) {
    fastDeepMergeAndReplace(typeof opts.sx === 'function' ? opts.sx(theme) : opts.sx, css);
  }
  for (const layer of resolveSlotCss(slot, parsed)) {
    fastDeepMergeAndReplace(layer, css);
  }

  return { 'data-cl-slot': slot, ...stateToAttrs(opts.state), css: expandConditions(css) };
}

/**
 * The barest primitive — makes any element targetable via `[data-cl-slot='…']` with zero styling
 * logic and no hook. Use when an element only needs to be addressable by the appearance API / CSS.
 */
export function slot(slot: MosaicSlotId | (string & {})): { 'data-cl-slot': string } {
  return { 'data-cl-slot': slot };
}

/** Converts a truthy state object into `data-cl-<kebab>` attributes; falsy keys are omitted. */
function stateToAttrs(state?: Record<string, boolean>): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (!state) {
    return attrs;
  }
  for (const key in state) {
    if (state[key]) {
      attrs[`data-cl-${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`] = '';
    }
  }
  return attrs;
}
