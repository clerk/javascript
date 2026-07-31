import * as stylex from '@stylexjs/stylex';

// ScrollArea's per-element runtime output: vars a consumer READS, never sets. The scroll-driven
// animations write them on every scrolling element, so a `:root` value would simply be
// overwritten. That is why these stay component-named while the fade's actual knobs live in
// `tokens.stylex.ts` as the global `--cl-scroll-fade-*` family — those are set, these are read.
//
// They are `stylex.types.number` rather than plain strings so StyleX emits an `@property`
// registration for each. That registration is load-bearing twice over:
//
//   1. An unregistered custom property animates DISCRETELY — it would flip at 50% of the
//      scroll range instead of tracking it. Registering `syntax: "<number>"` is what makes
//      the value interpolate.
//   2. `initial-value: 0` is what hides both indicators when the viewport isn't scrollable.
//      A scroll timeline with no scrollable overflow is inactive, so neither animation
//      applies and both vars fall back to 0 — which the mask reads as "no fade". The
//      `--can-scroll` space-toggle hack the well-known demos use is unnecessary here,
//      because our resting state is already the hidden one.
export const scrollAreaVars = stylex.defineVars({
  '--cl-scroll-area-progress-start': stylex.types.number(0),
  '--cl-scroll-area-progress-end': stylex.types.number(0),
});
