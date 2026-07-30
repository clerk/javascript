# Styling a component with StyleX

Mosaic styling is migrating off the Emotion slot-recipe engine (`styling.md`)
onto **StyleX** (`@stylexjs/stylex` 0.19). StyleX is compile-time atomic CSS: the
style objects become hashed atom classes plus one static stylesheet, with zero
runtime. This file is the authoring model for the StyleX layer; read it against
the pilot, `packages/ui/src/mosaic/components/button/`.

The public contract is unchanged from the recipe era — consumers still target
`--cl-*` vars, the `.cl-<slot>` class, and `data-<axis>` attrs, never StyleX's
hashed `x…` atoms. What changes is how a component is authored internally.

The guidance below is opinionated and evidence-backed: it codifies patterns
proven out across a full StyleX component library (tokens, ~100 components,
complex cases like Table/Calendar/Popover/Slider). Each is framed as **do X /
don't Y**. Lint enforcement of some of these is still landing, so treat them as
conventions to follow by hand, not guarantees the toolchain makes for you.

## File layout & the `.stylex.ts` convention

| File                              | Holds                                                           |
| --------------------------------- | --------------------------------------------------------------- |
| `tokens.stylex.ts`                | `defineVars` / `defineConsts` only (the tokens)                 |
| `<comp>/<comp>.styles.ts`         | `stylex.create({...})` — this component's atoms                 |
| `<family>.styles.ts`              | **shared** atoms imported by a whole component family           |
| `<comp>/<comp>.markers.stylex.ts` | `stylex.defineMarker()` results for scoped ancestor states      |
| `<comp>/<comp>.tsx`               | component; spreads `stylex.props(...)` via `mergeStyleProps`    |
| `props.ts`                        | `themeProps` (`.cl-<slot>` + `data-<axis>`) + `mergeStyleProps` |
| `styles/index.ts`                 | isolated-build barrel; derives `*VarName` types                 |

The `@stylexjs` eslint rules run on `src/mosaic/**`. The `enforce-extension`
rule reserves the `.stylex.ts` extension for StyleX define-primitives: **a
`.stylex.ts` file may export nothing but `defineVars` / `defineConsts` /
`defineMarker` results.** So:

- `stylex.create(...)` lives in a plain `.styles.ts` file, never `.stylex.ts`.
- `stylex.defineMarker()` is a define-primitive like the token builders, so it
  lives in its own `<comp>.markers.stylex.ts`, never a plain `.ts`.
