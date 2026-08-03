import * as stylex from '@stylexjs/stylex';

// Mosaic design tokens.
//
// `stylex.defineVars` normally hashes variable names (e.g. `--x1a2b3c`), which
// consumers cannot target. Keys that start with `--` are emitted verbatim, so
// these become real, stable custom properties a consumer can override in plain
// CSS without touching StyleX:
//
//   :root { --cl-color-primary: rebeccapurple; }
//
// StyleX still emits `:root { --cl-color-primary: … }` as the default. Following
// astryx's structure: each group is a plain `*Defaults` object wrapped by
// `defineVars`. The `*VarName` unions are derived from the exported `*Vars` in
// `styles/index.ts` — the `@stylexjs/enforce-extension` rule requires a
// `.stylex.ts` file to export nothing but its `defineVars` results. Color tokens
// carry light and dark in one `light-dark(...)` value, so dark mode lives in the token
// layer and resolves against the `color-scheme` in scope, with no
// `@media (prefers-color-scheme)` duplication. The `--cl-` prefix namespaces
// the vars so they never collide with a host app's own custom properties.

// =============================================================================
// Color Tokens
// =============================================================================

const colorDefaults = {
  '--cl-color-primary': 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  '--cl-color-primary-foreground': 'light-dark(oklch(0.985 0 0), oklch(0.205 0 0))',
  '--cl-color-primary-faded': 'light-dark(oklch(0.9583 0.0214 291.74), oklch(0.3097 0.1008 285.05))',

  '--cl-color-neutral': 'light-dark(oklch(0.2928 0.0163 285.35), oklch(0.9854 0.0013 286.38))',
  '--cl-color-neutral-foreground': 'light-dark(oklch(0.24 0 0), oklch(0.96 0 0))',
  '--cl-color-neutral-faded': 'light-dark(oklch(0.5697 0.0246 279.94), oklch(0.6953 0.0261 285.7))',

  '--cl-color-negative': 'light-dark(oklch(0.577 0.245 27.325), oklch(0.637 0.237 25.331))',
  '--cl-color-negative-foreground': 'oklch(0.985 0 0)',
  '--cl-color-negative-faded': 'light-dark(oklch(0.9757 0.0118 17.36), oklch(0.255 0.0604 22.31))',

  '--cl-color-positive': 'light-dark(oklch(0.548 0.153 152.535), oklch(0.696 0.17 162.48))',
  '--cl-color-positive-foreground': 'oklch(0.985 0 0)',
  '--cl-color-positive-faded': 'light-dark(oklch(0.9859 0.0164 156.92), oklch(0.3297 0.052 152.31))',

  '--cl-color-warning': 'light-dark(oklch(0.646 0.222 41.116), oklch(0.75 0.183 55.934))',
  '--cl-color-warning-foreground': 'oklch(0.985 0 0)',
  '--cl-color-warning-faded': 'light-dark(oklch(0.9799 0.0147 70.89), oklch(0.2725 0.0547 55.7))',

  '--cl-color-card': 'light-dark(oklch(1 0 0), oklch(0.205 0 0))',
  '--cl-color-card-foreground': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',

  '--cl-color-border': 'light-dark(oklch(0.9475 0.0067 286.27), oklch(0.3321 0.014 285.61))',
  '--cl-color-border-faded': 'light-dark(oklch(0.9587 0.0027 286.35), oklch(0.296 0.0126 285.61))',
} as const;

export const colorVars = stylex.defineVars(colorDefaults);

// =============================================================================
// Radius Tokens
// =============================================================================
// Named by what a surface is, not by size, so the steps nest: `inner` for a mark
// sitting inside a control, `control` for the control itself (button, avatar
// square), `container` for anything wrapping controls. `control` is 6px — a step
// the 4/8/12 progression doesn't land on, which is why it's its own token rather
// than a reuse of `inner` or `element`.

