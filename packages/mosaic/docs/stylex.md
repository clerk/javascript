# Styling a component with StyleX

Mosaic is styled with **StyleX**: compile-time atomic CSS, where the style objects
become hashed atom classes plus one static stylesheet, with zero runtime. This file
is the authoring model; read it against the reference component,
`packages/mosaic/src/components/button/`. The public contract it produces
(`--cl-*`, `.cl-<slot>`, `data-<axis>`) is in `ARCHITECTURE.md` → "Public styling
API".

## File layout & the `.stylex.ts` convention

| File                              | Holds                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| `tokens.stylex.ts`                | `defineVars` / `defineConsts` only (the tokens)                                          |
| `<comp>/<comp>.styles.ts`         | `stylex.create({...})` — this component's atoms                                          |
| `styles/<family>.styles.ts`       | **shared** atoms composed by many components                                             |
| `<comp>/<comp>.markers.stylex.ts` | `stylex.defineMarker()` results for scoped ancestor states                               |
| `<comp>/<comp>.vars.stylex.ts`    | component-scoped `defineVars`, e.g. typed properties (`scroll-area.vars.stylex.ts`)      |
| `<comp>/<comp>.tsx`               | component; spreads `stylex.props(...)` via `mergeStyleProps`                             |
| `props.ts`                        | `themeProps` (`.cl-<slot>` + `data-<axis>`), `mergeStyleProps`, the `Mosaic*Props` types |
| `styles/index.ts`                 | isolated-build barrel; derives `*VarName` types                                          |

The `@stylexjs` eslint rules run on `packages/mosaic/src/**` (tests excluded). The `enforce-extension`
rule reserves the `.stylex.ts` extension for StyleX define-primitives: **a
`.stylex.ts` file may export nothing but `defineVars` / `defineConsts` /
`defineMarker` results.** So `stylex.create(...)` lives in a plain `.styles.ts`
file, and `stylex.defineMarker()` lives in its own `<comp>.markers.stylex.ts`.

**Styles live in their own file, never inline in the `.tsx`.**

- **DO** put a component's `stylex.create` in a co-located `<comp>.styles.ts` and
  import the atoms into the component. The `.tsx` stays rendering-only. This is a
  deliberate Mosaic convention — a single predictable place for a slot's styles
  and a readable component file. It diverges from StyleX libraries that author
  `create` inline in the component; we don't.
- **DON'T** inline `stylex.create` in a `.tsx`. No "it's only a few atoms"
  exception — small components get a `.styles.ts` too. No lint rule enforces
  this, so a few files still break it; don't copy them.
- **DO** hoist atoms into a shared `styles/<family>.styles.ts` when several
  components render the same visual surface, rather than copying a slot's atoms
  between siblings — e.g. `Input`, `OTP`, `InputGroup` and `TagInput` share
  `inputStyles` from `styles/input.styles.ts`. Check `styles/` for an existing
  family before adding one. Never put a shared style file under `components/`.
- **DO** pick `rtl.mirror` (`styles/rtl.styles.ts`) by meaning, not shape: a
  forward/back chevron mirrors; a dropdown chevron or an external-link arrow does
  not.

## Tokens (`tokens.stylex.ts`)

Keys starting with `--` emit verbatim (the public `--cl-*` handles, see
`ARCHITECTURE.md` → "Token architecture"); other keys are hashed. Check
`tokens.stylex.ts` before writing a literal: elevation, for example, comes from
`shadowVars`.

- **DO** put light + dark in one token value via `light-dark()`. Never ship a
  second `@media (prefers-color-scheme: dark)` copy of a color.
- **DO** reserve `--cl-*`-prefixed keys for the public, overridable contract.
- **DO** name internal, non-contract vars with a `--_cl-*` prefix (e.g. a value a
  parent writes for a child to read). They still emit verbatim but the `_` marks
  them "not a contract, don't override."
- **DO** pick radii from the size scale in `radiusVars`. `--cl-radius-md` is the
  control radius (button); a surface wrapping controls takes a larger step so the
  corners nest.
- **DO** compute tints at the call site with `color-mix()`, not as their own
  tokens. `color-mix(in oklab, ${primary}, ${fg} 12%)` beats minting
  `--cl-color-brand-hover-12`.
- **DON'T** mint a per-step derivative token for something a `calc()`/`color-mix()`
  can express from an existing token.
- **DON'T** give one value two public names. The focus ring's colour is
  `--cl-color-ring` and nothing else — a `--cl-focus-outline-color` alias beside it
  would let a consumer override one and not the other, and the ring's appearance
  would then depend on which they picked.
