import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  captcha: {
    justifySelf: 'center',
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
  loading: {
    justifyItems: 'center',
    paddingBlockEnd: space['10'],
    paddingBlockStart: space['10'],
  },
  logo: {
    display: 'block',
    objectFit: 'contain',
    height: space['8'],
    maxWidth: '100%',
  },
  nameRow: {
    gap: space['4'],
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  protectCheck: {
    justifyItems: 'center',
  },
  protectCheckContainer: {
    display: 'block',
  },
  protectCheckContainerEmpty: {
    position: 'absolute',
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
  status: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  walletsLoading: {
    display: 'grid',
    justifyItems: 'center',
  },
});
