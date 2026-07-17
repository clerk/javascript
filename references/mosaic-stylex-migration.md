# Mosaic → StyleX migration: findings + POC

Status: **spike / proof-of-concept complete.** This documents an evaluation of
migrating Mosaic off Emotion (runtime CSS-in-JS) onto
[StyleX](https://stylexjs.com) (compile-time atomic CSS), including a real,
build-verified POC in `packages/ui/src/mosaic-x/`. Nothing here is shipped;
Mosaic is still Emotion-based and greenfield/unused, so we can change the model
freely.

## Context — why consider this

Today Mosaic authors styles with Emotion. `useRecipe`/`useSlot` merge plain
style objects and Emotion serializes them to `<style>` tags at runtime inside a
`MosaicProvider`-owned cache. Consumers customize via the `appearance` prop
(`variables` for tokens, `elements` for per-slot overrides), targeted through
`data-cl-*` attributes. See `references/mosaic-architecture.md`.

The goal of this spike is a different consumer contract:

1. **Drop the `appearance` prop** (no `variables`/`elements` props). Consumers
   style Mosaic from **their own CSS** instead.
2. **Ship a static stylesheet** consumers import once.
3. **Stable CSS variables** — e.g. `--cl-foreground` defaults to `black`, and a
   consumer overrides it with plain `:root { --cl-foreground: red; }`.
4. **Stable class names** — e.g. every button carries `.cl-button` that a
   consumer can target in their CSS to override styles.

StyleX is a compile-time engine: `stylex.create(...)` becomes atomic classes and
`stylex.defineVars(...)` becomes CSS custom properties, both extracted to a
static `.css` file at build time. The only runtime is a tiny `stylex.props()`
class-joiner. That matches goals 1–3 cleanly. Goal 4 (stable classes) needs a
specific technique, covered below.

## TL;DR verdict

All four requirements are achievable and were verified against real compiler
output. The linchpins:

- **Stable CSS vars:** `defineVars` keys that begin with `--` are emitted
  verbatim (not hashed). `--cl-foreground: black` lands in `:root` and is
  overridable from plain consumer CSS. ✅
- **Stable classes:** StyleX will **not** give you a stable atomic class. You
  attach your own plain class (`cl-button`) alongside the StyleX classes as a
  targeting hook. ✅
- **Override precedence is the consumer's concern.** We ship a plain stylesheet;
  the consumer imports it into a cascade layer they control and puts their
  overrides in a later layer:

  ```css
  @layer components, overrides;
  @import '@clerk/ui/mosaic.css' layer(components);
  @layer overrides {
    .cl-button {
      border-radius: 9999px;
    }
  }
  ```

  Their `overrides` layer wins over `components` by cascade-layer order. We keep
  StyleX's `useCSSLayers: true` (its `@layer priorityN` handles intra-StyleX
  precedence and nests cleanly under whatever layer the consumer imports into), so
  we don't engineer consumer precedence at all — it's the consumer's job to place
  our sheet in a layer. ✅

- **Build:** the `@stylexjs/rollup-plugin` composes with our existing `tsdown`
  (rolldown) build and emits a single `mosaic.css`. ✅

