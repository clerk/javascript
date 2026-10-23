import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['6'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  title: {
    display: 'block',
  },

  sections: {
    gap: space['8'],
    display: 'flex',
    flexDirection: 'column',
  },
});
