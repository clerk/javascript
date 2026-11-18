import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  captcha: {
    justifySelf: 'center',
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
