import type React from 'react';

// The public styling contract, emitted onto a component's root element:
//   1. `--cl-*` vars      — from `tokens.stylex.ts` (`:root { --cl-color-accent: … }`)
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
 * Fuse `themeProps(...)`, `stylex.props(...)`, and the consumer's incoming
 * `className`/`style` into one spreadable object. Positional, mirroring astryx's
 * helper so the consumer's `className` and `style` can be passed raw:
 *
 *   mergeProps(themeProps('button', { variant }), stylex.props(...), className, style)
 *
 * The trailing pair disambiguates by type — a string is a `className`, an object
 * is a `style` — which is why `style` is accepted directly rather than wrapped.
 * Order is deliberate: stable class + data-attrs, then StyleX atoms, then the
 * consumer's `className`/`style` last so they win.
 */
export function mergeProps(
  first: PropsObject,
  second?: PropsObject | string,
  classNameOrStyle?: string | React.CSSProperties,
  style?: React.CSSProperties,
): PropsObject {
  const secondObject = typeof second === 'string' ? { className: second } : (second ?? {});
  let merged = mergeTwoProps(first, secondObject);

  if (typeof classNameOrStyle === 'string') {
    merged = mergeTwoProps(merged, { className: classNameOrStyle });
  } else if (classNameOrStyle != null) {
    merged = mergeTwoProps(merged, { style: classNameOrStyle });
  }

  if (style != null) {
    merged = mergeTwoProps(merged, { style });
  }

  return merged;
}