const radiusDefaults = {
  '--cl-radius-none': '0rem',
  '--cl-radius-inner': '0.25rem',
  '--cl-radius-control': '0.375rem',
  '--cl-radius-element': '0.5rem',
  '--cl-radius-container': '0.75rem',
  '--cl-radius-full': 'calc(infinity * 1px)',
} as const;

export const radiusVars = stylex.defineVars(radiusDefaults);

// =============================================================================
// Target Size Tokens
// =============================================================================
// The floor a control's hit area drops to under a coarse pointer — a fingertip is
// roughly 44px across regardless of how dense the rest of the UI is. Deliberately
// off the `--cl-spacing` scale for that reason: a consumer rescaling density must
// not shrink a touch target with it.

const targetDefaults = {
  '--cl-target-coarse': '2.75rem',
} as const;

export const targetVars = stylex.defineVars(targetDefaults);

// =============================================================================
// Scrollbar Tokens
// =============================================================================
// One opinion for every scrolling surface in Mosaic, set in one place. Mosaic has no
// reason to render differently-sized scrollbars in different components, so these are
// tokens rather than per-component props — a consumer restyles all of them at once.
//
// The width is a real LENGTH, not the `auto | thin | none` keyword `scrollbar-width` takes.
// Mosaic paints the scrollbar through `::-webkit-scrollbar`, which takes a length; the two
// paths are mutually exclusive (a non-`auto` `scrollbar-width` or `scrollbar-color` makes a
// UA ignore the pseudo-elements outright), so specifying a length is the honest option and
// the keyword one is gone. Firefox implements neither pseudo-element and keeps its platform
// scrollbar. Set the width to `0px` to hide it outright, which is what the old `none` did.
//
// Deliberately in PIXELS rather than on the `rem` scale the rest of the tokens use. A scrollbar
// is chrome, not content: it should stay the same hairline whether or not the surrounding text
// scales, and 8px of lane carrying a 2px inset — a 4px pill with a 2px track either side — is
// a specific hairline rather than a ratio of anything. Rounding also matters more here than
// elsewhere, since the thumb is only a few pixels wide to begin with.
//
// There is deliberately no knob for nudging the thumb sideways within its lane. The lane itself
// cannot move — the browser places it at the inline end of the padding box, and it takes no margin,
// offset, or transform — so the only lever is making the thumb's insets asymmetric, and that
// visibly deforms the pill: `background-clip: content-box` clips to the inner radius, which is the
// outer radius minus each side's own border width, so unequal insets draw the two halves of every
// cap with different curvature. Tried and measured; not worth a hairline of position.
//
// The colours are FOUR states, not three, and they run from quietest to loudest: `idle` while the
// pointer is elsewhere, the base once it reaches the region, then `hover` and `active` for the
// thumb's own two. Each derives from `--cl-scrollbar-thumb` rather than baking its value in, so
// they resolve at use time — overriding the base re-derives all three, while any one stays
// individually overridable. The base is itself mixed most of the way toward `--cl-color-card`,
// which keeps a 4px bar reading as a hairline rather than a hard rule; `idle` carries on in that
// direction, and the other two step back toward `--cl-color-card-foreground`, deepening in light
// mode and lightening in dark, since that token already carries both.
//
// Only the idle → base step can animate. It is set on the scroller, which owns the transition;
// the thumb's own two are set on the pseudo-element, and Blink runs no transition there.
//
// `--cl-scrollbar-thumb-idle: oklch(from var(--cl-scrollbar-thumb) l c h / 0)` is the whole recipe
// for a scrollbar that fades in on approach: the pill paints nothing until the pointer reaches the
// region, and the lane is reserved either way, so nothing moves.
//
// Only applied under `@media (pointer: fine)`. A touch platform draws an overlay bar there is
// no width to apply to, and thinning a target that is already hard to hit would be actively
// worse — Polaris's `s-scroll-box` gates its scrollbar styling the same way.

