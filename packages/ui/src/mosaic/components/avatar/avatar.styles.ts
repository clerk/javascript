import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  // root — clips its parts to the shape/size; fill comes from the image or fallback
  base: {
    overflow: 'hidden',
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: 'inherit',
    fontWeight: typeScaleVars['--cl-text-label-weight'],
    justifyContent: 'center',
    lineHeight: 1,
    position: 'relative',
    userSelect: 'none',
    verticalAlign: 'middle',
  },

  // shape — square uses a fixed 6px radius for now; circle rounds fully
  shapeCircle: { borderRadius: radiusVars['--cl-radius-full'] },
  shapeSquare: { borderRadius: '6px' },

  // size — square box; fallback text scales with the box via inherited font-size
  sizeXs: { fontSize: '0.625rem', height: space['6'], width: space['6'] },
  sizeSm: { fontSize: '0.75rem', height: space['8'], width: space['8'] },
  sizeMd: { fontSize: '0.875rem', height: space['10'], width: space['10'] },
  sizeLg: { fontSize: '1rem', height: space['12'], width: space['12'] },

  // image fills the clipped box
  image: {
    aspectRatio: '1 / 1',
    display: 'block',
    objectFit: 'cover',
    height: '100%',
    width: '100%',
  },

  // fallback fills the box, centering its content and inheriting the sized font
  fallback: {
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-muted'],
    color: colorVars['--cl-color-muted-foreground'],
    display: 'flex',
    fontSize: 'inherit',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
});
