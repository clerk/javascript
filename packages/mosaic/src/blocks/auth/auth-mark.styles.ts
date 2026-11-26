import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

const markSize = space['12'];
const logoSize = space['10'];

export const markStyles = stylex.create({
  root: {
    placeItems: 'center',
    display: 'inline-grid',
    gridTemplateColumns: 'minmax(0, auto)',
    maxWidth: '100%',
    minHeight: markSize,
    minWidth: markSize,
  },
  logo: {
    gridColumn: '1',
    gridRow: '1',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-surface'],
    display: 'flex',
    height: logoSize,
    maxWidth: '100%',
    minWidth: 0,
  },
  logoImage: {
    display: 'block',
    objectFit: 'contain',
    height: '100%',
    maxWidth: '100%',
  },
});

export const logoShapes = stylex.create({
  square: {},
  wide: {},
});
