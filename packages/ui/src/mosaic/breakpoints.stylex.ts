import * as stylex from '@stylexjs/stylex';

/**
 * The widths the surfaces query — a container's inline size, never the window's, so a surface in
 * a narrow slot collapses the way one on a phone does. Compile-time constants rather than custom
 * properties: an at-rule prelude cannot read `var()`, and `defineConsts` inlines here.
 */
export const breakpoints = stylex.defineConsts({
  /** Below this the surface is a phone's: a `profile` dialog fills the screen, the Profile's navigation is a sheet. */
  phone: '48rem',
  /** From here a `profile` dialog stops growing with the viewport. */
  wide: '90rem',
});
