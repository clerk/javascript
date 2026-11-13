import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  buttonStack: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  passkeyAction: {
    alignSelf: 'center',
  },
  startPasswordHidden: {
    overflow: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
    position: 'absolute',
    height: 0,
  },
});
