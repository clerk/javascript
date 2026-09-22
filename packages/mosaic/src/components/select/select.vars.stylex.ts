import * as stylex from '@stylexjs/stylex';

// The popup's live enter/exit scale. The selected row derives its own counter-scale from this
// rather than transitioning one of its own: two independent transitions only agree at the ends,
// where `1 / var()` off the inherited value is the exact reciprocal on every frame, under any
// easing. Typed so it interpolates at all, and so it inherits, which StyleX hardcodes for these.
export const selectVars = stylex.defineVars({
  '--_cl-select-popup-scale': stylex.types.number(1),
});
