import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../tokens.stylex';

export const styles = stylex.create({
  contactValue: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
  },
  providerIcon: {
    display: 'block',
    height: space['5'],
    width: space['5'],
  },
  providerMedia: {
    borderColor: 'light-dark(var(--cl-color-border-faded), var(--cl-color-background))',
    borderRadius: radiusVars['--cl-radius-lg'],
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: colorVars['--cl-color-background'],
  },
  root: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
  },
  sections: {
    gap: space['8'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});
