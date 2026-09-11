import type { ComponentProps } from '@clerk/headless/utils';
import type * as stylex from '@stylexjs/stylex';
import type React from 'react';

/**
 * The one styling prop a Mosaic part takes from the code that renders it: StyleX atoms
 * for the part's root element, composed last in its `stylex.props(...)` call so they win.
 *
 * `className` and `style` are deliberately absent. Inside `packages/ui` a flow author
 * styles a part with `xstyle`; outside it, a theme targets the `.cl-<slot>` class,
 * `data-<axis>` attrs, and `--cl-*` vars in CSS. Neither path needs raw CSS on the part.
 */
export interface MosaicStyleProps {
  xstyle?: stylex.StyleXStyles;
}

/**
 * The native props for a tag, minus the non-standard HTML `color` attribute and the
 * `className`/`style` pair, plus `xstyle`. `color` is typed `string`, so leaving it in
 * widens any component that exposes `color` as a variant union. Use for a component
 * that has no `render`.
 */
export type MosaicElementProps<Tag extends keyof React.JSX.IntrinsicElements> = Omit<
  React.ComponentPropsWithRef<Tag>,
  'color' | 'className' | 'style'
> &
  MosaicStyleProps;

/**
 * The base props every Mosaic component accepts: the native props for its default
 * tag, the `render` escape hatch that swaps the rendered element, and `xstyle`.
 *
 * Derived from the headless part contract, which already drops `color` and hands
 * `render` callbacks tag-agnostic props, so the two layers cannot drift. Mosaic
 * additionally drops `className`/`style` in favour of `xstyle` (see `MosaicStyleProps`).
 */
export type MosaicComponentProps<Tag extends keyof React.JSX.IntrinsicElements> = Omit<
  ComponentProps<Tag>,
  'className' | 'style'
> &
  MosaicStyleProps;

// The public styling contract, emitted onto a component's root element:
//   1. `--cl-*` vars      — from `tokens.stylex.ts` (`:root { --cl-color-primary: … }`)
//   2. `.cl-<slot>` class — from `themeProps` (`.cl-button { … }`)
//   3. `data-<axis>` attrs — from `themeProps` (`.cl-button[data-variant='outline']`)
//
// Consumers never target StyleX's hashed `x…` atoms; only the three hooks above.
//
// Note: the `s(n)` spacing helper is intentionally NOT here. StyleX statically
// evaluates `stylex.create` arguments, so a spacing helper called inside `create`
// must be a local binding in each component (an imported one fails to compile).

type VariantValue = string | number | boolean | null | undefined;

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * The stable class + variant reflection for a slot.
 *
 * Returns `{ className: 'cl-<slot>', 'data-<axis>': value, … }`. Each variant
 * axis becomes a `data-<axis>` attribute a consumer can scope overrides on.
 * Booleans reflect only when `true` (as an empty-string presence attr, mirroring
 * how the Emotion engine emitted `data-cl-disabled`); `null`/`undefined`/`false`
 * are skipped. The className is only the stable slot class — variant values live
 * in the data-attrs, not extra classes, to avoid colliding with consumer classes.
 */
export function themeProps(
  slot: string,
  variants?: Record<string, VariantValue>,
): { className: string } & Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const [axis, value] of Object.entries(variants ?? {})) {
    if (value == null || value === false) {
      continue;
    }
    attrs[`data-${kebab(axis)}`] = value === true ? '' : String(value);
  }
  return { className: `cl-${slot}`, ...attrs };
}

type PropsObject = {
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
};

/** Merge two prop bags, concatenating `className` and spreading `style` (overrides last). */
function mergeTwoProps(base: PropsObject, overrides: PropsObject): PropsObject {
  const merged: PropsObject = { ...base, ...overrides };

  const cls = [base.className, overrides.className].filter(Boolean).join(' ');
  if (cls) {
    merged.className = cls;
  } else {
    delete merged.className;
  }

  const mergedStyle =
    overrides.style && base.style ? { ...base.style, ...overrides.style } : overrides.style || base.style;
  if (mergedStyle) {
    merged.style = mergedStyle;
  } else {
    delete merged.style;
  }

  return merged;
}

/**
 * Fuse a part's `themeProps(...)`, its `stylex.props(...)` result, and the props it was
 * called with into one spreadable object, left to right: `className` concatenates (the
 * `cl-*` slot classes grouped first), `style` shallow-merges with the later bag winning,
 * everything else is overwritten by the later bag.
 *
 *   mergeStyleProps(themeProps('button', { variant }), stylex.props(styles.base, xstyle), rest)
 *
 * A part's public props carry no `className`/`style` (flow authors pass `xstyle`), but a
 * `render` source hands its own merged pair to the part it renders, so the incoming bag
 * can still hold them at runtime. Passing the bag through here merges that pair; a
 * trailing `{...rest}` spread would clobber the part's own class instead.
 *
 * The result keeps the last bag's prop types (minus the pair, which comes back merged), so a
 * required prop the part forwards through `rest` is still checked by the element it lands on.
 *
 * Distinct from `@clerk/headless`'s `mergeProps`: this only fuses `className`/`style`
 * and does not chain event handlers.
 */
export function mergeStyleProps<Rest extends PropsObject>(
  ...bags: [...Array<PropsObject | undefined>, Rest]
): Omit<Rest, 'className' | 'style'> & Pick<PropsObject, 'className' | 'style'>;
export function mergeStyleProps(...bags: Array<PropsObject | undefined>): PropsObject {
  let merged: PropsObject = {};
  for (const bag of bags) {
    if (bag) {
      merged = mergeTwoProps(merged, bag);
    }
  }
  if (merged.className) {
    merged.className = groupSlotClasses(merged.className);
  }
  return merged;
}

// Order carries no cascade meaning; the slot classes lead so `class="cl-heading cl-dialog-title x1…"`
// reads in devtools without hunting for them between the hashed atoms.
function groupSlotClasses(className: string): string {
  const slots: string[] = [];
  const atoms: string[] = [];
  for (const token of className.split(' ')) {
    (token.startsWith('cl-') ? slots : atoms).push(token);
  }
  return [...slots, ...atoms].join(' ');
}
