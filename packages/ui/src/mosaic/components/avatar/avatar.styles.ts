import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space } from '../../tokens.stylex';

// Fades the fallback's neutral fill in and out. That fill is the only thing it paints — the
// content it is handed is hidden — so the whole element's opacity is the fill's. Timed to
// match `skeleton.tsx`'s pulse, so the two generations of placeholder read as one thing.
const pulse = stylex.keyframes({
  '50%': { opacity: 0.5 },
});

export const styles = stylex.create({
  // root — clips its parts to the shape/size; fill comes from the image or fallback
  base: {
    overflow: 'hidden',
    alignItems: 'center',
    aspectRatio: '1 / 1',
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    justifyContent: 'center',
    lineHeight: 1,
    position: 'relative',
    userSelect: 'none',
    verticalAlign: 'middle',
  },

  // Carries the root's radius rather than leaning on the clip alone, so a part that paints its own
  // fill rounds off cleanly instead of showing a corner.
  image: {
    borderRadius: 'inherit',
    aspectRatio: '1 / 1',
    display: 'block',
    objectFit: 'cover',
    position: 'absolute',
    height: '100%',
    width: '100%',
  },

  // fallback fills the box, centering its content and inheriting the sized font
  fallback: {
    borderRadius: 'inherit',
    alignItems: 'center',
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
    color: colorVars['--cl-color-neutral'],
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },

  // The fallback is a blank placeholder rather than a label: whatever it is handed stays in the
  // box but is never painted, so someone without a picture gets a plain mark instead of two
  // letters. `visibility` rather than a transparent color or `aria-hidden`, because it is the one
  // property that takes the content out of the page, the accessibility tree, and the tab order at
  // once — and, unlike `inert`, leaves hit-testing alone, so a click still reaches the row this
  // sits in. A consumer who wants the initials back overrides this one slot.
  fallbackContent: {
    visibility: 'hidden',
  },

  // Only while an image is on its way. Someone who has no picture is not waiting on anything,
  // so their mark holds still rather than pulsing for as long as it is on screen.
  fallbackPending: {
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationName: {
      default: pulse,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
});

// shape — square shares its radius with Button; circle rounds fully
export const shapes = stylex.create({
  circle: { borderRadius: radiusVars['--cl-radius-full'] },
  square: { borderRadius: radiusVars['--cl-radius-md'] },
});

// size — square box; fallback text scales with the box via inherited font-size
export const sizes = stylex.create({
  xs: { fontSize: '0.625rem', height: space['5'], width: space['5'] },
  sm: { fontSize: '0.75rem', height: space['7'], width: space['7'] },
  md: { fontSize: '0.875rem', height: space['9'], width: space['9'] },
  lg: { fontSize: '1rem', height: space['12'], width: space['12'] },
  fit: { fontSize: '0.75rem', height: '100%', width: '100%' },
});