- **DO** build a fill that sits _on top of_ an unknown backdrop — a hover or pressed
  wash on a transparent `outline`/`ghost` control — from the `--cl-color-neutral-alpha-*`
  tokens, not a percentage of a gray token. A gray token like `--cl-color-foreground`
  is a 900, not black, so the same percentage of it lands lighter than the percentage
  of black — and by an amount that shifts with whatever the control sits on, so the
  step numbers stop describing what they render. The scrim composites, so one ramp
  reads consistently on every surface.

**Spacing is one public var plus an internal `space` scale.** Only `--cl-spacing`
is part of the contract; `space` steps are hashed (`gap: space['2']`).

Why not a `space(n)` helper: StyleX evaluates `stylex.create` **statically at
build time** and cannot inline a helper imported from a non-`.stylex` module (it
errors "Could not resolve the path to the imported file"). A `.stylex.ts` export
is the shareable form.

**Reference tokens by bracket string key**, always: `colorVars['--cl-color-brand']`,
`space['2']`. A computed key (`colorVars[name]`) defeats StyleX static analysis
and won't compile.

## Atoms (`<comp>.styles.ts`)

`stylex.create` values must be statically resolvable. Allowed: literals,
**same-file** locals, and references to `.stylex` tokens (`colorVars[...]`,
`space['2']`). Not allowed: a value from a helper imported across modules. For
arithmetic, inline a `calc()` template literal with a token:
`` `calc(-1 * ${space['2']})` ``.

### Breaking up `stylex.create`

There is no one big styles object. Split by concern into several small named
objects and compose them at the call site (the Button in `ARCHITECTURE.md` →
"Component authoring pattern" is the shape).

- **DO** split into: a **base** object (structure the slot always has), one or
  more **variant maps** keyed by a prop value, and small **state** objects applied
  conditionally.
- **DO** compose them in a **single** `stylex.props(...)` call, adding conditional
  atoms with `&&` / ternary. Later wins, so consumer `xstyle` goes last:
  `stylex.props(styles.base, variants[…], sizes[size], isIconOnly && styles.iconOnly, xstyle)`.
- **DON'T** put everything in one monolithic object (you lose prop-keyed lookup and
  conditional composition), and **don't** swing the other way into one object per
  property. Group by concern: base, variant, size, state.
- **DON'T** branch a variant with `variant === 'primary' ? a : b` inside the style.
  Encode the axis as a keyed map and look it up. A repeated ternary is a missing
  variant map.
- A helper that assembles a slot may **return an array** of atoms
  (`[base, direction[x], gap[n]]`) for the caller to spread into `stylex.props`.

### Multiplying axes: flatten, don't plumb vars

When two visual axes multiply (`color` × `variant`), the tempting move is to have
one axis write custom properties and the other read them — 3 + 4 declarations
instead of 12, with each axis staying independent. **Don't.**

- **DON'T** declare custom properties inside a component's `stylex.create` to
  decouple that component's own axes. They emit into the stylesheet and appear on
  every instance in devtools, which reads as public API nobody agreed to support.
  A `--cl-*` name is worse still — that prefix is reserved for the overridable
  contract (see "Tokens").
- **DON'T** reach for `defineVars` + `createTheme` to dodge that. The names get
  hashed instead of `--cl-*`, but they still land in the inspector on every element.
- **DO** flatten the cross product into one variant map keyed `<axis-a>-<axis-b>`
  (`'filled-primary'`, `'outline-primary'`, …), indexed with
  ``variants[`${variant}-${color}`]``. A template-literal key makes an unhandled
  pair a compile error, with no lookup map to maintain. See `button.styles.ts`.
- **DO** hoist a value shared across cells to a **same-file** `const`. StyleX
  inlines it at build, so the duplication leaves the source without emitting a var:

  ```ts
  const primaryHover = `color-mix(in oklab, ${colorVars['--cl-color-brand']}, ${colorVars['--cl-color-brand-foreground']} 12%)`;
  ```

  Same-file is required — an imported one fails static evaluation ("Atoms" above).

**Where a var is still right.** This rule is about a component plumbing values to
itself. A custom property remains the correct tool when a value must cross an
element boundary (a parent computes, a descendant reads) or collapse an unbounded
dynamic value into a single atom — the `--_cl-*` cases in "Tokens" and sub-pattern
A in "Dynamic styles". Those have no var-free equivalent; decoupling one element's
own axes does.

