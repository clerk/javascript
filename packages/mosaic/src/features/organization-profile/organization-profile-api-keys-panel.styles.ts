import * as stylex from '@stylexjs/stylex';

import { fontWeightVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  toolbar: {
    gap: space['4'],
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  search: { maxWidth: '100%', width: '17rem' },
  name: { fontWeight: fontWeightVars['--cl-font-medium'] },
  dateCell: { whiteSpace: 'nowrap' },
  metadata: { gap: space['0.5'], display: 'flex', flexDirection: 'column', minWidth: '25ch' },
});
