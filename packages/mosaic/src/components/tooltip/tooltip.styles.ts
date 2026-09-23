import * as stylex from '@stylexjs/stylex';

import { layerVars } from '../../tokens.stylex';

export const styles = stylex.create({
  positioner: {
    outline: 'none',
    zIndex: layerVars['--cl-z-index-overlay'],
  },
});
