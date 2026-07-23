import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  base: {
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-muted'],
    boxSizing: 'border-box',
    color: colorVars['--cl-color-muted-foreground'],
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: 'inherit',
    fontWeight: typeScaleVars['--cl-text-label-weight'],
    justifyContent: 'center',
    lineHeight: 1,
    position: 'relative',
    userSelect: 'none',
  },

  // shape — square uses a fixed 6px radius for now; circle rounds fully
  shapeCircle: { borderRadius: radiusVars['--cl-radius-full'] },
  shapeSquare: { borderRadius: '6px' },

  // size — square box; fallback text scales with the box
  sizeXs: { fontSize: '0.625rem', height: space['6'], width: space['6'] },
  sizeSm: { fontSize: '0.75rem', height: space['8'], width: space['8'] },
  sizeMd: { fontSize: '0.875rem', height: space['10'], width: space['10'] },
  sizeLg: { fontSize: '1rem', height: space['12'], width: space['12'] },

  // image fills the clipped box
  image: {
    display: 'block',
    objectFit: 'cover',
    height: '100%',
    width: '100%',
  },
});
