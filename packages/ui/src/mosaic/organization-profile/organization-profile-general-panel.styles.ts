import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../tokens.stylex';

export const styles = stylex.create({
  logo: {
    borderRadius: radiusVars['--cl-radius-lg'],
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card-foreground'],
    color: colorVars['--cl-color-card'],
  },
  logoImage: {
    display: 'block',
    objectFit: 'cover',
    height: '100%',
    width: '100%',
  },
  root: {
    gap: space['8'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  sections: {
    gap: space['8'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});
