import { fastDeepMergeAndReplace } from '@clerk/shared/utils';

import type { StyleRule } from './slot-recipe';

/**
 * Conditions: named pseudo-state / media keys that map to a nesting chain of CSS
 * selectors (outermost first; `&` is the styled element). The same keys work in recipe `base`/
 * `variants`, the `sx` prop, and consumer `appearance.elements`, so hover/focus/etc. are finally
 * overridable through the public `elements` surface — not just inside a recipe.
 *
 * `_hover` is wrapped in `@media (hover: hover)` so it only applies on hover-capable devices.
 * `_disabled` targets the `data-cl-disabled` attribute that `useRecipe`/`useSlot` emit (not the
 * native `:disabled`), matching how disabled state is modeled across Mosaic.
 *
 * Raw selectors (`'&:active'`, `'@media …'`) remain valid as an escape hatch — only keys present
 * in this map are rewritten.
 */
export const conditions = {
  _hover: ['@media (hover: hover)', '&:hover'],
  _focus: ['&:focus'],
  _focusVisible: ['&:focus-visible'],
  _focusWithin: ['&:focus-within'],
  _active: ['&:active'],
  _disabled: ['&[data-cl-disabled]'],
  _invalid: ['&[aria-invalid="true"]'],
  _motionSafe: ['@media (prefers-reduced-motion: no-preference)'],
  _motionReduce: ['@media (prefers-reduced-motion: reduce)'],
} as const satisfies Record<string, string[]>;

/** Union of the supported condition keys (`'_hover' | '_focusVisible' | …`). */
export type MosaicConditionKey = keyof typeof conditions;

const conditionMap: Record<string, readonly string[]> = conditions;

/** Nests `value` under a chain of selectors, innermost last: `['@media …', '&:hover'] → { '@media …': { '&:hover': value } }`. */
function nest(chain: readonly string[], value: StyleRule | string | number | undefined): StyleRule {
  return chain.reduceRight<StyleRule>((acc, selector) => ({ [selector]: acc }), value as StyleRule);
}

/**
 * Recursively rewrites condition keys (`_hover`) into their nested-selector form, merging shared
 * wrappers so two condition values that resolve to the same `@media (hover: hover)` block collapse
 * into one. Runs once on the fully-merged `css` (after base → variants → compound → sx →
 * appearance), so a recipe's `_hover` and a consumer's `_hover` merge by raw key first — the
 * consumer wins — then expand together rather than producing duplicate hover blocks.
 */
export function expandConditions(input: StyleRule): StyleRule {
  const out: StyleRule = {};
  for (const key in input) {
    const value = input[key];
    const expanded = value && typeof value === 'object' ? expandConditions(value) : value;
    const chain = conditionMap[key];
    if (chain) {
      fastDeepMergeAndReplace(nest(chain, expanded), out);
    } else if (expanded && typeof expanded === 'object' && out[key] && typeof out[key] === 'object') {
      // A prior condition already expanded into this raw selector — merge rather than overwrite.
      fastDeepMergeAndReplace(expanded, out[key] as StyleRule);
    } else {
      out[key] = expanded;
    }
  }
  return out;
}
