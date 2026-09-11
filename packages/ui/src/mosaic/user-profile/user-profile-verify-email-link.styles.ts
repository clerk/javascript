import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space } from '../tokens.stylex';

export const styles = stylex.create({
  content: {
    gap: space['2.5'],
  },
  status: {
    gap: space['2.5'],
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
  },
  details: {
    display: 'grid',
    justifyItems: 'start',
    overflowWrap: 'anywhere',
  },
  emphasis: {
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  emailAddress: {
    color: colorVars['--cl-color-primary'],
  },
});