The real cost is not feasibility — it's that StyleX's model is materially
different from Emotion's, and the whole Mosaic recipe/appearance engine
(`slot-recipe.ts`, `appearance.ts`, `resolveSlot.ts`, `conditions.ts`,
`MosaicProvider`'s Emotion cache) goes away and is replaced by a much simpler
but less dynamic model. See Trade-offs.

---

## The POC (what actually got built and verified)

Location: `packages/ui/src/mosaic-x/`

| File               | What it shows                                                              |
| ------------------ | -------------------------------------------------------------------------- |
| `tokens.stylex.ts` | `defineVars` with stable `--cl-*` custom properties (foreground, primary…) |
| `button.tsx`       | A Button authored in StyleX: base + intent/variant/size/state variants     |
| `index.ts`         | Entry that re-exports Button + token groups                                |
| `demo.html`        | Runnable consumer-override demo (token + `.cl-button` + `data-*`)          |

Build wiring (isolated from the main Emotion build so nothing else is touched):

- `packages/ui/tsdown.mosaic-x.config.mts` — a dedicated tsdown build for
  `src/mosaic-x` with the StyleX rollup plugin (`useCSSLayers: true`; the consumer
  still owns the outer layer via `@import … layer(components)`).
- `packages/ui/tsconfig.mosaic-x.json` — overrides `jsxImportSource` back to
  `react` (the package default is `@emotion/react`), so the output is truly
  Emotion-free.
- `package.json` script: `pnpm build:mosaic-x`.
- Deps added: `@stylexjs/stylex` (dependency), `@stylexjs/rollup-plugin`
  (devDependency). The rollup plugin bundles its own TS/JSX Babel syntax
  plugins, so no `@babel/preset-*` is needed on this path.

Run it:

```bash
cd packages/ui
pnpm build:mosaic-x           # → dist-mosaic-x/{index.js, index.d.ts, mosaic.css}
open src/mosaic-x/demo.html   # visual proof of the override paths
```

### Evidence 1 — stable, overridable CSS variables

Authoring (`tokens.stylex.ts`):

```ts
export const colors = stylex.defineVars({
  '--cl-foreground': 'black',
  '--cl-primary': 'oklch(0.205 0 0)',
  // …
});
```

Compiled `dist-mosaic-x/mosaic.css` (excerpt):

```css
@layer priority1, priority2, priority3, priority4;
@layer priority1 {
  :root,
  .xzhe2oz {
    --cl-foreground: black;
    --cl-primary: #171717; /* lightningcss resolved the oklch default */
    /* … */
  }
}
```

Compiled `tokens.stylex.js` — references are readable `var(--cl-*)`:

```js
export const colors = {
  '--cl-foreground': 'var(--cl-foreground)',
  '--cl-primary': 'var(--cl-primary)',
  __varGroupHash__: 'xzhe2oz',
};
```

So a consumer overrides a token with nothing but CSS:

```css
:root {
  --cl-foreground: red;
} /* unlayered → beats the layered default */
```

> Note: lightningcss (inside the plugin) resolved the `oklch()` _defaults_ to hex
>
> - `@supports (color: lab())` fallbacks. `color-mix()` expressions used inside
>   rules are preserved as-is. This affects only the emitted default values, not
>   the override mechanism.

### Evidence 2 — stable class + `@layer` override

`button.tsx` attaches a hand-authored class and merges StyleX's classes after it:

```tsx
const STABLE_CLASS = 'cl-button';
const atomic = stylex.props(styles.base /* …conditional variants… */);
return (
  <button
    className={[STABLE_CLASS, className, atomic.className].filter(Boolean).join(' ')}
    style={atomic.style}
    data-intent={intent}
    data-variant={variant}
    data-size={size}
    {...rest}
  />
);
```

Server-rendered output (real, from `renderToStaticMarkup`):

```html
<button
  type="button"
  class="cl-button x3nfvp2 x6s0dn4 x1hew001 … …"
  data-intent="primary"
  data-variant="filled"
  data-size="md"
>
  Primary
</button>

<!-- consumer className is preserved too: -->
<button
  class="cl-button my-cta x3nfvp2 …"
  data-variant="outline"
  …
>
  Danger
</button>
```

The consumer imports our sheet into a layer they own and overrides from a later
layer — no StyleX, no build step on their side:

```css
@layer components, overrides;
@import '@clerk/ui/mosaic.css' layer(components);

@layer overrides {
  :root {
    --cl-primary: rebeccapurple;
  } /* token override */
  .cl-button {
    border-radius: 9999px;
  } /* stable-class override */
  .cl-button[data-variant='outline'] {
    color: rebeccapurple;
  } /* variant scope */
}
```

`overrides` ranks above `components`, so the consumer always wins by cascade-layer
order (an unlayered rule works too — unlayered outranks any layer). Verified in
`demo.html`. StyleX's own `@layer priorityN` (from `useCSSLayers`) simply nests
under `components` when imported this way; it exists only for intra-StyleX
property precedence and does not compete with the consumer's layers.

---

## The stable-className nuance (important)

StyleX's maintainer addresses exactly this "merge my own className" pattern in
[discussion #442](https://github.com/facebook/stylex/discussions/442). The
blessed merge helper:

```ts
function merge(xstyle: ReturnType<typeof stylex.props>, className?: string) {
  return { className: classnames(className, xstyle.className), style: xstyle.style };
}
```

His guidance is two-part:

- For **styling** customization he discourages accepting arbitrary `className`
  strings, because **mixing StyleX atomic classes and non-StyleX styles on the
  same element is "unpredictable."**
- For **non-styling** markers (analytics, session-replay masking, privacy tools)
  the merge pattern "should be fine."

Our requirement is _styling_ via `.cl-button`, which is the discouraged case —
**but his "unpredictable" caveat assumes no cascade layers.** Cascade layers make
the outcome deterministic: because the consumer imports our sheet into a layer
they control (`@import … layer(components)`) and overrides from a later layer,
their rule always wins by layer order. This converts "unpredictable" into
"reliable" and makes goal #4 safe. StyleX's own `useCSSLayers` is orthogonal —
it only orders StyleX's atomic rules among themselves.

Consequences to accept:

- Consumers target our **stable class + `data-*` attributes**, never the atomic
  `x…` hashes (those are unstable across builds — never document them).
- Layer precedence is the consumer's responsibility. We only need to ship plain
  CSS and document the recommended `@import … layer(components)` pattern; we do
  not have to engineer the override precedence ourselves.

---

## Proposed architecture

### Tokens

One or more `*.stylex.ts` files calling `defineVars`, keyed with `--cl-*` so the
names are stable and public. Group by concern (`colors`, `radius`, `space`,
`text`). Reference them in components as `colors['--cl-foreground']` → compiles
to `var(--cl-foreground)`.

Prebuilt themes (today's `dark`, `shadcn`, …) become either:

- a plain CSS file that sets the `--cl-*` variables (shippable, zero-JS), or
- a `stylex.createTheme(...)` object applied via a wrapper element.

The plain-CSS route fits the "consumers own their CSS" goal best and is trivial
to publish next to `mosaic.css`.

### Components

Each styled part:

1. `stylex.create({...})` for base + each variant value as a separate style
   object.
2. A stable `cl-<slot>` class constant.
3. Compose conditionally in `stylex.props(...)` from props, merge the stable
   class first, spread `data-*` for attribute targeting.

Variants (size/intent/variant) → conditional composition. Pseudo-states
(`:hover`, `:focus-visible`, `:active`) and media/`prefers-reduced-motion` →
StyleX's object-value syntax (`{ default, ':hover', '@media …' }`). `color-mix`
and `calc` work inside values (verified).

### Public contract shift

| Concern           | Emotion Mosaic (today)                   | StyleX Mosaic (proposed)                        |
| ----------------- | ---------------------------------------- | ----------------------------------------------- |
| Token override    | `appearance.variables`                   | `:root { --cl-*: … }` in consumer CSS           |
| Element override  | `appearance.elements[slot]`              | `.cl-<slot> { … }` in consumer CSS (unlayered)  |
| Variant targeting | `data-cl-<axis>` attr selectors          | `data-<axis>` attrs + stable class              |
| State targeting   | `data-cl-<state>` + `_hover`/`_disabled` | `:hover` etc. compiled in; `.cl-*` for override |
| Per-flow scoping  | `appearance.elements[scope][slot]`       | consumer scopes with their own selectors        |
| Delivery          | runtime `<style>` via Emotion cache      | static `mosaic.css` imported once               |

---

## Build & distribution

**Build:** `@stylexjs/rollup-plugin` works inside `tsdown` (rolldown 1.x). It
transforms `stylex.*` calls (its own TS/JSX syntax plugins parse the source; the
tsdown/oxc pass strips types + lowers JSX) and emits one CSS asset. `useCSSLayers`
must be on.

**Distribution — the key question.** A consumer app must get the compiled CSS
_and_ the transformed JS without running StyleX themselves. Two models:

1. **Precompiled (recommended for Clerk).** We run StyleX at _our_ build and
   publish transformed JS + a static `mosaic.css`. Consumers import components
   normally and import the stylesheet once — into a cascade layer they control,
   so their own styles can override ours by layer order:

   ```css
   @layer components, overrides;
   @import '@clerk/ui/mosaic.css' layer(components);
   ```

   This fits how `@clerk/ui` is consumed (framework SDKs + injected into clerk-js)
   and requires **zero** StyleX config downstream. The POC proves this output.

   > Caveat: because `useCSSLayers` puts our rules in low-priority layers, the
   > `layer()` import is the _recommended_ form. If a consumer imports the sheet
   > with no layer wrapper, our styles become weak against their unlayered global
   > CSS (e.g. a `button {}` reset could clobber components). Document the
   > `@import … layer(components)` pattern as the expected usage.

2. **Source distribution.** Ship `.stylex.ts` source and require every consumer
   to run the StyleX plugin. Not viable for Clerk — consumers are arbitrary
   Next.js/Vite/etc. apps we don't control.

For clerk-js specifically (rspack UMD, runtime-injected, not an npm import for
the app), the `mosaic.css` would be injected the same way other styles are, or
inlined. This needs a follow-up: today Mosaic styles are injected at runtime by
Emotion; a static stylesheet needs an explicit load path in the clerk-js runtime.

**Caveat — double atomization.** If a _consumer_ also uses StyleX, our
precompiled atomic classes and theirs won't merge/dedupe across the boundary
(two separate StyleX outputs). With layers this is harmless (no visual bug), just
slightly larger CSS. Document it.

---

## Trade-offs

### What StyleX buys us

- **Zero runtime styling.** No Emotion cache, no serialize-on-render, no
  `MosaicProvider` style plumbing, no SSR hydration dance
  (`MosaicProvider.tsx`'s insertion-point + `<Global>` workarounds all go away).
- **Static, cacheable CSS.** One file, atomic, deduped, tree-shaken to imported
  components. Smaller and faster than runtime injection.
- **Deterministic cascade** via layers — the override story is a spec guarantee,
  not specificity roulette.
- **Native stable CSS variables** for theming — exactly the requested model.
- **React 19 / RSC friendly** — build-time CSS sidesteps the runtime-CSS-in-JS
  SSR problems Emotion has in modern Next.js.

### What it costs

- **Whole engine replaced.** `slot-recipe.ts`, `useRecipe`, `useSlot`,
  `appearance.ts`, `resolveSlot.ts`, `conditions.ts`, `registry.ts`, and the
  Emotion cache in `MosaicProvider` are removed or rebuilt. The `appearance` prop
  API disappears (intended, but it's a real public-surface change — and
  `packages/ui` non-major changes load into older SDKs in the wild, so the
  removal must be coordinated as breaking).
- **No runtime `appearance.elements`.** Consumers lose JS-object overrides and
  the per-flow `scope` cascade; they move to CSS. That's the point, but it's less
  ergonomic for programmatic theming and for prebuilt-theme composition.
- **No arbitrary runtime styles.** StyleX dynamic styles are constrained: style
  functions must be simple `(param) => ({...})` object literals, no logic, no
  destructuring. Anything Mosaic computes at runtime (e.g. `theme.mix(...)`,
  `theme.alpha(...)`, arbitrary `sx`) must become a token, a precompiled variant,
  or a CSS `var()`/`color-mix()` expression. The `sx` escape hatch as a
  free-form object is gone; a StyleX `sx` would only accept StyleX styles.
- **No descendant/child selectors.** StyleX styles only the element they're on —
  no `& > div`, no styling a child from a parent. Emotion Mosaic occasionally
  uses nested/attribute selectors (e.g. `tabs.tsx`'s `'&[data-cl-selected]'`).
  Those patterns must be restructured (style each part on its own element, drive
  state by composing style objects from props). Self attribute-selectors like
  `&[data-cl-selected]` are also unsupported — state must be a composed variant.
- **`.stylex.ts` file constraint + build coupling.** `defineVars`/`defineConsts`
  must live in `*.stylex.ts` files; the whole thing depends on the compiler
  running. Debugging is "read the emitted CSS," not "inspect a JS object."
- **Maturity.** StyleX is v0.19 (pre-1.0). API churn is possible; ecosystem is
  smaller than Emotion's.
- **Two systems during migration.** Emotion Mosaic and StyleX Mosaic would
  coexist for a while; the shared reset (`:where([data-cl-slot])`) and layer
  ordering need to be reconciled so neither stomps the other.

---

## Open questions / follow-ups

1. **clerk-js load path** for a static `mosaic.css` (runtime-injected UMD, not an
   npm import). Biggest unknown.
2. **Naming contract**: lock a documented `--cl-*` token list and `.cl-<slot>`
   class list as the public API (with a stability guarantee), since consumers
   pin to it.
3. **Theme delivery**: prebuilt themes as plain CSS files vs `createTheme`.
4. **Layer story is consumer-owned** (`@import … layer(components)`), so our only
   job is to document the recommended pattern. Still worth confirming how it
   interacts with any legacy Emotion styles present during the migration window.
5. **State model**: re-express the `data-cl-*` + conditions model as StyleX
   variants + `:pseudo` while keeping `.cl-*`/`data-*` targeting for consumers.
6. **Migration sequencing**: component-by-component behind the isolated build, or
   a single cutover once the engine is ported.

## Recommendation

The requested model (CSS-var theming + stable classes + a shipped stylesheet + no
`appearance` prop) is a **natural fit for StyleX and was proven end-to-end.** The
decision is not "can we" but "do we accept trading Mosaic's runtime override
engine for a static, CSS-first, zero-runtime model." Given Mosaic is greenfield
and the explicit goal is to push customization into consumer CSS, the trade is
favorable.

Suggested next step: extend the POC to a second, harder component (a multi-part
one like `tabs`, to exercise the no-child-selector / state-as-variant
constraints), and resolve the clerk-js stylesheet load path — those two retire
the remaining real risk before committing to the engine rewrite.

## Reproduction / artifacts

- Source: `packages/ui/src/mosaic-x/`
- Build: `cd packages/ui && pnpm build:mosaic-x` → `packages/ui/dist-mosaic-x/`
- Demo: open `packages/ui/src/mosaic-x/demo.html` after building
- Configs: `packages/ui/tsdown.mosaic-x.config.mts`,
  `packages/ui/tsconfig.mosaic-x.json`
