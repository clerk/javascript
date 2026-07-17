# File organization, naming & exports

How astryx keeps ~350 `.stylex.ts` files navigable. Adopt the same conventions.

## File naming

| File                       | Holds                                                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `tokens.stylex.ts`         | `defineVars`/`defineConsts` — the token surface (see tokens ref)                                                  |
| `<name>.stylex.ts`         | Shared/large style sets extracted from a component (`text.stylex.ts`, `inputStyles.stylex.ts`, `stack.stylex.ts`) |
| `<name>.markers.stylex.ts` | `stylex.defineMarker()` scopes for relational styling (see relational ref)                                        |
| `<Component>.tsx`          | The component; small/component-local styles inline via `stylex.create`                                            |
| `index.ts`                 | Named re-exports (component + types), no default exports                                                          |

- `.stylex.ts` is **required** for any file calling `defineVars`/`defineConsts`/
  `defineMarker` — the compiler keys off the suffix.
- kebab or camel basename, `.stylex.ts` suffix. Export const names are plural by
  concern (`colors`, `spacingVars`) for token groups, `styles` for a component's
  local `create` call.

## Inline vs. extracted styles

- **Inline in the `.tsx`** when styles are component-specific and roughly under
  ~150 lines. A simple Button/Badge keeps its `stylex.create` at the top of the
  file.
- **Extract to `<name>.stylex.ts`** when:
  - the styles are **shared** across components (input field styles used by
    TextInput, Selector, Typeahead → `inputStyles.stylex.ts`), or
  - a single component's styles grow large (`text.stylex.ts` at ~350 lines with
    11 `create` calls), or
  - they're a reusable **layout utility** returning an array of namespaces
    (`stack()`, `container()`).

Past ~1000 lines in any file, decompose. Keep each file focused.

## The `naming` module (single source of truth)

The `cl` namespace appears in class names, data attributes, and CSS variables. It
must live in **one** place, imported by both the runtime and any build/CLI
tooling. astryx centralizes this in `naming.ts`; do the same:

```ts
// naming.ts
export const NAMESPACE = 'cl';
export const stableClassName = (component: string) => `${NAMESPACE}-${component}`; // .cl-button
export const dataAttr = (name: string) => `data-${name}` as const; // data-variant
export const cssVar = (name: string) => `--${NAMESPACE}-${name}`; // --cl-*
```

Then `themeProps`/`mergeProps` (see `overrides.md`) build on it. Never scatter
`'cl-'` literals across components — one exception is the **stable class literal
passed to `themeProps('button', …)`**, which is intentionally a literal per
component (it's the public contract for that part; astryx and the POC both keep it
literal, optionally lint-enforced).

## Exports & tree-shaking

**Named exports only, no barrels that create cycles.** astryx exposes each
component as its own subpath export and marks style files as side-effectful so
they're never tree-shaken away:

```jsonc
// package.json
{
  "sideEffects": ["**/*.stylex.ts", "**/*.stylex.js", "**/*.css"],
  "exports": {
    ".": { "source": "./src/index.ts", "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./tokens.stylex": { "source": "./src/mosaic-x/tokens.stylex.ts", "default": "./dist/.../tokens.stylex.js" },
    "./mosaic.css": { "default": "./dist-mosaic-x/mosaic.css" },
  },
}
```

`sideEffects` for `*.stylex.ts`/`*.css` is **not optional** — StyleX/CSS files
register global styles; tree-shaking them drops styles from the sheet.

Component `index.ts`:

```ts
export { Button } from './button';
export type { ButtonProps } from './button';
```

## Directory shape (per component)

Mirror astryx's per-component folder:

```text
Button/
  Button.tsx                 // component + inline styles.create (if small)
  buttonStyles.stylex.ts     // only if extracted
  button.markers.stylex.ts   // only if it needs relational scoping
  Button.test.tsx
  index.ts                   // named re-exports
```

In the current Clerk POC everything sits flat in `packages/ui/src/mosaic-x/`
(`button.tsx`, `tokens.stylex.ts`, `props.ts`, `index.ts`). As the surface grows,
move to per-component folders like astryx.

## Companion helpers worth porting from astryx

Beyond `naming` / `themeProps` / `mergeProps` (see `overrides.md`), a handful of
astryx utilities pay off in a StyleX component library. They aren't StyleX-specific
but they're what makes StyleX components composable:

- **`mergeRefs(...refs)`** — one callback ref that forwards to all inputs (and
  honors React 19 ref-cleanup return values). Pairs with `mergeProps` whenever a
  `forwardRef` component also needs an internal ref (tooltip trigger, measure, focus
  management).
- **`composeEventHandlers(a, b)`** — run a consumer handler and the component's own
  handler for the same event, short-circuiting if one calls `preventDefault()`.
  Consumer-first lets consumers opt out of built-in behavior; component-first makes
  built-in behavior always run. Essential once components own interactions but also
  spread `{...rest}`.
- **`SizeContext` + `useSize(sizeProp, 'md')`** — cascade a default size from a
  container (a Toolbar, ButtonGroup, Card header) to interactive children. Explicit
  prop wins, then inherited context, then the default. This is the clean way to feed
  the `size` variant that `stylex.props(sizeStyles[size])` selects — no prop drilling.
- **Layout primitives that return a style array** — `stack()` / `container()` /
  `stackItem()` return `[...namespaces] as const` that callers spread into
  `stylex.props(...)`. Formalize these as shared helpers rather than re-deriving flex
  layout in every component (see `authoring.md` → Composition).
- **`cssVar(name)`** (from `naming`) — build a `--cl-*` string for the rare dynamic
  case that sets or reads a var by name (e.g. a dynamic style writing
  `--cl-container-max-height`).

### Deliberately DON'T port (the CSS-first model makes them redundant)

astryx also ships a runtime theming/appearance engine — `defineTheme`,
`expandColorScale` / `expandTypeScale` / `expandRadiusScale` / `expandMotionScale`,
`hct`, `derivedVarRegistry`, `parseStyleKey`. These generate a full token set from a
small config and drive class-selector-based component overrides. **Skip them:** our
model is CSS-first — consumers override `--cl-*` vars and `.cl-*` classes directly
(`overrides.md`), so the derived-var indirection and appearance-class targeting add
nothing. The one exception worth revisiting later: the `expand*` / `hct` **theme
generation** (accent color → full perceptual color scale) is a real convenience _if_
we ever want to author themes from a single seed rather than hand-writing every
`light-dark()` pair. That's a future call, not part of the core adoption.
