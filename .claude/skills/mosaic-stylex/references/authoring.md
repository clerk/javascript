# Authoring component styles with StyleX

The StyleX authoring API is small. This file is the distilled version plus the
patterns astryx uses at scale. Full upstream reference: the StyleX LLM authoring
guide at https://stylexjs.com/docs/llm-resources.

## `stylex.create` — define styles as named namespaces

```tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  base: { display: 'inline-flex', alignItems: 'center', paddingBlock: 8 },
  title: { fontSize: 24, fontWeight: 'bold' },
});
```

- **Longhand + single-value shorthands only.** `paddingBlock`/`paddingInline`,
  `marginInlineStart`, `borderColor` — not `padding`, `margin`, `border`. Multi-value
  shorthands (`border: '1px solid red'` used as a single value where you'd also set
  `borderColor` elsewhere) fight the atomic model. `borderWidth`/`borderStyle`/`borderColor`
  as three keys is fine.
- **Length values are pixels by default** (`paddingBlock: 8` → `8px`).
- **`null` unsets a property** — useful in a "reset" namespace or a `default` branch.

## `stylex.props` — turn namespaces into `{ className, style }`

```tsx
<div {...stylex.props(styles.base, styles.title)} />
```

Multiple namespaces merge; **last wins** on conflict. Falsy entries are ignored,
which is the whole variant mechanism:

```tsx
stylex.props(
  styles.base,
  isActive && styles.active, // boolean && namespace
  variant === 'primary' ? styles.primary : styles.secondary,
  xstyle, // caller override, always last
);
```

In Mosaic you rarely call `stylex.props` bare on a public element — wrap it with
`mergeProps` so the stable `.cl-*` class, `data-*` attrs, and consumer
`className`/`style` fuse in one place (see `organization.md`). `stylex.props`
bare is fine on **internal** elements that carry no public contract.

## Variants = conditional composition (no recipe engine)

There is no `defineSlotRecipe`/`variants` map. A variant is one style namespace
per value, selected by indexed lookup or a boolean condition. Two idioms, both
from astryx:

**Indexed lookup** — the variant prop is the key:

```tsx
const variants = stylex.create({
  primary: { backgroundColor: colors['--cl-primary'], color: colors['--cl-primary-foreground'] },
  secondary: { backgroundColor: colors['--cl-secondary'] },
  ghost: { backgroundColor: 'transparent' },
});

const sizeStyles = stylex.create({
  sm: { height: sizes['--cl-size-sm'], paddingInline: space['--cl-spacing'] },
  md: { height: sizes['--cl-size-md'] },
});

// apply
stylex.props(styles.base, variants[variant], sizeStyles[size], xstyle);
```

Type the axis from the map so props stay in sync:

```tsx
export type ButtonSize = keyof typeof sizeStyles; // 'sm' | 'md'
```

**Boolean / compound conditions** — for multi-axis and compound cases, just
`&&`-compose. This replaces `compoundVariants`:

```tsx
stylex.props(
  styles.base,
  variant === 'filled' && intent === 'primary' && styles.filledPrimary,
  variant === 'filled' && intent === 'destructive' && styles.filledDestructive,
  variant === 'outline' && styles.outline,
  disabled && styles.disabled,
  xstyle,
);
```

**Repeated indexed scales** (spacing/gap) — build the map once, key by the step:

```tsx
const gapStyles = stylex.create({
  0: { columnGap: space['--cl-spacing-0'], rowGap: space['--cl-spacing-0'] },
  1: { columnGap: space['--cl-spacing-1'], rowGap: space['--cl-spacing-1'] },
  2: { columnGap: space['--cl-spacing-2'], rowGap: space['--cl-spacing-2'] },
});
export type SpacingStep = keyof typeof gapStyles;
```

## State styling: nest inside property values

Pseudo-classes and media queries are **values keyed by their selector**, never
top-level namespace keys. `default` is required when any conditional key is present.

