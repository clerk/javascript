import * as stylex from '@stylexjs/stylex';

// Registered so the fade's stop interpolates; an unregistered var would snap at the midpoint.
export const cardBannerVars = stylex.defineVars({
  '--_cl-card-banner-fade': stylex.types.length('0px'),
});