- Derived types (`type ColorVarName = keyof typeof colorVars`) live in
  `styles/index.ts`, not in `tokens.stylex.ts` (they'd be a disallowed export).

**Styles live in their own file, never inline in the `.tsx`.**

- **DO** put a component's `stylex.create` in a co-located `<comp>.styles.ts` and
  import the atoms into the component. The `.tsx` stays rendering-only. This is a
  deliberate Mosaic convention — a single predictable place for a slot's styles
  and a readable component file. It diverges from StyleX libraries that author
  `create` inline in the component; we don't.
- **DON'T** inline `stylex.create` in a `.tsx`. No "it's only a few atoms"
  exception — small components get a `.styles.ts` too.
- **DO** hoist atoms into a shared `<family>.styles.ts` when several siblings
  render the same visual surface — e.g. inputs (`TextInput`, `NumberInput`, date
  fields, `Selector`) sharing one `inputWrapper` / `inputStatusBorder` /
  `inputStatusFocusWithin` set instead of redefining the border/focus treatment
  five times. (The shared-surface pattern to reach for when it appears; no shared
  styles file exists in Mosaic yet.)
- **DON'T** copy a slot's atoms between siblings. A repeated style object is the
  same signal as a repeated conditional: extract the shared concept.

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

- **DO** put light + dark in one token value via `light-dark()`. Never ship a
  second `@media (prefers-color-scheme: dark)` copy of a color.
- **DO** reserve `--cl-*`-prefixed keys for the public, overridable contract.
- **DO** name internal, non-contract vars with a `--_cl-*` prefix (e.g. a value a
  parent writes for a child to read). They still emit verbatim but the `_` marks
  them "not a contract, don't override."
- **DO** name a radius by **what the surface is**, not by size, so the steps nest:
  `--cl-radius-inner` for a mark inside a control, `--cl-radius-control` for the
  control itself (button, avatar square), `--cl-radius-container` for anything
  wrapping controls. A role name survives a value change; `--cl-radius-md` doesn't.
- **DO** compute tints at the call site with `color-mix()`, not as their own
  tokens. `color-mix(in oklab, ${primary}, ${fg} 12%)` beats minting
  `--cl-color-primary-hover-12`.
- **DON'T** mint a per-step derivative token for something a `calc()`/`color-mix()`
  can express from an existing token.
- **DO** build a fill that sits _on top of_ an unknown backdrop — a hover or pressed
  wash on a transparent `outline`/`ghost` control — as a **scrim**: an opacity of
  black-on-light / white-on-dark over `transparent`, not a percentage of a gray token.

  ```ts
  const step = `color-mix(in oklab, light-dark(oklch(0 0 0), oklch(1 0 0)) 12%, transparent)`;
  ```

  A gray token like `--cl-color-neutral` is a 900, not black, so the same percentage of
  it lands lighter than the percentage of black — and by an amount that shifts with
  whatever the control sits on, so the step numbers stop describing what they render.
  The scrim composites, so one ramp reads consistently on every surface. This applies
  to overlay fills only: a fill with a color of its own (`filled-primary`) still blends
  from that color toward its own on-fill.

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

**Reference tokens by bracket string key**, always: `colorVars['--cl-color-primary']`,
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
objects and compose them at the call site.

- **DO** split into: a **base** object (structure the slot always has), one or
  more **variant maps** keyed by a prop value, and small **state** objects applied
  conditionally.

  ```ts
  // base: what the slot always is
  const styles = stylex.create({
    base: { display: 'inline-flex', borderRadius: radiusVars['--cl-radius-element'] },
    iconOnly: { aspectRatio: '1' },
  });
  // variant map: keyed by the prop value, indexed at the call site
  const variants = stylex.create({
    primary: { backgroundColor: colorVars['--cl-color-primary'] },
    secondary: { backgroundColor: colorVars['--cl-color-secondary'] },
  });
  const sizes = stylex.create({
    sm: { height: sizeVars['--cl-size-sm'] },
    md: {
      /*…*/
    },
  });
  ```

- **DO** compose base + modifier in a **single** `stylex.props(...)` call, adding
  conditional atoms with `&&` / ternary. Order matters — later wins, so consumer
  `xstyle` goes last:

  ```tsx
  stylex.props(
    styles.base,
    variants[variant], // prop-keyed map lookup
    sizes[size],
    isIconOnly && styles.iconOnly,
    xstyle, // consumer StyleX — always LAST so it wins
  );
  ```

- **DON'T** put everything in one monolithic object (you lose prop-keyed lookup and
  conditional composition), and **don't** swing the other way into one object per
  property. Group by concern: base, variant, size, state.
- **DON'T** branch a variant with `variant === 'primary' ? a : b` inside the style.
  Encode the axis as a keyed map and look it up (`variants[variant]`). A repeated
  ternary is a missing variant map.
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
- **DO** flatten the cross product into one variant map keyed `<axis-a>-<axis-b>`,
  indexed directly. A template-literal key makes an unhandled pair a compile error,
  with no lookup map to maintain:

  ```ts
  const variants = stylex.create({
    'filled-primary': {
      /*…*/
    },
    'filled-negative': {
      /*…*/
    },
    'outline-primary': {
      /*…*/
    },
    // …one entry per cell
  });
  // <comp>.tsx — TS resolves the template against the literal keys
  variants[`${variant}-${color}`];
  ```

  Each entry is self-contained, so a cell can be read and tuned straight against a
  design matrix — which is usually the form these specs arrive in.

- **DO** hoist a value shared across cells to a **same-file** `const`. StyleX
  inlines it at build, so the duplication leaves the source without emitting a var:

  ```ts
  const primaryHover = `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 12%)`;
  ```

  Same-file is required — an imported one fails static evaluation ("Atoms" above).

**Where a var is still right.** This rule is about a component plumbing values to
itself. A custom property remains the correct tool when a value must cross an
element boundary (a parent computes, a descendant reads) or collapse an unbounded
dynamic value into a single atom — the `--_cl-*` cases in "Tokens" and sub-pattern
A in "Dynamic styles". Those have no var-free equivalent; decoupling one element's
own axes does.