```tsx
const styles = stylex.create({
  button: {
    backgroundColor: {
      default: colors['--cl-primary'],
      ':hover': `color-mix(in oklab, ${colors['--cl-primary']}, ${colors['--cl-primary-foreground']} 12%)`,
      ':active': `color-mix(in oklab, ${colors['--cl-primary']}, ${colors['--cl-primary-foreground']} 24%)`,
      ':disabled': colors['--cl-muted'],
    },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    // media as a value; nest a media query under a pseudo when both apply
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colors['--cl-primary']}`,
    },
    transitionDuration: {
      default: motion['--cl-duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
  },
});
```

Common recommended states: `:hover`, `:active`, `:focus`, `:focus-visible`,
`:focus-within`, `:disabled`. Gate `:hover` behind `@media (hover: hover)` when
you don't want it firing on touch (astryx does this consistently):

```tsx
backgroundColor: {
  default: colors['--cl-primary'],
  ':hover': { '@media (hover: hover)': colors['--cl-primary-hover'] },
},
```

That nested `':hover' → '@media (hover: hover)'` is the StyleX equivalent of
Emotion Mosaic's `_hover: ['@media (hover: hover)', '&:hover']` condition
(`packages/ui/src/mosaic/conditions.ts`). There is **no runtime condition map** in
StyleX — you don't register `_hover` and expand it later; you write the gate
inline per property. The compiled selector (`@media (hover: hover) { &:hover }`)
is identical. Key order doesn't affect output, but pseudo-outer / media-inner is
the convention. What you give up: the gate isn't applied automatically, and it's
overridden through consumer CSS (`.cl-button:hover { … }`), not a merged `_hover`
key.

Keep the gate DRY by hoisting the media string to a `defineConsts` (its values
are valid as **nested keys**, and it inlines at compile time — no runtime var):

```tsx
// media.stylex.ts
export const media = stylex.defineConsts({ hover: '@media (hover: hover)' });
```

```tsx
import { media } from './media.stylex';
backgroundColor: {
  default: colors['--cl-primary'],
  ':hover': { [media.hover]: colors['--cl-primary-hover'] },
},
```

You **cannot** wrap this in a runtime helper (`_hover(value)`) called inside
`stylex.create` — the compiler statically evaluates the `create` argument, so the
nested object literal (optionally with the `defineConsts` key) is the ceiling for
reuse. The auto-applied, appearance-overridable `_hover` was the Emotion model;
the StyleX trade is explicit, compiled gates.

`color-mix(...)` and `calc(...)` work inside values (verified in the POC), which
is how you derive hover/active shades without a runtime `theme.mix()` helper.

**Prefer JS/prop changes over `:first-child`/`:nth-child`** and **prefer real
elements over `::before`/`::after`** — both bloat the atomic sheet and hurt a11y.

## Pseudo-elements

Top-level keys within a namespace (unlike pseudo-classes, which are value-nested):

```tsx
const styles = stylex.create({
  input: {
    color: colors['--cl-foreground'],
    '::placeholder': { color: colors['--cl-muted-foreground'] },
    '::selection': { backgroundColor: colors['--cl-primary'] },
  },
});
```

## CSS reset (box-sizing, margin/padding, borders)

Mosaic is an **embedded widget**, not a whole-app framework, so it must **not**
ship a global reset (`*`, `html`, `body`, `h1`, `button`, …) the way astryx's
`reset.css` does — that would restyle the host app's entire DOM. Two scoped moves
replace it:

**1. Per-component base reset in StyleX (primary).** StyleX styles only the
element it's on, and Mosaic components are self-contained, so put the reset in each
component's `base`. Factor the repeated bits into one shared `reset` object and
compose it:

```tsx
const reset = stylex.create({
  box: { boxSizing: 'border-box', margin: 0, padding: 0 },
});

const styles = stylex.create({
  base: { display: 'inline-flex', borderRadius: radius['--cl-radius-md'] /* … */ },
});

stylex.props(reset.box, styles.base /* variants */); // reset first, so real styles win
```

This is what the POC's `button.tsx` already does implicitly — it sets
`borderWidth`/`borderStyle`/`borderColor` explicitly rather than leaning on a
global reset.

**2. A _scoped_ reset stylesheet for the genuinely universal bits.** `box-sizing`
and the border reset are things you don't want to hand-repeat on every element.
StyleX can't express a `*`/descendant selector, so ship this as **plain hand-written
CSS**, scoped to the Mosaic subtree and zero-specificity via `:where()`:

```css
@layer cl-reset {
  :where([data-cl-scope] *, [data-cl-scope] *::before, [data-cl-scope] *::after) {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid; /* now a component adds a border with just border-width + border-color */
  }
}
```

The Mosaic root carries `data-cl-scope` (the same root that sets `color-scheme` +
`container-type`). `:where()` keeps specificity 0 so component `base` styles and
consumer overrides always win; the `@layer` keeps it below everything else.

Two notes carried from astryx: the **border reset** (`border-width: 0; border-style: solid`)
is a real ergonomic win — borders become `borderWidth` + `borderColor` only. And
for layout-critical components, **also** assert `boxSizing: 'border-box'` in the
StyleX `base` (belt-and-suspenders) so they're correct even if a consumer strips
the reset sheet. Never reach for a global `*`/`body` reset.

## Accepting style overrides from a parent

Type a passthrough prop as `StyleXStyles` and place it **last** so it overrides:

```tsx
import type { StyleXStyles } from '@stylexjs/stylex';

type Props = { xstyle?: StyleXStyles };
stylex.props(styles.base, variants[variant], xstyle); // xstyle wins
```

Constrain or exclude properties when a slot must not be re-laid-out:

```tsx
import type { StyleXStyles, StyleXStylesWithout } from '@stylexjs/stylex';
type ColorOnly = StyleXStyles<{ color?: string; backgroundColor?: string }>;
type NoLayout = StyleXStylesWithout<{ margin: unknown; padding: unknown; width: unknown }>;
```

Note: an `xstyle` typed as `StyleXStyles` accepts **StyleX styles only** — it is
not the free-form `sx` object from Emotion Mosaic. Arbitrary runtime styles are
gone; see `migration.md`.

## Composition across parts

Compound components layer styles per element. A layout helper returns an array of
namespaces that the caller spreads — astryx's `stack()`/`container()` pattern:

```tsx
export function stack({ direction, gap }: StackOptions) {
  return [baseStyles.stack, directionStyles[direction], gap != null && gapStyles[gap]] as const;
}

// caller
stylex.props(...stack({ direction, gap }), xstyle);
```

Icon sizing and other sub-parts get their own indexed map, applied on the child
element:

```tsx
const iconSizeStyles = stylex.create({ sm: { width: 16, height: 16 }, md: { width: 20, height: 20 } });
<span {...stylex.props(styles.iconWrapper, iconSizeStyles[size])}>{icon}</span>;
```

## Antipatterns (StyleX will fight you or silently misbehave)

- **Top-level pseudo/media keys** in a namespace — invalid. Nest inside a value.
- **Importing non-StyleX constants** into a style value (`padding: MY_CONST`) —
  use a token (`space['--cl-spacing']`) or a `defineConsts` value.
- **`className`/`style` alongside a bare `stylex.props()` spread** — route through
  `mergeProps`.
- **Child/descendant/self-attribute selectors** (`& > div`, `&[data-selected]`) —
  unsupported. Compose a variant style object driven by the prop instead, or use a
  marker for genuine ancestor/sibling relationships (`relational-and-dynamic.md`).
- **Multi-value shorthands** where atomic merging matters — prefer longhands.
