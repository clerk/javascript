import * as stylex from '@stylexjs/stylex';

import { fontWeightVars, space } from '../tokens.stylex';

export const styles = stylex.create({
  status: {
    gap: space['2'],
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
  },
  details: {
    gap: space['1'],
    display: 'grid',
    justifyItems: 'start',
    overflowWrap: 'anywhere',
  },
  emphasis: {
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
});
