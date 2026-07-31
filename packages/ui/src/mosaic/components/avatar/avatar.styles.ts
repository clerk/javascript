import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  // root — clips its parts to the shape/size; fill comes from the image or fallback
  base: {
    overflow: 'hidden',
    alignItems: 'center',
    aspectRatio: '1 / 1',
    boxSizing: 'border-box',
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: 'inherit',
    fontWeight: fontWeightVars['--cl-font-medium'],
    justifyContent: 'center',
    lineHeight: 1,
    position: 'relative',
    userSelect: 'none',
    verticalAlign: 'middle',
  },

  // image fills the clipped box. It carries the root's radius rather than leaning on the clip
  // alone, so a part that paints its own fill rounds off cleanly instead of showing a corner.
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
    fontSize: 'inherit',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
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