// Self-reference by literal name: the group being defined can't read its own exported object,
// and `--`-prefixed keys are emitted verbatim, so the name is stable enough to write by hand.
const scrollbarThumb = 'var(--cl-scrollbar-thumb)';

const scrollbarDefaults = {
  '--cl-scrollbar-width': '8px',
  '--cl-scrollbar-thumb-inset': '2px',
  '--cl-scrollbar-thumb': `color-mix(in oklab, ${colorVars['--cl-color-neutral-faded']}, ${colorVars['--cl-color-card']} 55%)`,
  '--cl-scrollbar-thumb-idle': `color-mix(in oklab, ${scrollbarThumb}, ${colorVars['--cl-color-card']} 45%)`,
  '--cl-scrollbar-thumb-hover': `color-mix(in oklab, ${scrollbarThumb}, ${colorVars['--cl-color-card-foreground']} 15%)`,
  '--cl-scrollbar-thumb-active': `color-mix(in oklab, ${scrollbarThumb}, ${colorVars['--cl-color-card-foreground']} 30%)`,
} as const;

export const scrollbarVars = stylex.defineVars(scrollbarDefaults);

// The edge-fade indicator on a scrolling region. Global rather than owned by `ScrollArea`
// because "how soft is the edge of a scrolling region" is a design-language decision, on a
// par with a radius step — any component that grows an edge fade should read these rather
// than mint its own family. A component that genuinely needs a different value sets the var
// on itself; the global default still applies everywhere else.
//
// `size` and `range` default to the same value on purpose: the fade reaches full strength
// after you've scrolled its own height, so it grows in at the rate the content moves.
//
// There is deliberately no `inset` knob for holding the fade back from the scrollbar. It
// existed only to compensate for a width CSS could not measure; now that `--cl-scrollbar-width`
// specifies that width, the two can never legitimately differ — a smaller inset lets the fade
// cover part of the scrollbar, a larger one leaves an unfaded strip beside it — so the mask
// derives its inset from the scrollbar token instead of exposing a second name for the same
// number.
const scrollFadeDefaults = {
  '--cl-scroll-fade-size': '1.5rem',
  '--cl-scroll-fade-range': '1.5rem',
} as const;

export const scrollFadeVars = stylex.defineVars(scrollFadeDefaults);

// =============================================================================
// Spacing Tokens
// =============================================================================
// `--cl-spacing` is the ONLY exposed custom property (the base unit, Tailwind's
// model). Overriding it rescales every gap, pad, and control height at once.

const spacingDefaults = {
  '--cl-spacing': '0.25rem',
} as const;

export const spacingVars = stylex.defineVars(spacingDefaults);

// The scale is `defineVars` (like astryx's `spacingVars`): each step is a StyleX
// var whose default is `calc(var(--cl-spacing) * n)`, so overriding `--cl-spacing`
// still rescales the whole scale. `defineConsts` was tried here but emits no CSS
// across module boundaries — consumers got dangling `var(--hash)` refs. StyleX
// hashes these var names (they aren't `--cl-*`), so only `--cl-spacing` stays a
// stable, targetable custom property. `space['2']` reads like Tailwind's `space-2`.
const step = (multiple: number): string => `calc(var(--cl-spacing) * ${multiple})`;

export const space = stylex.defineVars({
  '0': '0px',
  '0.5': step(0.5),
  '1': step(1),
  '1.5': step(1.5),
  '2': step(2),
  '2.5': step(2.5),
  '3': step(3),
  '3.5': step(3.5),
  '4': step(4),
  '5': step(5),
  '6': step(6),
  '7': step(7),
  '8': step(8),
  '9': step(9),
  '10': step(10),
  '11': step(11),
  '12': step(12),
  '13': step(13),
});

// =============================================================================
// Typography Tokens — type scale
// =============================================================================
// One named step scale every text-bearing component sizes against. `defineVars`
// values are single CSS values, so size and leading are each their own var.