Flattening does scale multiplicatively, so for a genuinely large product reach for
role atoms instead — each color exports the same role names (`solid`, `ink`,
`tint`) and the variant picks which to apply. Still var-free, at the cost of an
indirection the flattened map doesn't have.

### Conditions & state

Use StyleX's conditional-value objects (a `default` plus pseudo / at-rule keys).

```ts
backgroundColor: {
  default: colorVars['--cl-color-primary'],
  ':active': primaryActive,
  '@media (hover: hover)': {
    // the media block contributes only the pseudo; the top-level `default` still
    // paints the rest state. `:not(:active)` is load-bearing — see below.
    default: null,
    ':hover:not(:active)': primaryHover,
  },
},
```

- **DO** guard `:hover` behind `@media (hover: hover)` so it never sticks on touch;
  leave `:active`, `:focus-visible`, `:disabled` unguarded.

#### A media-wrapped `:hover` outranks a bare `:active`

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
- **DON'T** fix it by re-declaring `':active'` _inside_ the `@media` block. It does
  work — both selectors end up doubled and StyleX emits `:active` after `:hover` —
  but it depends on StyleX's emission order for the tiebreak and duplicates the
  value in every cell.
- Applies to any state pair where one side is inside an at-rule and the other is
  not. Confirm the output rather than trusting it: `pnpm build:mosaic --filter @clerk/ui`,
  then grep `dist-mosaic/styles.css` for the two selectors and compare their
  specificity.

- **A button that opens something takes the pressed fill while open**, so a
  disclosure trigger stays visibly engaged for as long as its surface is. Disclosure
  primitives already set `data-open` on the trigger (`popover-trigger.tsx` and
  friends), so this is styling-only — no headless change. It needs the _same_
  exclusion as `:active`, or hovering an open trigger lifts it back to the lighter
  hover step:

  ```ts
  backgroundColor: {
    default: 'transparent',
    ':enabled:active': neutralStep1,
    ':enabled[data-open]': neutralStep1,
    '@media (hover: hover)': {
      default: null,
      ':enabled:hover:not(:active):not([data-open])': neutralStep0,
    },
  },
  ```

  Worked example: `button.styles.ts`, applied across every filled/outline/ghost cell
  (`link` opts out — it reads as text, not a control).

Worked example: `packages/ui/src/mosaic/components/button/button.styles.ts`.

- **DO** use `:focus-visible` for focus rings (never bare `:focus`). For a
  **container** that should ring when a child is focused, use
  `:has(:focus-visible)` — **not** `:focus-within`. `:focus-within` matches any
  descendant focus, including a mouse click, so the container ring would flash on
  click; `:has(:focus-visible)` matches only keyboard-visible focus, so the
  container ring tracks the same modality as the element's own. `:has(:focus-visible)`
  is a plain conditional-value key, no special API:

  ```ts
  // container.styles.ts — the wrapper rings only on keyboard focus of a child
  outline:       { default: null, ':has(:focus-visible)': `2px solid ${colorVars['--cl-color-primary']}` },
  outlineOffset: { default: null, ':has(:focus-visible)': space['0.5'] },
  ```

  Reach for `:focus-within` only when you genuinely want an any-modality reaction
  (keep an affordance visible while a descendant is focused), never for a ring.

