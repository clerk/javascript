import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  secret: {
    flex: 1,
    minWidth: 0,
    overflow: 'clip',
    paddingInline: space['3'],
  },
});
