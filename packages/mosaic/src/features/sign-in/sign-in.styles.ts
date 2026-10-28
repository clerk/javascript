import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  socialBlock: {
    gap: space['2'],
    display: 'grid',
  },
  socialIcons: {
    gap: space['2'],
    display: 'grid',
    gridAutoColumns: 'minmax(0, 1fr)',
    gridAutoFlow: 'column',
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
  forgotPassword: {
    alignSelf: 'start',
    justifySelf: 'start',
  },
  footerText: {
    textAlign: 'center',
  },
});
