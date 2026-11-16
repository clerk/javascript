import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  buttonStack: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  divider: {
    gap: space['4'],
    alignItems: 'center',
    display: 'flex',
  },
  dividerLine: {
    backgroundColor: colorVars['--cl-color-border'],
    flexGrow: 1,
    height: '1px',
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
