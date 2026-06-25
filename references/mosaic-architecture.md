# Mosaic Design System Architecture

## Overview

Mosaic is the next-generation design system for Clerk's UI components, replacing the existing styled system. Both systems coexist during migration — Mosaic lives under `packages/ui/src/mosaic/` as a self-contained module that doesn't touch any existing code.

Mosaic uses Emotion for CSS-in-JS but delivers theme tokens via its own React context (not Emotion's `ThemeProvider`). This avoids type conflicts with the existing system's `InternalTheme` augmentation on Emotion's global `Theme` interface.

The public styling contract is **data attributes** (`data-cl-slot`, `data-cl-<state>`, `data-cl-<variant>`), the same convention shipping in `@clerk/headless`. There is no classname derivation, no `__state` concatenation, and no central appearance-key registry. Components are authored with **slot recipes** (`defineSlotRecipe`), which own variants, slot identity, state→attribute mapping, and the appearance cascade in one place.

Once migration is complete, the old system is removed and Mosaic becomes the sole design system.

## Token architecture

### MosaicTheme

The token type is derived from the default values — not a hand-written interface:

```ts
// packages/ui/src/mosaic/variables.ts
export const defaultMosaicVariables = Object.freeze({
  color: { primary: '...', primaryForeground: '...', ... },
  spacing: '0.25rem',
  rounded: { xs: '0.125rem', sm: '0.25rem', md: '0.375rem', ... },
  text: { xs: { fontSize: '0.75rem', lineHeight: '...' }, ... },
} as const);

export type MosaicTokens = typeof defaultMosaicVariables;
```

### MosaicTheme helpers

`MosaicTheme` includes computed helpers alongside static tokens:

```ts
const theme = useMosaicTheme();

// spacing(n) — multiply base spacing by n
theme.spacing(2); // "calc(0.25rem * 2)"

// alpha(color, opacity) — apply opacity via color-mix
theme.alpha('primary', 80); // "color-mix(in oklab, <primary-value> 80%, transparent)"

// mix(colorA, colorB, percentage) — blend colors via color-mix
theme.mix('primary', 'primaryForeground', 50); // "color-mix(in oklab, <primary>, <primaryForeground> 50%)"

// text(key) — typography scale with fontSize + lineHeight
theme.text('sm'); // { fontSize: '0.875rem', lineHeight: '...' }
```

## Theme delivery

### MosaicProvider

Single provider that handles cascade and theme delivery. It accepts `appearance` (consumer overrides) and `scope` (the active flow key):

```tsx
import { MosaicProvider } from '../mosaic/MosaicProvider';

<MosaicProvider>{children}</MosaicProvider>;
````

### useMosaicTheme

Hook to access the resolved theme:

```tsx
import { useMosaicTheme } from '../mosaic/MosaicProvider';

function MyComponent() {
  const theme = useMosaicTheme();
  return <div css={{ color: theme.color.primary, padding: theme.spacing(4) }} />;
}
```

### Why React context instead of Emotion's ThemeProvider

Emotion's `ThemeProvider` is typed to the global `Theme` interface, which is augmented to `InternalTheme` in `emotion.d.ts`. Passing a `MosaicTheme` to it would be a type error. A plain React context avoids this entirely.

What we lose:

1. **`css={(t) => ...}` function form** — Emotion would type `t` as `InternalTheme`. Use `useMosaicTheme()` (or a recipe `theme => config`) instead.
2. **`useTheme()` from `@emotion/react`** — use `useMosaicTheme()` instead.

What we keep: `css` prop (with plain objects), `keyframes`, `Global`, style serialization, deduplication, SSR.

## Public styling API

Every Mosaic part is targetable through stable data attributes — no classnames or registry keys to learn. A styled element emits:

- `data-cl-slot="<slotId>"` — the slot identity
- `data-cl-<state>` — boolean state, presence-only (`data-cl-disabled=""`); omitted when the state is false
- `data-cl-<axis>="<value>"` — the resolved variant (`data-cl-size="sm"`); boolean variant axes use presence semantics like state

Defaults are emitted too, so e.g. `data-cl-size="md"` vs `"sm"` is always distinguishable.

Three ways to style a part — all target the **same** attributes:

```css
/* 1. Plain CSS / stylesheet */
[data-cl-slot='button'] {
  border-radius: 8px;
}
[data-cl-slot='button'][data-cl-size='sm'] {
  border-radius: 4px;
}
[data-cl-slot='button'][data-cl-disabled] {
  opacity: 0.4;
}
```

```tsx
// 2. appearance.elements — keyed by slot id; state/variant via nested conditions or attr selectors
appearance={{
  elements: {
    button: {
      color: 'lime',
      _disabled: { opacity: 0.4 },                 // condition key
      "&[data-cl-size='sm']": { borderRadius: 4 }, // raw attr selector
    },
  },
}}
```

```tsx
// 3. className / css escape hatch — still merged onto the element
<Button className='MyButton' />
```

State styling uses real attribute-selector specificity — no `&&` boost, no data-attr-vs-class ambiguity.

## Appearance & cascade

`MosaicProvider` takes `appearance` + `scope`:

```tsx
<MosaicProvider
  scope="signIn"
  appearance={{
    variables: { rounded: { md: '1rem' } },     // design tokens — global only, not scopable
    elements: {
      button: { backgroundColor: 'red' },        // slot styles — global
      signIn: { button: { color: 'lime' } },     // slot styles — scoped to <SignIn>
    },
  }}
>
```

Two independent cascades, both low → high:

**Tokens (`appearance.variables`)**

1. `defaultMosaicVariables`
2. Base theme overrides (prebuilt themes)
3. `appearance.variables` (global; **not** scopable)

Resolved once into `MosaicTheme` via `resolveVariables`.

**Styles (`appearance.elements`), per slot**

1. Recipe `base` → `variants` → `compoundVariants` → `sx`
2. `appearance.elements[slot]` (global)
3. `appearance.elements[scope][slot]` (scoped — wins inside the flow)

Scope keys (`signIn`, `userButton`, …) live **inside** `elements`, keyed by flow, holding slot→style maps only. They never carry `variables`. `parseMosaicAppearance(appearance, scope)` strips scope keys out of the global layer and appends the scoped layer, returning `[global, scoped]` — so scoping falls out of layer order and the resolver (`resolveSlotCss`) needs no special-casing. Standalone (no provider/appearance) degrades to pure recipe styles.

## Slot recipes

`defineSlotRecipe` (`slot-recipe.ts`) is the single authoring primitive. One recipe owns _variants_, _slot identity_ (`data-cl-slot`), _state→attribute mapping_, and the _appearance cascade_. It absorbs the old `cva` variant-merge engine — `cva.ts` is gone.

`useRecipe(recipe, opts)` resolves a recipe against the active theme + appearance and returns **per-slot props** with `css` already merged (base → variants → compound → sx → appearance) and all data attributes attached. Authors never hand-thread `css={[...]}`.

Either form may be a static config or a `theme => config` function, so token values can be used inline while still honoring per-provider variable overrides.

### Single-slot (the old `cva` use case)

```ts
export const buttonRecipe = defineSlotRecipe(theme => ({
  slot: 'button', // shorthand → implicit `root` slot
  base: { display: 'inline-flex', borderRadius: theme.rounded.md, _disabled: { opacity: 0.5 } },
  variants: {
    color: { primary: { backgroundColor: theme.color.primary } },
    size: { sm: { ...theme.text('xs') }, md: { ...theme.text('sm') } },
  },
  defaultVariants: { color: 'primary', size: 'md' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry { button: true } // slot id registered once, co-located
}

export type ButtonProps = React.ComponentPropsWithRef<'button'> & RecipeVariantProps<typeof buttonRecipe>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { color, size, disabled, sx, children, ...rest } = props;
  const { root } = useRecipe(buttonRecipe, { variants: { color, size }, state: { disabled: !!disabled }, sx });
  return (
    <button ref={ref} disabled={disabled || false} type="button" {...rest} {...root}>
      {children}
    </button>
  );
});
```

`disabled` is **state**, not a variant: it emits `data-cl-disabled` and is styled via the `_disabled` condition — so consumers can override it through `appearance.elements`.

### Multi-slot

```ts
const cardRecipe = defineSlotRecipe({
  slots: { root: { slot: 'card' }, header: { slot: 'cardHeader' }, body: { slot: 'cardBody' } },
  base: { root: { borderRadius: 8 }, header: { fontWeight: 600 }, body: {} },
  variants: {
    tone: {
      neutral: { root: { borderColor: 'gray' } },
      danger: { root: { borderColor: 'red', _invalid: { boxShadow: '…' } } },
    },
  },
  defaultVariants: { tone: 'neutral' },
});

function Card({ tone, invalid, title, children }: CardProps) {
  const s = useRecipe(cardRecipe, { variants: { tone }, state: { invalid } });
  return (
    <div {...s.root}>
      <div {...s.header}>{title}</div>
      <div {...s.body}>{children}</div>
    </div>
  );
}
```

State and variant attributes attach to **every** slot, so a nested condition (`_invalid`) resolves on whichever slot styles it.

### Sugar — `useSlot` / `slot`

For elements that need no variants (`useSlot.ts`):

```tsx
// useSlot — themeable, targetable, appearance-aware. css = sx + appearance only (no recipe styles).
function Avatar({ disabled }: AvatarProps) {
  const root = useSlot('avatarBox', { state: { disabled } });
  return <div {...root} />;
}

// slot() — the barest: just makes an element targetable. No hook, no css.
<span {...slot('badgeText')}>{text}</span>;
```

The full spectrum, heaviest → lightest, is one machine: `useRecipe` (variants + slots) → `useSlot` (attrs + appearance) → `slot()` (attr only). You never reach for a recipe just to get a `data-cl-slot`.

### RecipeVariantProps

Infers a component's variant props (plus `sx`) from its recipe — the recipe equivalent of the old `VariantProps`, so variant axes aren't re-declared by hand:

```ts
import { type RecipeVariantProps } from '../mosaic/slot-recipe';

export type ButtonProps = React.ComponentPropsWithRef<'button'> & RecipeVariantProps<typeof buttonRecipe>;
// → { color?: 'primary'; size?: 'sm' | 'md'; sx?: SxProp }
```

Boolean variants (`{ true, false }`) infer as `boolean`; at runtime `true`/`false` are coerced to `'true'`/`'false'` for variant-map lookup. Two distinct `null` cases: (1) when a variant map entry is `null`, `pickSlot` converts it to `undefined` and `mergeInto` skips falsy sources, so that entry contributes no styles; (2) when a variant prop is explicitly passed `null` at the call site, it is coerced to the string key `"null"` for recipe lookup — styles apply only if the recipe defines a `"null"` variant.

## Slot registry

Slot ids are assembled by **module augmentation** — no central list, no `APPEARANCE_KEYS` array, no codegen, no "build the types" step.

```ts
// registry.ts — the empty seam; never edited
export interface MosaicSlotRegistry {}
export type MosaicSlotId = keyof MosaicSlotRegistry;
export type MosaicElements = Partial<Record<MosaicSlotId | (string & {}), StyleRule | string>>;
```

Each recipe file contributes its slot ids next to the recipe via `declare module '../registry'`. **Add a component → write its recipe + one augmentation block → its slot ids autocomplete in `appearance.elements` automatically.** The `(string & {})` arm keeps ad-hoc slots valid even for a slot whose file isn't imported in a given consumer.

`StyleRule` is a csstype-backed `CSSObject` (typed CSS properties + arbitrary nested selectors / conditions / at-rules), mirroring Emotion's `CSSObject`. So `appearance.elements`, `sx`, and recipe style blocks all autocomplete CSS property names while still permitting nesting.

## Conditions

Named pseudo-state / media keys (`packages/ui/src/mosaic/conditions.ts`). Each maps to a
nesting chain of selectors (`&` is the styled element) and is rewritten to its selector form by
`expandConditions`, which runs once on the fully-merged `css` at the end of `useRecipe` / `useSlot`.

| Condition       | Expands to                                                     |
| --------------- | -------------------------------------------------------------- |
| `_hover`        | `@media (hover: hover) { &:hover }`                            |
| `_focus`        | `&:focus`                                                      |
| `_focusVisible` | `&:focus-visible`                                              |
| `_focusWithin`  | `&:focus-within`                                               |
| `_active`       | `&:active`                                                     |
| `_disabled`     | `&[data-cl-disabled]` (the attr Mosaic emits, not `:disabled`) |
| `_invalid`      | `&[aria-invalid="true"]`                                       |
| `_motionSafe`   | `@media (prefers-reduced-motion: no-preference)`               |
| `_motionReduce` | `@media (prefers-reduced-motion: reduce)`                      |

The **same keys** work in recipe `base`/`variants`, the `sx` prop, and consumer
`appearance.elements` — so consumers can override hover/focus/etc. through `elements`:

```ts
<MosaicProvider appearance={{ elements: { button: { _hover: { backgroundColor: 'red' } } } }}>
```

Because conditions stay as raw keys through every merge layer (base → variants → compound → sx →
appearance) and expand only at the end, a recipe's `_hover` and a consumer's `_hover` merge by key
first (consumer wins) instead of producing duplicate hover blocks. Raw selectors (`'&:active'`,
`'@media …'`) remain valid as an escape hatch — only registered condition keys are rewritten.

## Component authoring pattern

```tsx
import { defineSlotRecipe, useRecipe, type RecipeVariantProps } from '../mosaic/slot-recipe';

// 1. Define the recipe + register its slot id(s)
const styles = defineSlotRecipe(theme => ({
  slot: 'button',
  base: { borderRadius: theme.rounded.md, fontFamily: 'inherit', _disabled: { opacity: 0.5, cursor: 'not-allowed' } },
  variants: {
    intent: {
      primary: { background: theme.color.primary, color: theme.color.primaryForeground },
      outline: { background: 'transparent', border: `1px solid ${theme.color.primary}` },
    },
    size: { sm: { padding: theme.spacing(2) }, md: { padding: theme.spacing(3) } },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    button: true;
  }
}

// 2. Infer props from the recipe
type ButtonProps = React.ComponentPropsWithRef<'button'> & RecipeVariantProps<typeof styles>;

// 3. Destructure variants + state, spread the resolved slot props (css + data attributes)
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { intent, size, disabled, sx, ...rest } = props;
  const { root } = useRecipe(styles, { variants: { intent, size }, state: { disabled: !!disabled }, sx });
  return (
    <button
      ref={ref}
      disabled={disabled || false}
      {...rest}
      {...root}
    />
  );
});
```

## Coexistence with existing system

### Provider tree

```text
StyleCacheProvider (shared Emotion cache)
└── AppearanceProvider (existing)
    └── InternalThemeProvider (existing — Emotion ThemeProvider)
        └── MosaicProvider (new — plain React context)
            └── [mixed component tree]
                ├── ExistingComponent  → css={t => t.colors.$primary500}
                └── MosaicComponent    → {...useRecipe(recipe, { variants }).root}
```

### Rules

- **Do not** pass `MosaicTheme` to Emotion's `ThemeProvider`
- **Do not** use `css={(t) => ...}` function form in Mosaic components (Emotion types `t` as `InternalTheme`)
- **Do** author components with `defineSlotRecipe` + `useRecipe` (or `useSlot` / `slot` for the no-variant cases)
- **Do** import from `src/mosaic/` directly (no barrel files)

### What shares

- Emotion cache (`cl-internal` key) — both systems inject into the same cache
- `@emotion/react`'s `css` prop — both systems use it (Mosaic with plain objects, existing with theme callbacks)
- `keyframes`, `Global` — available to both

### What doesn't share

- Theme type — `MosaicTheme` vs `InternalTheme` (completely independent)
- Theme delivery — React context vs Emotion's `ThemeProvider`
- Variant utility — slot recipes (`defineSlotRecipe`) vs `createVariants`
- Styling contract — `data-cl-*` attributes + `appearance.elements` vs the legacy `customizables` / `APPEARANCE_KEYS` registry

## Migration guide

To migrate a component from the old system to Mosaic:

1. Replace `createVariants` with `defineSlotRecipe` — move from `(theme, props) => ({ base, variants })` to `theme => ({ slot, base, variants })`. Variant props that were in the `props` parameter become proper variants.
2. Register the component's slot id(s) with a `declare module '../registry'` block next to the recipe.
3. Replace `applyVariants(props)` with `useRecipe(recipe, { variants, state, sx })` and spread the returned slot props (`{...root}`) onto the element — `css` and the `data-cl-*` attributes come together.
4. Move stateful styling (disabled/hover/focus/invalid) to **state + conditions** (`state: { disabled }` + `_disabled`/`_hover`) instead of boolean variants or raw pseudo-selectors, so it stays overridable through `appearance.elements`.
5. Infer props with `RecipeVariantProps<typeof recipe>`; remove `filterProps` (destructure variant keys directly).
6. Update token references — e.g. `theme.colors.$primary500` → `theme.color.primary`.
7. Ensure the component is inside a `MosaicProvider` in the tree.

## Files

| File                                              | Purpose                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/mosaic/variables.ts`                         | Token types, `MosaicVariables`, `resolveVariables`, defaults                |
| `src/mosaic/MosaicProvider.tsx`                   | Provider (`appearance` + `scope`) + `useMosaicTheme()` hook                 |
| `src/mosaic/appearance.ts`                        | `MosaicAppearance` shape, scope parsing, `useMosaicAppearance` context      |
| `src/mosaic/registry.ts`                          | `MosaicSlotRegistry` augmentation seam, `MosaicSlotId`, `MosaicElements`    |
| `src/mosaic/slot-recipe.ts`                       | `defineSlotRecipe`, `useRecipe`, `RecipeVariantProps`, `StyleRule`/`SxProp` |
| `src/mosaic/useSlot.ts`                           | `useSlot` + `slot()` sugar for non-recipe parts                             |
| `src/mosaic/resolveSlot.ts`                       | Pure per-slot appearance-layer resolver (`resolveSlotCss`)                  |
| `src/mosaic/conditions.ts`                        | Condition vocabulary (`_hover`, …) + `expandConditions`                     |
| `src/mosaic/__tests__/slot-recipe.test.ts`        | Recipe resolution, attrs, conditions, `useSlot`/`slot` specs                |
| `src/mosaic/__tests__/resolveSlot.test.ts`        | Appearance-layer resolution specs                                           |
| `src/mosaic/__tests__/MosaicProvider.test.tsx`    | Appearance/scope parsing + theme-from-variables specs                       |
| `src/mosaic/components/__tests__/button.test.tsx` | Component-level slot/state/variant/appearance specs                         |
