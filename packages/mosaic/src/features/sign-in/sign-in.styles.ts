import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  buttonStack: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  fieldStack: {
    gap: space['4'],
    display: 'grid',
  },
  footerText: {
    textAlign: 'center',
  },
  logo: {
    display: 'block',
    objectFit: 'contain',
    height: space['8'],
    maxWidth: '100%',
  },
  passkeyAction: {
    alignSelf: 'center',
  },
  providerIcon: {
    display: 'block',
    objectFit: 'contain',
    height: space['4'],
    width: space['4'],
  },
  spotlightGroup: {
    display: 'contents',
  },
  spotlightHidden: {
    display: 'none',
  },
  startPasswordHidden: {
    overflow: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
    position: 'absolute',
    height: 0,
  },
});
