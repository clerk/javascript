import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space } from '../../tokens.stylex';

// Timed to match `skeleton.tsx`'s pulse, so the two generations of placeholder read as one thing.
const pulse = stylex.keyframes({
  '50%': { opacity: 0.5 },
});

export const styles = stylex.create({
  // root — sizes and positions its parts; fill comes from the image or fallback
  base: {
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

  interactive: {
    // An avatar used as a native button has no border shrinking the avatar inside it.
    borderWidth: 0,
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}`,
    },
    cursor: {
      default: 'pointer',
      ':is(:disabled, [aria-disabled="true"])': 'not-allowed',
    },
    outlineOffset: '2px',
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

  // `visibility` over `aria-hidden` or `inert`: it clears the page, the accessibility tree, and the
  // tab order at once, and still lets a click through to the row this sits in.
  fallbackContent: {
    visibility: 'hidden',
  },

  fallbackPending: {
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationName: {
      default: pulse,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },

  icon: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-full'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-card'],
    boxSizing: 'border-box',
    display: 'flex',
    insetBlockEnd: `calc(${space['2']} * -1)`,
    insetInlineStart: `calc(${space['1']} * -1)`,
    justifyContent: 'center',
    position: 'absolute',
    height: space['6'],
    width: space['6'],
  },
});

// shape — square shares its radius with Button; circle rounds fully
export const shapes = stylex.create({
  circle: { borderRadius: radiusVars['--cl-radius-full'] },
  square: { borderRadius: radiusVars['--cl-radius-md'] },
});

// size — square box; font-size is ~0.4x the box, the ceiling at which two initials still clear
// the circle's clip.
export const sizes = stylex.create({
  xs: { fontSize: '0.5rem', height: space['5'], width: space['5'] },
  sm: { fontSize: '0.6875rem', height: space['7'], width: space['7'] },
  md: { fontSize: '0.875rem', height: space['9'], width: space['9'] },
  lg: { fontSize: '1rem', height: space['12'], width: space['12'] },
  fit: { fontSize: '0.75rem', height: '100%', width: '100%' },
});
