import * as stylex from '@stylexjs/stylex';

import { space } from '../../../tokens.stylex';

export const styles = stylex.create({
  sections: {
    gap: space['8'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});