- **DO** use `default: null` when a property exists **only** in a pseudo/state
  branch, so the atom doesn't emit a base value that would clobber a merged style:

  ```ts
  outline:       { default: null, ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}` },
  outlineOffset: { default: null, ':focus-visible': space['0.5'] },
  ```

- **DO** take durations from `durationVars` (`--cl-duration-instant` / `-fast` /
  `-base` / `-slow` / `-slower`) rather than a literal, and vary them by state
  where the feedback should read as more or less direct:

  ```ts
  transitionDuration: {
    default: durationVars['--cl-duration-fast'],
    ':active': durationVars['--cl-duration-instant'],
  },
  ```

- **DO** pick the timing function by **what the property does**, not by how long
  it runs. Properties that move — `transform`, `translate`, `scale`, `rotate`,
  insets — take `easingVars['--cl-ease-default']`, whose slight overshoot is what
  sells the motion. Color and opacity take plain `linear`: their interpolation is
  already perceptually non-uniform, so an ease on top only makes the midpoint
  drag, and an overshoot extrapolates past the target color for nothing. A
  transform at `--cl-duration-fast` still wants the curve.

- **DON'T** reuse `--cl-ease-default` for something **leaving**. It is an arrival
  curve; run backwards it stalls for most of its duration and its overshoot
  becomes a wobble past the target. Departures take `easingVars['--cl-ease-exit']`
  at a shorter duration. See `motion.md` — enter/exit asymmetry has its own
  reference, with the measurements behind these rules.

- **DO** gate transitions/animations of **motion-bearing** properties on reduced
  motion — `transform`, `translate`, `scale`, `rotate`, positional insets — in the
  same object. `prefers-reduced-motion` is a vestibular-safety signal, so color
  and opacity transitions do **not** need it:

  ```ts
  transitionDuration: {
    default: durationVars['--cl-duration-base'],
    '@media (prefers-reduced-motion: reduce)': '0.01ms',
  },
  ```

- **DO** floor an interactive control's hit area at `targetVars['--cl-target-coarse']`
  under `@media (pointer: coarse)`. Use `minHeight`/`minWidth` so the size axis stays
  in charge otherwise, and give it its own atom rather than writing it into every
  size — the floor is one physical constant, and a part that isn't really a control
  (a `link` variant, which reads as text) opts out by not receiving the atom:

  ```ts
  touchTarget: {
    minHeight: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
  },
  ```

  Square controls need the floor on **both** axes, or the target grows tall and narrow.
  `--cl-target-coarse` is deliberately off the `--cl-spacing` scale: a consumer
  rescaling density must not shrink a touch target with it.

- **DON'T** suppress interaction with `pointer-events: none` on a disabled control.
  An element that isn't hit-tested supplies no cursor, so `cursor: not-allowed` never
  renders, and a wrapping tooltip never gets the pointer to explain the disabled
  state. Gate the interactive states on `:enabled` instead — `:hover`/`:active` still
  match a disabled element, so every one of them needs the gate.

- **DO** reflect runtime conditions the component owns (disabled, selected,
  invalid) as `data-<axis>` attrs via `themeProps`, in addition to the atom, so
  the state stays overridable in plain consumer CSS.

**Scoped ancestor states.** When a child's style depends on an **ancestor's**
interaction state (a wrapper `:hover`/`:focus-visible` styling an inner mark),
don't reach for a descendant combinator by hand. Use `stylex.when.ancestor()`
with a **marker** so the selector is scoped to _your_ subtree and can't be
triggered by unrelated ancestors:

```ts
// checkbox.markers.stylex.ts — a define-primitive module, its own file
export const checkboxScope = stylex.defineMarker();