## Conditions & state

Use StyleX's conditional-value objects (a `default` plus pseudo / at-rule keys).

```ts
backgroundColor: {
  default: colorVars['--cl-color-brand'],
  ':active': primaryActive,
  '@media (hover: hover)': {
    // the media block contributes only the pseudo; the top-level `default` still
    // paints the rest state. `:not(:active)` is required — see below.
    default: null,
    ':hover:not(:active)': primaryHover,
  },
},
```

- **DO** guard `:hover` behind `@media (hover: hover)` so it never sticks on touch;
  leave `:active`, `:focus-visible`, `:disabled` unguarded.
- **Every condition is a value key, never a top-level object.** A pseudo/at-rule
  goes _inside_ the property it modifies, not as a bare key on the style object
  (only `::before`/`::after` may sit at the top level). Lint rejects the legacy
  form.

### A media-wrapped `:hover` outranks a bare `:active`

StyleX encodes precedence by **repeating the class name**, and an at-rule adds
priority. So a `@media (hover: hover)` `:hover` compiles to a doubled selector while
a bare `:active` stays single — and the hover wins while the button is pressed:

```css
.x1ozrsgg:active {
} /* 0,1,1 — loses */
@media (hover: hover) {
  .x1f1bnkq.x1f1bnkq:hover {
  } /* 0,3,0 — wins during the press */
}
```

The symptom is a hovered button that never shows its pressed colour on a mouse
device, while touch devices look correct.

- **DO** write the hover branch as `':hover:not(:active)'`. It stops the hover rule
  **matching** during a press, so the fix rests on selector semantics rather than on
  how StyleX happens to order equal-specificity rules.
- **DO** keep the bare `':active'` outside the media query. It is the only pressed
  state a no-hover device ever sees, since such a device never matches
  `(hover: hover)`.
- **DON'T** re-declare `:active` inside the media block; it relies on StyleX
  emission order.
- Applies to any state pair where one side is inside an at-rule and the other is
  not. Confirm the output rather than trusting it: `pnpm build --filter @clerk/mosaic`,
  then grep `dist/styles.css` for the two selectors and compare their
  specificity.
- A disclosure trigger keeps the pressed fill while `[data-open]`, and its hover
  excludes `:not([data-open])` too; see the comment and cells in
  `button.styles.ts`.

### Focus, motion, touch, disabled

- **DON'T** write a focus ring by hand. Compose `focusOutline` from
  `styles/focus-outline.styles.ts` into the element's `stylex.props(...)`:
  `focusOutline.visible` for the element's own keyboard focus, `focusOutline.within`
  for a **container** that should ring when a child is focused. The ring is one
  decision for the whole system — width, style, colour and offset all come from
  `--cl-focus-outline-*` and `--cl-color-ring`, so a theme retargets every ring at
  once.

  ```tsx
  // item.tsx — the ring is an atom in the chain, not a property in the styles file
  stylex.props(reset.base, focusOutline.visible, slots.item.base, slots.item[size]);
  ```

  It uses `:focus-visible`, never bare `:focus`, and `:has(:focus-visible)` for the
  container form — **not** `:focus-within`, which matches any descendant focus
  including a mouse click, so the container ring would flash on click. Reach for
  `:focus-within` only when you genuinely want an any-modality reaction (keep an
  affordance visible while a descendant is focused), never for a ring. Why
  longhands, and the `Input` exception: see the header of `focus-outline.styles.ts`.

- **DO** use `default: null` when a property exists **only** in a pseudo/state
  branch, so the atom doesn't emit a base value that would clobber a merged style:

  ```ts
  boxShadow: { default: null, ':focus-visible': focusShadow },
  ```

- **DO** take durations and easings from `durationVars` / `easingVars`; which one
  fits which change, and how to gate moving properties on
  `prefers-reduced-motion`, is in `motion.md`.

- **DO** floor an interactive control's hit area at `--cl-target-coarse` under
  `(pointer: coarse)` by composing a `touchTarget` atom (`::after` overlay) and,
  for square controls, `touchTargetIcon`. Copy both from `button.styles.ts`; its
  comments explain the shape.

- **DON'T** use `pointer-events: none` for disabled; gate `:hover`/`:active` on
  `:not([data-disabled])` (not `:enabled`), and pressed also on
  `:not([data-pending])`. Reasons: `button.styles.ts`.

