# Styling a component with StyleX

Mosaic styling is migrating off the Emotion slot-recipe engine (`styling.md`)
onto **StyleX** (`@stylexjs/stylex` 0.19). StyleX is compile-time atomic CSS: the
style objects become hashed atom classes plus one static stylesheet, with zero
runtime. This file is the authoring model for the StyleX layer; read it against
the pilot, `packages/ui/src/mosaic/components/button/`.

The public contract is unchanged from the recipe era — consumers still target
`--cl-*` vars, the `.cl-<slot>` class, and `data-<axis>` attrs, never StyleX's
hashed `x…` atoms. What changes is how a component is authored internally.

## File layout & the `.stylex.ts` rule

| File                      | Holds                                                      |
| ------------------------- | ---------------------------------------------------------- |
| `tokens.stylex.ts`        | `defineVars` / `defineConsts` only (the tokens)            |
| `<comp>/<comp>.styles.ts` | `stylex.create({...})` — the atoms                         |
| `<comp>/<comp>.tsx`       | component; spreads `stylex.props(...)` via `mergeProps`    |
| `props.ts`                | `themeProps` (`.cl-<slot>` + `data-<axis>`) + `mergeProps` |
| `styles/index.ts`         | isolated-build barrel; derives `*VarName` types            |

All 9 `@stylexjs` eslint rules run on `src/mosaic/**`. The `enforce-extension`
rule reserves the `.stylex.ts` extension for token files: **a `.stylex.ts` file
may export nothing but `defineVars`/`defineConsts` results.** So:

- `stylex.create(...)` lives in a plain `.styles.ts` file, never `.stylex.ts`.
- Derived types (`type ColorVarName = keyof typeof colorVars`) live in
  `styles/index.ts`, not in `tokens.stylex.ts` (they'd be a disallowed export).

## Tokens (`tokens.stylex.ts`)

**`defineVars` keys that start with `--` emit verbatim** as real custom
properties; other keys get hashed. That verbatim behavior is the whole point —
it gives consumers stable `--cl-*` vars to override in plain CSS:

```ts
const colorDefaults = {
  // one value carries light + dark; resolves against the in-scope `color-scheme`,
  // so dark mode lives in the token, no `@media (prefers-color-scheme)` copy.
  '--cl-color-primary': 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
} as const;
export const colorVars = stylex.defineVars(colorDefaults);
```

**Spacing is one exposed var plus a `defineConsts` scale.** Only `--cl-spacing`
is a custom property; every step is inlined at build as `calc(var(--cl-spacing) *
n)` and carries no var of its own:

```ts
export const spacingVars = stylex.defineVars({ '--cl-spacing': '0.25rem' });

const step = (multiple: number): string => `calc(var(--cl-spacing) * ${multiple})`;
export const space = stylex.defineConsts({ '0': '0px', '2': step(2), '8': step(8) /* … */ });
// usage: gap: space['2']
```

Why `defineConsts` and not a `space(n)` helper: StyleX evaluates
`stylex.create` **statically at build time** and cannot inline a helper imported
from a non-`.stylex` module (it errors "Could not resolve the path to the
imported file"). `defineConsts` is StyleX's shareable inlined-value primitive, so
it's the only way to get a scale that is both shared across components and free
of per-step vars.

## Atoms (`<comp>.styles.ts`)

`stylex.create` values must be statically resolvable. Allowed: literals,
**same-file** locals, and references to `.stylex` tokens (`colorVars[...]`,
`space['2']`). Not allowed: a value from a helper imported across modules. For
arithmetic, inline a `calc()` template literal with a token:
`` `calc(-1 * ${space['2']})` ``.

**Conditions.** Use StyleX's conditional-value objects (a `default` plus
pseudo / at-rule keys), and nest to guard hover so it never sticks on touch —
this is the StyleX form of the old `_hover` condition:

```ts
backgroundColor: {
  default: colorVars['--cl-color-primary'],
  ':active': `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 24%)`,
  '@media (hover: hover)': {
    // only the top-level value needs `default`; the nested block just adds `:hover`
    ':hover': `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 12%)`,
  },
},
```

Guard `:hover` behind `@media (hover: hover)`; leave `:active`, `:focus-visible`,
`:disabled` unguarded. Runtime conditions the component owns (disabled, etc.) are
also reflected as `data-<axis>` attrs via `themeProps` so they stay overridable.

Write the guard **raw**, as above — there is no `hover()` helper to import,
because StyleX can't inline a cross-module helper into `create` (the Emotion
engine's `hover()`/`motionSafe()` utils don't translate). `*.styles.ts` files are
therefore exempted from the repo's `no-restricted-syntax` media-query rule
(`eslint.config.mjs`); the `@stylexjs/*` rules still apply.

## Public contract (`props.ts`)

The element carries three things, and nothing else is a contract:

1. `--cl-*` vars (from tokens), 2. `.cl-<slot>` class, 3. `data-<axis>` attrs.

`mergeProps` fuses them in precedence order — **theme props → StyleX atoms →
consumer `className`/`style`** — so the consumer always wins:

```tsx
<button {...mergeProps(themeProps('button', { intent, variant }), stylex.props(styles.base, ...), className, style)} />
```

## Build & CSS delivery (two contexts, same babel)

- **Published** (`build:mosaic` → `@stylexjs/rollup-plugin`): compiles the
  `styles/index.ts` barrel into `dist-mosaic/styles.css`, exported as
  `@clerk/ui/styles.css`. Consumers choose the cascade layer at import:
  `@import '@clerk/ui/styles.css' layer(components)`.
- **Swingset** (source-consumed): `@stylexjs/unplugin/webpack` in `next.config`
  transforms StyleX **JS only** (calls → static atoms; SWC/Emotion untouched);
  `@stylexjs/postcss-plugin` extracts the **CSS** by replacing `@stylex;` in
  `globals.css`. Both must share the same StyleX babel version + options so atom
  hashes line up.

Both set **`useCSSLayers: true`** (StyleX emits `@layer priorityN` for its own
precedence; the consumer's `@import … layer()` picks the outer layer). Both pin
**lightningcss targets** to browsers with native `light-dark()`/`oklch()` so the
token colors aren't down-leveled into an invalid polyfill.

## CSS features we lean on / caveats

- YES: `var()`, `calc()`, `color-mix()`, `light-dark()`, nested `@media`+pseudo,
  `:hover`/`:active`/`:focus-visible`/`:disabled`, `::before`/`::after`.
- Prefer CSS-native solutions over JS workarounds for anything StyleX supports.
- Avoid manual `@layer` / `@property` inside `create` (StyleX owns layering;
  `@property` compiles but emits invalid output).
- We do not use functions-in-`create` (dynamic runtime values); Mosaic styling is
  fully static.
