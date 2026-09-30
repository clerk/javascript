import * as stylex from '@stylexjs/stylex';

import { space } from '../tokens.stylex';

export const styles = stylex.create({
  root: {
    padding: space['6'],
    alignItems: 'center',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
});
