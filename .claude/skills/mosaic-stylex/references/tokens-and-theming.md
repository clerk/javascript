# Tokens & theming

Tokens are the theming surface. The Mosaic goal is **stable, public `--cl-*` CSS
variables** a consumer can override from plain CSS. This file covers how to
define, organize, layer, and theme them.

## Stable `--cl-*` variables via `defineVars`

`stylex.defineVars` normally hashes variable names (`--x1a2b3c`), which consumers
can't target. **Keys that begin with `--` are emitted verbatim.** That is the
linchpin — it turns `defineVars` into a public, stable custom-property surface.

```ts
// tokens.stylex.ts
import * as stylex from '@stylexjs/stylex';

// Color tokens carry BOTH modes in one value via light-dark(light, dark).
// One token, no prefers-color-scheme media query, no duplicated color rules.
export const colors = stylex.defineVars({
  '--cl-foreground': 'light-dark(oklch(0.15 0 0), oklch(0.95 0 0))',
  '--cl-background': 'light-dark(white, oklch(0.15 0 0))',
  '--cl-primary': 'light-dark(oklch(0.205 0 0), oklch(0.92 0 0))',
  '--cl-primary-foreground': 'light-dark(oklch(0.985 0 0), oklch(0.2 0 0))',
  '--cl-destructive': 'light-dark(oklch(0.577 0.245 27.325), oklch(0.7 0.19 25))',
  '--cl-border': 'light-dark(oklch(0.922 0 0), oklch(0.3 0 0))',
  '--cl-muted-foreground': 'light-dark(oklch(0.556 0 0), oklch(0.65 0 0))',
});

export const radius = stylex.defineVars({
  '--cl-radius-md': '0.375rem',
  '--cl-radius-full': 'calc(infinity * 1px)',
});

export const space = stylex.defineVars({
  '--cl-spacing': '0.25rem',
});
```

Referencing a var in a component compiles to `var(--cl-…)`:

```ts
import { colors } from './tokens.stylex';
const styles = stylex.create({ base: { color: colors['--cl-foreground'] } });
// → color: var(--cl-foreground)
```

The compiled sheet emits the defaults into `:root`, so a consumer overrides with
nothing but CSS:

```css
:root {
  --cl-foreground: red;
} /* unlayered → beats the layered default */
```

> Compiler note (from the POC): lightningcss resolves `oklch()` **defaults** to
> hex + `@supports (color: lab())` fallbacks in the emitted CSS. `color-mix()`
> and `calc()` used _inside rules_ are preserved as-is. This only affects the
> printed default values, not the override mechanism.

### Rules for `.stylex.ts` token files

- File must be named `*.stylex.ts` (or `.js`).
- **Named exports only. No default export. No non-token exports** in the file.
- Group by concern with plural names: `colors`, `radius`, `space`, `text`,
  `motion`. Each is one `defineVars` call.

## `defineConsts` vs `defineVars`

| Use `defineVars`                                  | Use `defineConsts`                                            |
| ------------------------------------------------- | ------------------------------------------------------------- |
| Value must be themeable / consumer-overridable    | Value is fixed and never themed                               |
| Emits CSS custom properties                       | Inlined at compile time; no runtime var                       |
| Colors, radii, spacing, type — the public surface | Breakpoints/media-query strings, z-index scale, fixed easings |

```ts
export const zIndices = stylex.defineConsts({ modal: '1000', toast: '1200' });
```

`defineConsts` values are used as **keys** (media / container query strings)
inside a style value — that's their main use for shareable breakpoints and
interaction gates. Group them in a `media.stylex.ts`:

```ts
// media.stylex.ts
export const media = stylex.defineConsts({
  hover: '@media (hover: hover)', // gate hover paints so they don't stick on touch
  finePointer: '@media (hover: hover) and (pointer: fine)',
  motionReduce: '@media (prefers-reduced-motion: reduce)',
  motionSafe: '@media (prefers-reduced-motion: no-preference)',
  contrastMore: '@media (prefers-contrast: more)',
  forcedColors: '@media (forced-colors: active)',
});
```

### Responsive = container queries, not viewport media

Mosaic components render **inside arbitrary consumer layouts**, so viewport width
is the wrong axis — the width of the container the component sits in is right. Use
`@container`, never `@media (min-width)`. (This matches where Mosaic already went:
`@container (min-width: 600px)`.)

```ts
// media.stylex.ts (continued)
export const container = stylex.defineConsts({
  sm: '@container (min-width: 400px)',
  md: '@container (min-width: 600px)',
  lg: '@container (min-width: 900px)',
});
```

```ts
const styles = stylex.create({
  layout: {
    flexDirection: { default: 'column', [container.md]: 'row' },
    padding: { default: s(3), [container.md]: s(6) },
  },
});
```

**Container queries need a `container-type` on an ancestor** or `@container` never
matches. Declare it once on the Mosaic root — the same element that sets
`color-scheme` for `light-dark()` (see "Light/dark" below):