// checkbox.styles.ts — the inner mark reacts to the labelled wrapper's state
borderColor: {
  default: colorVars['--cl-color-border'],
  [stylex.when.ancestor(':hover', checkboxScope)]: {
    '@media (hover: hover)': `color-mix(in oklab, ${colorVars['--cl-color-border']}, ${colorVars['--cl-color-tint']} 20%)`,
  },
},
```

Apply the marker atom to the ancestor, reference the scope in the descendant's
`create`. This replaces the Emotion engine's parent-selector hacks.

Write the hover guard and these selectors **raw**, as above — there is no
`hover()` helper to import, because StyleX can't inline a cross-module helper into
`create` (the Emotion engine's `hover()`/`motionSafe()` utils don't translate).
`*.styles.ts` files are therefore exempted from the repo's `no-restricted-syntax`
media-query rule (`eslint.config.mjs`); the `@stylexjs/*` rules still apply.

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

**Perf model to keep in mind:** each _distinct argument value_ emits a new atom /
injected rule. A bounded numeric set (~10–20 sizes) is fine. For an unbounded
value, sub-pattern A collapses it to a single `--var` atom; reach for a raw inline
`style` only when you specifically do **not** want it to be overridable.

> This supersedes the earlier blanket "Mosaic styling is fully static." Static is
> still the default — most styling is atoms, variant maps, and conditional-value
> objects. Dynamic functions are the deliberate exception for continuous runtime
> values, and even then the first move is usually to write a single `--cl`/`--_cl`
> var rather than a raw inline style.

**Every condition is a value key, never a top-level object.** A pseudo/at-rule
goes _inside_ the property it modifies (`transitionProperty: { default: …, '@media …': … }`),
not as a bare key on the style object. A top-level `'@media …': { … }` block is
legacy syntax and the `@stylexjs/no-legacy-contextual-styles` +
`@stylexjs/valid-styles` rules reject it (only `::before`/`::after` may sit at the
top level). Reduced-motion is the common case:

```ts
transitionProperty: { default: 'opacity, transform', '@media (prefers-reduced-motion: reduce)': 'none' },
```

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
  popup: {
    opacity: { default: 1, ':where([data-starting-style], [data-ending-style])': 0 },
    transform: { default: 'scale(1)', ':where([data-starting-style], [data-ending-style])': 'scale(0.94)' },
    // Reduced motion drops `transform` and keeps the fade — the gate belongs on the
    // moving property, not the whole transition.
    transitionProperty: { default: 'opacity, transform', '@media (prefers-reduced-motion: reduce)': 'opacity' },
    // Positional against `transitionProperty`, and branched by direction: the exit is
    // shorter and takes the departure curve. See `motion.md`.
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionTimingFunction: {
      default: `linear, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': `linear, ${easingVars['--cl-ease-exit']}`,
    },
  },
  ```

- **Another element's attribute → `stylex.when.*`.** For relational state use
  `stylex.when.ancestor(sel)` / `.descendant(sel)` / `.siblingBefore(sel)` /
  `.siblingAfter(sel)` / `.anySibling(sel)`, each taking a `:${string}` or
  `[${string}]` selector and returning a valid conditional key
  (`:where-ancestor(...)` etc.). Use this when a parent/sibling owns the state
  (e.g. a `[data-open]` container theming its children); use `:where([data-*])`
  when the element owns it.

So: `:where(...)` for self-state, `stylex.when.*` for relational state. Both
compile to real attribute selectors in `styles.css`, so animation stays
CSS-native — no JS state plumbing through the component.

## Public contract & composition (`props.ts`)

The element carries three things, and nothing else is a contract:

1. `--cl-*` vars (from tokens), 2. `.cl-<slot>` class, 3. `data-<axis>` attrs.

`themeProps('button', { intent, variant })` produces the stable `.cl-<slot>` class
plus a kebab-cased `data-<axis>` reflection of the visual props, so consumers
target stable data-attribute selectors, not collision-prone class names.

`mergeStyleProps` fuses everything in precedence order — **theme props → StyleX atoms →
consumer `className`/`style`** — so the consumer always wins. It concatenates
className left-to-right and merges `style` with the consumer object spread last:

```tsx
<button
  {...mergeStyleProps(
    themeProps('button', { intent, variant }),
    stylex.props(styles.base, variants[variant], xstyle),
    className,
    style,
  )}
/>
```

- **DO** put consumer `xstyle` **last** inside `stylex.props(...)` (so their atoms
  win the cascade) and consumer `className`/`style` last inside `mergeStyleProps` (so
  their raw CSS wins).
- **DON'T** forward `xstyle` down to internal slot elements — it targets the slot
  the consumer named, not your private structure.
- **DON'T** call `stylex.props` twice on one element or spread `{...props}` after
  the merge result — fuse everything through the one `mergeStyleProps` call.

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
  `:hover`/`:active`/`:focus-visible`/`:focus-within`/`:disabled`, `:has()`,
  `:not()` and compound pseudo keys (`':hover:not(:active)'` compiles and lints),
  `::before`/`::after`/`::backdrop`, `@starting-style` (enter animations),
  `stylex.keyframes(...)`, `anchor-size(width|height)` (popover/menu matching its
  trigger), CSS counters, `@media (hover: hover)` / `(prefers-reduced-motion)` /
  `(pointer: coarse)`, `data-*` state via `:where([data-*])` (self) or
  `stylex.when.*` (relational) — see "Reacting to `data-*` state" above.
- Prefer CSS-native solutions over JS workarounds for anything StyleX supports.
- Avoid manual `@layer` / `@property` inside `create` (StyleX owns layering;
  `@property` compiles but emits invalid output).
- No need for `stylex.firstThatWorks` or `stylex.attrs` — a proven full library
  ships without either; reach for conditional-value objects and `mergeStyleProps`
  instead.
- Dynamic functions-in-`create` are allowed but exceptional — see "Dynamic styles"
  above. Default to static atoms, variant maps, and conditional-value objects; use
  a dynamic function only for a continuous runtime value, and prefer writing a
  single `--cl`/`--_cl` var over setting a property raw.
