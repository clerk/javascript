import * as stylex from '@stylexjs/stylex';

import { radiusVars, space } from '../tokens.stylex';

export const mediaSizes = stylex.create({
  xs: {
    '--_cl-media-radius': radiusVars['--cl-radius-sm'],
    height: space['6'],
    width: space['6'],
  },
  sm: {
    '--_cl-media-radius': radiusVars['--cl-radius-md'],
    height: space['8'],
    width: space['8'],
  },
  md: {
    '--_cl-media-radius': radiusVars['--cl-radius-md'],
    height: space['9.5'],
    width: space['9.5'],
  },
  lg: {
    '--_cl-media-radius': radiusVars['--cl-radius-lg'],
    height: space['12'],
    width: space['12'],
  },
});
