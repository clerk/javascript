import * as stylex from '@stylexjs/stylex';

// The popup's live enter/exit scale. The selected row counter-scales off it, so `1 / var()` is
// exact on every frame. Typed so it interpolates and inherits, which StyleX hardcodes for these.
export const selectVars = stylex.defineVars({
  '--_cl-select-popup-scale': stylex.types.number(1),
});