- **DO** reflect runtime conditions the component owns (disabled, selected,
  invalid) as `data-<axis>` attrs via `themeProps`, in addition to the atom, so
  the state stays overridable in plain consumer CSS.

**Scoped ancestor states.** When a child's style depends on an **ancestor's**
interaction state (a wrapper `:hover`/`:focus-visible` styling an inner mark),
don't reach for a descendant combinator by hand. Use `stylex.when.ancestor()`
with a **marker** so the selector is scoped to _your_ subtree and can't be
triggered by unrelated ancestors:

```ts
// select.markers.stylex.ts — a define-primitive module, its own file
export const selectOptionScope = stylex.defineMarker();

// select.styles.ts — the indicator shows only on the selected option
visibility: {
  default: 'hidden',
  [stylex.when.ancestor('[data-selected]', selectOptionScope)]: 'visible',
},
```

Apply the marker atom to the ancestor, reference the scope in the descendant's
`create`.

Write the hover guard and these selectors **raw**, as above — there is no
`hover()` helper to import, because StyleX can't inline a cross-module helper into
`create`. `*.styles.ts` files are exempt from the repo's media-query lint rule.

## Dynamic styles: dos and don'ts

A style key can be a **function** of a runtime value:
`const dyn = stylex.create({ width: (w) => ({ width: w }) })`, applied
`dyn.width(value)`. This is the right tool for a **continuous or unbounded**
runtime value that can't be enumerated as a variant map — sizes, transforms,
offsets, indents, counts, delays, computed widths. It is **not** a substitute for
a variant map over a small closed set.

**When to reach for dynamic (and when not):**

- **DO** use a dynamic function for a value that is continuous, per-instance, or
  formula-derived: an avatar pixel size (`size => ({ width: size, height: size })`,
  font size `size * 0.4`), a drag transform
  (`t => ({ transform: t })` with `t = \`scale(${zoom}) translate(...)\``), a
tree-row indent `(depth-1) \* step`, a line clamp `n => ({ WebkitLineClamp: n })`,
a staggered `animationDelay`.
- **DON'T** use dynamic for a closed enum (sm/md/lg, primary/secondary) — that's a
  variant map. **DON'T** use it for a plain static token — that's a static atom.

**The important sub-distinction — write a `--var`, or set the property?**

There are two shapes of dynamic style. Prefer the first whenever the value feeds a
rule that also needs media/pseudo variants, needs to be read by descendants, or
must stay overridable by the consumer:

- **A. Write a CSS custom property; let a static rule consume it.** Only **one**
  atom is generated no matter how many distinct values flow through, and — this is
  the subtle win — a `var()` written into a class does **not** beat a consumer's
  class-level `@media` override, whereas a raw inline `style` property would.

  ```ts
  // set the var dynamically…
  const dyn = stylex.create({
    gutter: (digits: number) => ({ '--_cl-gutter': `${digits}ch` }),
    tabIndicator: (offset: string) => ({ '--_cl-tab-indicator': offset }),
  });
  // …and consume it from a normal static atom / descendant rule
  const styles = stylex.create({ row: { gridTemplateColumns: 'var(--_cl-gutter) 1fr' } });
  ```

  Also the right shape for a value a parent computes and **descendants** read
  (`--_cl-content-width`, an avatar-group `--_cl-overlap` a sibling rule consumes):
  the var inherits; no per-descendant atom.

- **B. Set the real property directly** — fine when the value is genuinely
  per-instance, only this element uses it, and no rule/descendant needs to read it
  (a live drag `transform`, a one-off `width`, `WebkitLineClamp`). Accept that
  each distinct value emits its own atom.

Each distinct argument emits an atom; bound the set or use shape A.

### Reacting to `data-*` state (the headless-transition case)

Headless primitives drive animation off `data-*` attributes — e.g. the popover
popup carries its own `data-starting-style` (entering frame) and
`data-ending-style` (exiting). You can style off these in StyleX; it depends on
_whose_ attribute you're reading:

- **The element's own attribute → wrap in `:where(...)`.** Conditional keys must
  start with `:` or `@`, so a bare `[data-*]` is rejected — but `:where([data-*])`
  is a valid pseudo-class string that matches the same element (zero specificity;
  StyleX self-doubles the atom class so the conditional still wins):

  ```ts
  opacity: { default: 1, ':where([data-starting-style], [data-ending-style])': 0 },
  transform: { default: 'scale(1)', ':where([data-starting-style], [data-ending-style])': 'scale(0.94)' },
  ```

  Full popup, with timing and reduced motion: `popover.styles.ts`; the reasons are
  in `motion.md`.

