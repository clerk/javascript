import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars } from '../../tokens.stylex';

export const styles = stylex.create({
  // Floating wrapper. Positioning styles are applied inline by the headless
  // positioner; this only owns stacking and clears the focus outline the
  // FloatingFocusManager places here.
  positioner: {
    outline: 'none',
    zIndex: 50,
  },

  // The floating box, deliberately chrome-free: background, border, radius,
  // shadow and padding belong to the surface rendered inside (e.g. `Card`), so
  // the two never both paint a border. This owns only what it means to float —
  // viewport clamps and the enter/exit transition. A single `width: 100%` child
  // stretches to the size below via the column flex box.
  popup: {
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    // A popover holds prose — an email, an org slug, an API key — and a long
    // unbroken string would otherwise push past the width clamp.
    overflowWrap: 'anywhere',
    transform: {
      default: 'scale(1)',
      ':where([data-starting-style], [data-ending-style])': 'scale(0.98)',
    },
    transitionDuration: durationVars['--cl-duration-base'],
    // Enter/exit transition. The headless popup sets `data-starting-style` on the
    // entering frame and `data-ending-style` while exiting — both are the element's
    // OWN attributes. A bare `[data-*]` key is rejected by StyleX (conditional keys
    // must start with `:` or `@`), so wrap it in `:where(...)`, a valid pseudo-class
    // string that targets the same element. `stylex.when.*` covers ancestor/sibling
    // state; this covers self-state.
    //
    // Reduced motion drops `transform` from the list rather than killing the whole
    // transition: the vestibular concern is the movement, so the gate belongs on the
    // moving property and the fade survives. The duration is never gated.
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    // Positional, in the order of `transitionProperty`. Opacity takes `linear` —
    // its interpolation is already perceptually non-uniform, and the overshoot in
    // `--cl-ease-default` would extrapolate past the target for no gain. The scale
    // is what moves, so it gets the overshoot.
    transitionTimingFunction: `linear, ${easingVars['--cl-ease-default']}`,
    maxHeight: 'min(80dvh, 36rem)',
    maxWidth: 'calc(100vw - 2rem)',
    minHeight: 0,
  },
});

// `md` reproduces the width the legacy `PopoverCard` uses (`theme.sizes.$94`), so
// popovers migrating onto Mosaic keep their current footprint.
export const sizes = stylex.create({
  sm: { width: 'min(18rem, calc(100vw - 2rem))' },
  md: { width: 'min(23.5rem, calc(100vw - 2rem))' },
  lg: { width: 'min(26rem, calc(100vw - 2rem))' },
});
