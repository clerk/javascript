# Migrating a component off Emotion/`useRecipe`

Mosaic today authors styles with Emotion: `defineSlotRecipe` + `useRecipe`/
`useSlot`, an `appearance` prop (`variables` + `elements`), `data-cl-*`
attributes, and the `_hover`/`_disabled` condition vocabulary, all resolved at
runtime inside `MosaicProvider`'s Emotion cache. The StyleX target replaces that
whole engine with compile-time atomic CSS and a CSS-first override contract.

This is a **model change, not a mechanical port.** Read
`references/mosaic-architecture.md` (repo root) for the Emotion model you're
leaving and `references/mosaic-stylex-migration.md` for the full spike writeup.

## What goes away

The entire runtime styling engine is removed or rebuilt:

- `slot-recipe.ts` (`defineSlotRecipe`, `useRecipe`, `RecipeVariantProps`),
  `useSlot.ts` / `slot()`, `resolveSlot.ts`, `conditions.ts`, `registry.ts`.
- `appearance.ts` and the whole `appearance` prop (`variables` + `elements` +
  per-flow `scope`). Public surface — coordinate as a breaking change.
- The Emotion cache and SSR plumbing in `MosaicProvider` (insertion point,
  `<Global>`, hydration dance) — StyleX ships static CSS, so these vanish.

## The mapping

| Concern           | Emotion Mosaic (today)                                     | StyleX Mosaic (target)                                             |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Author variants   | `defineSlotRecipe({ variants, compoundVariants })`         | `stylex.create` + conditional composition in `stylex.props(...)`   |
| Resolve + attach  | `useRecipe(recipe, { variants, state, sx })` → `{...root}` | `mergeProps(themeProps(...), stylex.props(...), className, style)` |
| Token override    | `appearance.variables`                                     | `:root { --cl-*: … }` in consumer CSS                              |
| Element override  | `appearance.elements[slot]`                                | `.cl-<slot> { … }` in consumer CSS                                 |
| Variant targeting | `data-cl-<axis>` attrs                                     | `data-<axis>` attrs + stable `.cl-<slot>` class                    |
| State targeting   | `_hover` / `_disabled` condition keys                      | value-nested `:hover`/`:disabled`; `.cl-*` for consumer override   |
| Per-flow scoping  | `appearance.elements[scope][slot]`                         | consumer scopes with their own selectors                           |
| `sx` escape hatch | free-form Emotion object                                   | `xstyle?: StyleXStyles` (StyleX styles only) or a token            |
| Delivery          | runtime `<style>` via Emotion cache                        | static `mosaic.css` imported once                                  |

## Step-by-step

1. **Recipe → `stylex.create`.** Turn `base` into a `base` namespace. Turn each
   variant **value** into its own namespace (`variants.intent.primary` →
   `filledPrimary`). `compoundVariants` become `&&`-composed conditions in
   `stylex.props(...)`.
2. **Tokens.** Rewrite `theme.color.primary` → `colors['--cl-primary']`,
   `theme.rounded.md` → `radius['--cl-radius-md']`, `theme.spacing(2)` →
   `s(2)`/indexed scale. Runtime helpers (`theme.mix`, `theme.alpha`) become
   `color-mix(...)`/`calc(...)` expressions inside values, or new tokens.
3. **State.** `_hover: {...}` / `_disabled: {...}` condition blocks become
   value-nested pseudos: `backgroundColor: { default, ':hover', ':disabled' }`.
4. **`useRecipe` → compose + merge.** Replace `const { root } = useRecipe(...)`
   and `{...root}` with a `stylex.props(...)` composition wrapped in
   `mergeProps(themeProps('<slot>', { variant, size }), …, className, style)`.
   Infer props from a plain interface (no `RecipeVariantProps`).
5. **Multi-slot / child selectors.** If the recipe styled multiple slots or used
   `& > x` / `&[data-cl-selected]`, split styling onto each element and drive
   cross-element state by composing style objects from props, or a marker
   (`relational-and-dynamic.md`). **No child/self-attribute selectors survive.**
6. **Registry.** Delete the `declare module '../registry'` slot augmentation —
   there is no runtime registry; the stable class literal in `themeProps('button', …)`
   is the slot identity now.
7. **Provider.** The component no longer needs `MosaicProvider` for styling.
   Themes are `--cl-*` values delivered as plain CSS (or `createTheme` for
   subtree-scoped runtime theming).

## Things that require real restructuring (not a rename)

- **Runtime-computed styles** — anything Mosaic computes per-render
  (`theme.mix(a, b, n)`, arbitrary `sx` objects, JS-derived values). Each must
  become a **token**, a **precompiled variant**, or a CSS `var()`/`color-mix()`
  expression. There is no runtime style computation in StyleX beyond simple
  `(param) => ({...})` dynamic styles.
- **`appearance.elements` consumers** lose programmatic overrides and the `scope`
  cascade — they move to CSS. This is intended, but it's a real ergonomics loss
  for programmatic theming; call it out when migrating a flow that relied on it.
- **Nested/attribute self-selectors** (`tabs.tsx`'s `&[data-cl-selected]`) — state
  must become a composed variant (`isSelected && styles.selected`), not a selector.

## Sequencing

Mosaic is greenfield/unused, so the model can change freely. Two viable paths:

1. **Component-by-component behind the isolated build** (`src/mosaic-x`, its own
   tsdown config) while the Emotion engine still exists — lowest risk, lets you
   validate the harder cases first.
2. **Single cutover** once the engine is ported.

The spike's recommended next proof points before committing: port a **multi-part**
component (e.g. `tabs`) to exercise the no-child-selector / state-as-variant
constraints, and resolve the **clerk-js stylesheet load path** (`build.md`, open
questions). Those two retire the remaining real risk.

## Verify a migration

- Build the isolated target (`pnpm build:mosaic-x`) and confirm `mosaic.css`
  contains the expected `--cl-*` defaults in `:root` and the component's atomic
  rules under `@layer priorityN`.
- Confirm the three override paths work from plain consumer CSS: a `--cl-*` token
  override, a `.cl-<slot>` rule, and a `.cl-<slot>[data-<axis>='…']` scoped rule
  (the POC's `demo.html` is the template).
- Diff rendered output: the public element carries `class="cl-<slot> … <atoms>"`
  plus `data-*` attrs, and consumer `className`/`style` are preserved and win.