- **Another element's attribute → `stylex.when.*`** (e.g.
  `stylex.when.ancestor('[data-open]', marker)`). Use this when a parent/sibling
  owns the state; use `:where([data-*])` when the element owns it.

So: `:where(...)` for self-state, `stylex.when.*` for relational state. Both
compile to real attribute selectors in `styles.css`, so animation stays
CSS-native — no JS state plumbing through the component.

## Public contract & composition (`props.ts`)

The contract (`--cl-*`, `.cl-<slot>`, `data-<axis>`) and how `themeProps` +
`mergeStyleProps` compose a part are in `ARCHITECTURE.md` → "Public styling API"
and "Component authoring pattern". Two rules it doesn't state:

- **DON'T** forward `xstyle` to internal slot elements; it targets the slot the
  caller named.
- **DON'T** call `stylex.props` twice on one element; fuse everything through one
  `mergeStyleProps` call.

### `xstyle`, not `className`/`style`

A part takes StyleX atoms through `xstyle`, declared in the caller's own
`*.styles.ts` (`ARCHITECTURE.md` → "Public styling API"). Only native elements
spread `stylex.props(...)`; on a part, pass the atoms as `xstyle`. Lint flags both
mistakes outside `src/primitives/**`. Why `XStyle` is wider than `StyleXStyles`:
`props.ts`.

### Type every part with `MosaicComponentProps`

Use `MosaicComponentProps<Tag>` (or `MosaicElementProps<Tag>` when there's no
`render`); they drop `color` so a callback's props spread into a part whose
`color` is a variant union.

- **DON'T** type a Mosaic part with the headless `ComponentProps<Tag>` (or
  `React.ComponentPropsWithoutRef<typeof Primitive.X>`). Those keep `color: string`, and
  every consumer then has to strip it: `props: Omit<React.HTMLAttributes<HTMLElement>, 'color'>`.
- **DON'T** re-export a headless part straight onto the Mosaic namespace object
  (`Popover.Trigger = Primitive.Trigger`) — that leaks the wide type. Bridge it
  with a `forwardRef` typed `MosaicComponentProps<'button'>` that renders
  `<Primitive.Trigger ref={ref} {...props} />`.
- If a consumer needs to annotate a `render` callback, the API is wrong — fix the
  part's props type instead. Inline callbacks infer with no annotation.

## Build & CSS delivery (two contexts, same babel)

- **Published**: see `ARCHITECTURE.md` → "CSS build".
- **Swingset** (source-consumed): `@stylexjs/unplugin/webpack` in `next.config`
  transforms StyleX **JS only** (calls → static atoms; SWC/Emotion untouched);
  `@stylexjs/postcss-plugin` extracts the **CSS** by replacing `@stylex;` in
  `globals.css`. Both must share the same StyleX babel version + options so atom
  hashes line up.

Both set **`useCSSLayers: true`** (StyleX emits `@layer priorityN` for its own
precedence; the consumer's `@import … layer()` picks the outer layer). Both pin
**lightningcss targets** (`stylex-lightningcss.config.mjs`) to browsers with
native `light-dark()`/`oklch()` so the token colors aren't down-leveled into an
invalid polyfill.

## CSS features we lean on / caveats

- YES: `var()`, `calc()`, `color-mix()`, `light-dark()`, nested `@media`+pseudo,
  `:hover`/`:active`/`:focus-visible`/`:focus-within`/`:disabled`, `:has()`,
  `:not()` and compound pseudo keys (`':hover:not(:active)'` compiles and lints),
  `::before`/`::after`/`::backdrop`, `@starting-style` (enter animations),
  `stylex.keyframes(...)`, `anchor-size(width|height)` (popover/menu matching its
  trigger), CSS counters, `@media (hover: hover)` / `(prefers-reduced-motion)` /
  `(pointer: coarse)`, `data-*` state via `:where([data-*])` (self) or
  `stylex.when.*` (relational) — see "Reacting to `data-*` state" above.
- Prefer CSS-native solutions over JS workarounds for anything StyleX supports.
- Avoid manual `@layer` inside `create`; StyleX owns layering. Register a typed
  custom property with `stylex.types.*` in a `*.vars.stylex.ts`
  (`scroll-area.vars.stylex.ts`), not a raw `@property`.
- `stylex.firstThatWorks` and `stylex.attrs` are not used; reach for
  conditional-value objects, `xstyle`, and `mergeStyleProps` instead.
