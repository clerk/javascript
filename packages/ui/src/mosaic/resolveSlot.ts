import type { ParsedMosaicElements } from './appearance';
import type { StyleRule } from './slot-recipe';

/**
 * Collects the style overrides for a slot from each appearance layer, in order.
 *
 * One lookup per layer — no key concatenation. State/variant scoping lives inside each
 * override object as `&[data-cl-…]` selectors; component scoping is just a later layer.
 * The returned array is low → high precedence, so callers merge it front-to-back and the
 * last (most specific) layer wins. Non-object (className string) overrides are skipped.
 */
export function resolveSlotCss(slot: string, parsed: ParsedMosaicElements): StyleRule[] {
  const out: StyleRule[] = [];
  for (const layer of parsed) {
    const override = layer?.[slot];
    if (override && typeof override === 'object') {
      out.push(override);
    }
  }
  return out;
}
