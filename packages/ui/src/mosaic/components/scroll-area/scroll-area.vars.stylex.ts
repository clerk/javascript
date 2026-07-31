import * as stylex from '@stylexjs/stylex';

// ScrollArea's public var contract. The two progress vars are the whole point of the
// component's styling API: a scroll-driven animation writes them, the default mask reads
// them, and a consumer can read them instead to drive any treatment they like.
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
  // Matched on purpose: the fade reaches full strength after you've scrolled its own height,
  // so the indicator grows in at the same rate as the content it's covering moves. They stay
  // independent knobs — a shorter range makes the fade snap in sooner without changing how
  // tall it ends up.
  '--cl-scroll-area-fade-size': '1.5rem',
  '--cl-scroll-area-fade-range': '1.5rem',
  // Width of the strip at the inline end that the fade is held back from, so a classic
  // (space-consuming) scrollbar isn't faded along with the content. Defaults to `0px`
  // because CSS cannot measure a scrollbar: the value differs per platform, per browser,
  // and on macOS it changes when a mouse is connected, so any non-zero default would be
  // wrong more often than right. Overlay scrollbars — the common case — need no inset at
  // all. Consumers targeting a known classic-scrollbar platform can set it.
  '--cl-scroll-area-scrollbar-inset': '0px',
});