```ts
const root = stylex.create({
  base: { containerType: 'inline-size', colorScheme: scheme['--cl-color-scheme'] },
});
```

Skip viewport `@media` breakpoints entirely unless a component genuinely responds
to the page (rare for embeddable UI).

## Token layering (primitive → semantic → component)

astryx uses a three-tier model. Adopt the same discipline even if Mosaic starts
smaller:

1. **Primitive** — raw scale values (`--cl-font-size-lg: 1.0625rem`,
   `--cl-blue-500`). No meaning.
2. **Semantic** — intent-bound, reference primitives
   (`--cl-foreground`, `--cl-primary`, `--cl-text-body-size: var(--cl-font-size-base)`).
   **Components consume these.**
3. **Component** — component-scoped private vars for overridable local values
   (`--cl-button-radius`, read as `var(--cl-button-radius, <fallback>)`). Only
   introduce when a component needs a theme-overridable knob distinct from the
   semantic token.

Author components against **semantic** tokens. Never reach past them to a
primitive (`--cl-blue-500`) in a component — that bypasses theming.

## The spacing helper

The POC keeps spacing math readable with a tiny helper over the `--cl-spacing`
base (mirrors astryx's spacing scale):

```ts
// space['--cl-spacing'] compiles to var(--cl-spacing)
const s = (n: number) => `calc(${space['--cl-spacing']} * ${n})`;
// s(2) → calc(var(--cl-spacing) * 2)
```

Prefer a precomputed indexed scale (`gapStyles[step]`, `paddingStyles[step]`) for
repeated values; use `s(n)` for one-off math inside a namespace.

## Light/dark via `light-dark()`

Color tokens carry both modes in a single value: `light-dark(<light>, <dark>)`.
This is how astryx does it, and it means **dark mode lives entirely in the token
layer** — no `@media (prefers-color-scheme)` const, no gating every color property
on a media query, no duplicated color rules. Which branch resolves is decided by
the CSS `color-scheme` property in scope.

**`light-dark()` only resolves when `color-scheme` is set on an ancestor.** This
is the one gotcha — a token defined with `light-dark()` renders the _light_ branch
(or nothing sensible) until some ancestor declares `color-scheme`. Set it once on
the Mosaic root (and expose it as a token so it's overridable):

```ts
export const scheme = stylex.defineVars({
  '--cl-color-scheme': 'light dark', // honor the OS preference by default
});
```

```tsx
// The Mosaic root — the same element that declares container-type (see Responsive).
const root = stylex.create({
  base: { colorScheme: scheme['--cl-color-scheme'], containerType: 'inline-size' },
});
<div {...stylex.props(root.base)}>{children}</div>;
```

- Default `light dark` → follows the user's OS preference automatically.
- Consumers **force a mode** by setting the property, no per-token overrides:
  ```css
  .cl-root {
    color-scheme: dark;
  } /* or on :root, or any subtree */
  ```
- Consumers **retint a specific token** by overriding the whole `light-dark(...)`
  value: `:root { --cl-primary: light-dark(rebeccapurple, plum); }`.

Set `color-scheme` on **one** owning element, not per component — it inherits, and
`light-dark()` reads the inherited value.

## Theming: two delivery models

A "theme" is a set of `--cl-*` values (or a `color-scheme` flip). Ways to ship one:

**1. Plain CSS file (preferred for the "consumers own their CSS" goal).** A
`.css` that sets the vars — or just flips the scheme — under a selector. Zero JS,
trivially shippable next to `mosaic.css`, and consumers just import it.

```css
/* dark mode: with light-dark() tokens, flip the scheme — don't re-set every var */
.cl-root[data-cl-theme='dark'] {
  color-scheme: dark;
}

/* a full retheme still overrides tokens directly (each keeps its light-dark pair) */
.cl-root[data-cl-theme='brand'] {
  --cl-primary: light-dark(#5b21b6, #c4b5fd);
  --cl-radius-md: 0.5rem;
}
```

**2. `stylex.createTheme` object** applied via a wrapper element — when a theme
must be swapped per-subtree at runtime:

```ts
import { colors } from './tokens.stylex';
export const darkTheme = stylex.createTheme(colors, {
  '--cl-foreground': 'white',
  '--cl-background': '#0a0a0a',
});
```

```tsx
<div {...stylex.props(isDark && darkTheme)}>{children}</div> // descendants use theme values
```

`createTheme` can be created anywhere and passed across files (unlike
`defineVars`, which is file-bound). Reach for it only when subtree-scoped runtime
theming is required; otherwise the plain-CSS route fits Mosaic better.

## The public token contract

The `--cl-*` list is a **published API** — consumers pin to it. Treat it like any
public surface:

- Lock and document the token names; renaming/removing one is a breaking change.
- Every component value that a consumer might reasonably want to retheme should
  resolve to a `--cl-*` var, not a literal.
- Don't proliferate categories. Need "success green"? Add/keep a semantic
  `--cl-success`, don't invent per-component color tokens.
