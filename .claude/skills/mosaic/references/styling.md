# Styling a component with slot recipes

A styled Mosaic component is authored with one **slot recipe**. The recipe owns
everything about how the part looks and is targeted: its slot identity
(`data-cl-slot`), base styles, variants, and the appearance cascade.
`useRecipe(recipe, opts)` resolves it against the active theme + appearance and
hands back **per-slot props** — `css` already merged and every `data-cl-*`
attribute attached — that you spread onto the element. You never hand-thread
`css={[...]}`.

`references/mosaic-architecture.md` (repo root) is the full contract: the
appearance cascade + scope, the token architecture (`theme.spacing`/`alpha`/
`mix`/`text`), the condition vocabulary (`_hover`, `_disabled`, …), and the
`data-cl-*` public styling API. This file is the authoring how-to; read it
alongside two real components:

- `packages/ui/src/mosaic/components/button.tsx` — single-slot, full variants.
- `packages/ui/src/mosaic/components/tabs.tsx` — multi-slot, bridged onto a
  headless primitive.

---

## Single-slot (the common case)

`slot: 'button'` is shorthand for one implicit `root` slot. Define `base`,
`variants`, `compoundVariants`, and `defaultVariants`; register the slot id;
infer the props from the recipe; then destructure variants + state and spread the
resolved `root` props.

```tsx
import React from 'react';
import { defineSlotRecipe, useRecipe, type RecipeVariantProps } from '../slot-recipe';

export const buttonRecipe = defineSlotRecipe(theme => ({
  slot: 'button',
  base: {
    display: 'inline-flex',
    borderRadius: theme.rounded.md,
    ...theme.text('sm'),
    _focusVisible: { outline: `2px solid ${theme.alpha('primary', 50)}` },
    _disabled: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
  },
  variants: {
    intent: { primary: {}, destructive: {} },
    variant: { filled: {}, outline: {}, ghost: {} },
    size: { sm: { ...theme.text('xs') }, md: { ...theme.text('sm') } },
    fullWidth: { true: { width: '100%' }, false: {} },
  },
  compoundVariants: [
    {
      intent: 'primary',
      variant: 'filled',
      css: {
        backgroundColor: theme.color.primary,
        color: theme.color.primaryForeground,
        _hover: { backgroundColor: theme.mix('primary', 'primaryForeground', 12) },
      },
    },
  ],
  defaultVariants: { intent: 'primary', variant: 'filled', size: 'md', fullWidth: false },
}));

// Register the slot id — this is what makes `button` autocomplete in appearance.elements.
declare module '../registry' {
  interface MosaicSlotRegistry {
    button: true;
  }
}

// Infer variant props (+ sx) from the recipe — don't re-declare them by hand.
export type ButtonProps = React.ComponentPropsWithRef<'button'> & RecipeVariantProps<typeof buttonRecipe>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function MosaicButton(props, ref) {
  const { intent, variant, size, fullWidth, disabled, sx, children, ...rest } = props;
  const { root } = useRecipe(buttonRecipe, {
    variants: { intent, variant, size, fullWidth },
    state: { disabled: !!disabled },
    sx,
  });
  return (
    <button
      ref={ref}
      disabled={disabled || false}
      type='button'
      {...rest}
      {...root}
    >
      {children}
    </button>
  );
});
```

Key moves:

- **`variants` vs `state`.** A visual axis chosen by the caller (`intent`,
  `size`) is a **variant**. A runtime condition (`disabled`, `selected`,
  `invalid`) is **state** — pass it under `state:` so it emits `data-cl-disabled`
  and is styled via the `_disabled` condition, which keeps it overridable through
  `appearance.elements`. Don't model `disabled` as a boolean variant.
- **`compoundVariants`** style a combination (`intent: 'primary'` **and**
  `variant: 'filled'`) that no single axis owns.
- **`sx`** is the per-instance escape hatch; it merges last, before appearance.
- **`RecipeVariantProps<typeof recipe>`** derives `{ intent?, variant?, size?,
fullWidth?, sx? }` — the recipe is the single source of the prop types.

## Multi-slot

One recipe owns several parts under `slots`, each mapping a key to a public
`data-cl-slot` id (kebab-case). `base` is keyed by slot. Each rendered part calls
`useRecipe(recipe)` and spreads its own slot. `tabs.tsx` bridges the resolved
slots onto headless primitives, so slot identity lives in this styled layer:

```tsx
export const tabsRecipe = defineSlotRecipe(theme => ({
  slots: {
    list: { slot: 'tabs-list' },
    tab: { slot: 'tabs-tab' },
    panel: { slot: 'tabs-panel' },
    indicator: { slot: 'tabs-indicator' },
  },
  base: {
    list: { display: 'flex', gap: theme.spacing(4), borderBottom: `1px solid ${theme.alpha('primary', 10)}` },
    tab: {
      ...theme.text('sm'),
      color: theme.color.mutedForeground,
      '&[data-cl-selected]': { color: theme.color.primary },
      '&[data-cl-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
    },
    panel: { '&[data-cl-hidden]': { display: 'none' } },
    indicator: { height: '2px', backgroundColor: theme.color.primary },
  },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    'tabs-list': true;
    'tabs-tab': true;
    'tabs-panel': true;
    'tabs-indicator': true;
  }
}

const List = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.List>>(
  function TabsList(props, ref) {
    const { list } = useRecipe(tabsRecipe);
    return (
      <Primitive.List
        ref={ref}
        {...props}
        {...list}
      />
    );
  },
);
// …Tab / Panel / Indicator each read their own slot from useRecipe(tabsRecipe)…
```

Note how `tabs` targets state with **raw attribute selectors**
(`'&[data-cl-selected]'`) because those states come from the headless primitive
rather than a `useRecipe({ state })` call. When your own component owns the
state, prefer `state: { … }` + the condition keys (`_disabled`, `_hover`) so it
stays overridable through `appearance.elements`; drop to raw `&[data-cl-*]`
selectors only for states applied by something else.

## Lighter sugar: `useSlot` / `slot`

Not every part needs variants. `slot-recipe.ts` is the heavy end of one spectrum
(`useSlot.ts`):

- **`useSlot('avatarBox', { state })`** — themeable + targetable + appearance-aware,
  but no recipe. `css` is just `sx` + appearance.
- **`slot('badgeText')`** — the barest: returns only `{ 'data-cl-slot': … }` to
  make an element targetable. No hook, no css.

Reach for a full recipe only when you have variants; otherwise use `useSlot` or
`slot`. See `references/mosaic-architecture.md` → "Sugar — useSlot / slot" for
the details.

## Checklist

- Recipe with `defineSlotRecipe(theme => …)`; `slot:` for one part, `slots:` for
  many.
- `declare module '../registry'` block registering every slot id (co-located
  with the recipe) so it autocompletes in `appearance.elements`.
- Caller-chosen axes → `variants`; runtime conditions → `state` + condition keys.
- `RecipeVariantProps<typeof recipe>` for the prop type; destructure variants +
  state, spread the resolved slot(s).
- No `css={t => …}` function form in Mosaic (Emotion would type `t` as
  `InternalTheme`); use the recipe's `theme => config` or `useMosaicTheme()`.
