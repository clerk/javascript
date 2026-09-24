import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  toolbar: {
    gap: space['4'],
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  search: { maxWidth: '100%', width: '17rem' },
  dateCell: { whiteSpace: 'nowrap' },
});
