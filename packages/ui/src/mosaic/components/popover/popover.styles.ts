import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars } from '../../tokens.stylex';

// The size the popup enters from and leaves to. Published to descendants through
// `--_cl-surface-scale` as well as applied here, so the surface inside can cancel it out of its
// own radius — the two have to be the same number or the correction is wrong.
const ENTER_SCALE = 0.94;

export const styles = stylex.create({
  // Floating wrapper. Positioning styles are applied inline by the headless
  // positioner; this only clears the focus outline the FloatingFocusManager places
  // here. No z-index: portalled siblings stack by DOM order, so a menu opened from
  // inside a popover paints above it.
  positioner: {
    outline: 'none',
  },

  // The floating box, deliberately chrome-free: background, border, radius,
  // shadow and padding belong to the surface rendered inside (e.g. `Card`), so
  // the two never both paint a border. This owns only what it means to float —
  // viewport clamps and the enter/exit transition. A single `width: 100%` child
  // stretches to the size below via the column flex box.
  popup: {
    // `scale` below, republished to whatever paints inside. The popup is chrome-free by
    // design, so the radius that visibly drifts under that scale belongs to a descendant
    // (`Card`), which cannot see its ancestor's scale — it reads this instead and divides it
    // back out. Transitioned alongside `scale` so the two stay in lockstep; see
    // `surface.vars.stylex.ts` for why the `@property` registration is what makes that work.
    '--_cl-surface-scale': {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': ENTER_SCALE,
      '@media (prefers-reduced-motion: reduce)': {
        default: 1,
        ':where([data-starting-style], [data-ending-style])': 1,
      },
    },
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
    // The standalone `scale` property rather than `transform: scale(…)`, so a consumer's own
    // `transform` composes with it instead of overwriting it. `transform-origin` applies to the
    // individual transform properties too, so the origin below governs this unchanged.
    //
    // Reduced motion has to drop the scale itself, not just its transition. Dropping it
    // from `transitionProperty` alone leaves the value change, which then applies
    // instantly — invisible entering (it happens at `opacity: 0`) but a hard snap to 94%
    // before the fade on the way out.
    scale: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': ENTER_SCALE,
      // Restated inside the media query rather than left to a bare sibling key: both
      // would otherwise compile to the same specificity and the tiebreak would be source
      // order, which `@stylexjs/sort-keys` reorders on autofix.
      '@media (prefers-reduced-motion: reduce)': {
        default: 1,
        ':where([data-starting-style], [data-ending-style])': 1,
      },
    },
    // Scale about the trigger's center, not the popup's, so the popup travels out of the
    // trigger as it grows. The positioner sets this per position update and it inherits
    // down; a keyword origin would drift off the trigger once `shift()` or `flip()` moves
    // the popup. Falls back to `center` for the first frame, which is still `opacity: 0`.
    transformOrigin: 'var(--cl-anchor-origin, center)',
    // The exit is shorter than the entrance: an arrival earns a moment to settle, a
    // dismissal is an acknowledgement and wants to be out of the way.
    //
    // On the way in the fade finishes first (positional, so `fast` is opacity and `base`
    // is the scale). It lands opaque just as the scale reaches full size, leaving the
    // settle to play at full strength instead of through a fade — a popup that is still
    // arriving while it moves reads as washed out. Leaving is the reverse case and wants
    // them to land together, so the exit keeps one duration for all of them.
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    // Enter/exit transition. The headless popup sets `data-starting-style` on the
    // entering frame and `data-ending-style` while exiting — both are the element's
    // OWN attributes. A bare `[data-*]` key is rejected by StyleX (conditional keys
    // must start with `:` or `@`), so wrap it in `:where(...)`, a valid pseudo-class
    // string that targets the same element. `stylex.when.*` covers ancestor/sibling
    // state; this covers self-state.
    //
    // Reduced motion drops the scale (and the factor published from it) from the list
    // rather than killing the whole transition: the vestibular concern is the movement, so
    // the gate belongs on the moving property and the fade survives. The duration is never
    // gated.
    transitionProperty: {
      default: 'opacity, scale, --_cl-surface-scale',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    // Positional, in the order of `transitionProperty`. Opacity takes `linear` —
    // its interpolation is already perceptually non-uniform, and the overshoot in
    // `--cl-ease-default` would extrapolate past the target for no gain. The scale
    // is what moves, so it gets the overshoot on the way in and accelerates away on
    // the way out; running the entrance curve backwards stalls the exit for most of
    // its duration and turns the overshoot into a wobble past the target. The published
    // factor repeats the scale's curve exactly — a descendant's correction is only right
    // while the two are equal.
    transitionTimingFunction: {
      default: `linear, ${easingVars['--cl-ease-default']}, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': `linear, ${easingVars['--cl-ease-exit']}, ${easingVars['--cl-ease-exit']}`,
    },
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
