import * as stylex from '@stylexjs/stylex';

// The popover's floating box is `floating.popup` unchanged — chrome-free by design,
// since the surface comes from whatever is rendered inside (usually a `Card`). Only
// the width scale is popover-specific.
//
// `md` reproduces the width the legacy `PopoverCard` uses (`theme.sizes.$94`), so
// popovers migrating onto Mosaic keep their current footprint.
// Kept out of `floating.styles.ts` on purpose: this is a content decision, not a
// floating one. A popover holds prose — an email, an org slug, an API key — and a
// long unbroken string would otherwise push past the width clamp. A menu wants the
// opposite for its labels, so it does not inherit this.
export const popup = stylex.create({
  base: {
    overflowWrap: 'anywhere',
  },
});

export const sizes = stylex.create({
  sm: { width: 'min(18rem, calc(100vw - 2rem))' },
  md: { width: 'min(23.5rem, calc(100vw - 2rem))' },
  lg: { width: 'min(26rem, calc(100vw - 2rem))' },
});
