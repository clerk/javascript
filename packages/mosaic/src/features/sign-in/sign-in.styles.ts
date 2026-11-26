import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  actionGroups: {
    gap: space['2'],
    display: 'grid',
  },
  addressLabel: {
    gap: space['2'],
    alignItems: 'center',
    display: 'inline-flex',
  },
  buttonStack: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  fastOptions: {
    gap: space['2'],
    display: 'grid',
  },
  fieldStack: {
    gap: space['4'],
    display: 'grid',
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