const typeScaleDefaults = {
  '--cl-text-xs-size': '0.75rem',
  '--cl-text-xs-leading': 'calc(1 / 0.75)',
  '--cl-text-sm-size': '0.875rem',
  '--cl-text-sm-leading': 'calc(1.25 / 0.875)',
  '--cl-text-base-size': '1rem',
  '--cl-text-base-leading': 'calc(1.5 / 1)',
  '--cl-text-lg-size': '1.125rem',
  '--cl-text-lg-leading': 'calc(1.75 / 1.125)',
  '--cl-text-xl-size': '1.25rem',
  '--cl-text-xl-leading': 'calc(1.75 / 1.25)',
  '--cl-text-2xl-size': '1.5rem',
  '--cl-text-2xl-leading': 'calc(2 / 1.5)',
} as const;

export const typeScaleVars = stylex.defineVars(typeScaleDefaults);

// =============================================================================
// Typography Tokens — font weight
// =============================================================================
// Kept separate from the step scale: weight and size vary independently.

const fontWeightDefaults = {
  '--cl-font-normal': '400',
  '--cl-font-medium': '500',
  '--cl-font-semibold': '600',
  '--cl-font-bold': '700',
} as const;

export const fontWeightVars = stylex.defineVars(fontWeightDefaults);

// =============================================================================
// Motion Tokens — duration
// =============================================================================
// Read as "how direct is this feedback": the more a change is the answer to
// something the pointer just did, the shorter it runs. `instant` is for the state
// that has to feel like contact rather than a fade — a press landing, a highlight
// appearing under the cursor, hover included; `fast` for exits and other short
// pointer-driven change; `base` for that state decaying once the pointer leaves,
// which reads better a little slower than it arrived; `slow`/`slower` for changes
// the pointer didn't
// cause directly, like a panel or overlay resolving.
//
// Durations are not gated on `prefers-reduced-motion`. That signal is about
// vestibular safety — transforms, positional change, parallax — so the gate
// belongs on the moving property at its use site, not on every duration here.

const durationDefaults = {
  '--cl-duration-instant': '0s',
  '--cl-duration-fast': '0.1s',
  '--cl-duration-base': '0.15s',
  '--cl-duration-slow': '0.25s',
  '--cl-duration-slower': '0.35s',
} as const;

export const durationVars = stylex.defineVars(durationDefaults);

// =============================================================================
// Motion Tokens — easing
// =============================================================================
// Curves are named for their role rather than their shape so a consumer can
// retarget one without the name going stale. The default is Swift Out
// (https://www.easing.dev/swift-out, from Lochie Axon's Easing Graphs):
// front-loaded, so a change departs fast, and carrying its endpoint ~2% past
// target around 85% through before settling.
//
// It belongs on properties that MOVE — transform, translate, scale, insets — where
// the overshoot is what makes motion read as physical rather than mechanical, which
// in practice means the `slow`/`slower` end of the duration scale. Color and opacity
// take plain `linear` instead: their interpolation is already perceptually
// non-uniform, so an ease on top only makes the midpoint drag, and an overshoot
// extrapolates past the target color for no gain. That is a rule about the property,
// not the duration — a transform at `fast` still wants this curve.
//
// `--cl-ease-exit` is its counterpart for things LEAVING, In Quad
// (https://www.easing.dev/in-quad). Swift Out run backwards spends 90% of its travel
// in the first three frames and then crawls, and its overshoot inverts into a wobble
// past the target — a departure has nothing to settle into, so it wants to accelerate
// away instead. Deliberately the gentlest of the in-family: an exit moves a small
// distance over few frames, so a sharper curve (In Quart, In Circ) leaves half of them
// below the threshold of visible change and reads as a stall followed by a lurch.
// Pair it with a shorter duration than the matching entrance.

const easingDefaults = {
  '--cl-ease-default': 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
  '--cl-ease-exit': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
} as const;

export const easingVars = stylex.defineVars(easingDefaults);
