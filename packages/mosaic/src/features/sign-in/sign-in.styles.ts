import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  logo: {
    display: 'block',
    objectFit: 'contain',
    height: space['8'],
    maxWidth: '100%',
  },
  providerIcon: {
    display: 'block',
    objectFit: 'contain',
    height: space['4'],
    width: space['4'],
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
  identity: {
    gap: space['1'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minWidth: 0,
  },
  identityText: {
    minWidth: 0,
  },
  fieldStack: {
    gap: space['4'],
    display: 'grid',
  },
  nameRow: {
    gap: space['4'],
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  captcha: {
    justifySelf: 'center',
  },
  spotlightGroup: {
    display: 'contents',
  },
  spotlightHidden: {
    display: 'none',
  },
  passkeyAction: {
    alignSelf: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});
