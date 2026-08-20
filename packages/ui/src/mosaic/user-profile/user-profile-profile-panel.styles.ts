import * as stylex from '@stylexjs/stylex';

import { space } from '../tokens.stylex';

export const styles = stylex.create({
  contactValue: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
  },
  providerMedia: {
    borderColor: 'light-dark(var(--cl-color-border-faded), var(--cl-color-background))',
    borderRadius: 'var(--cl-radius-lg)',
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: 'var(--cl-color-background)',
  },
  providerIcon: {
    display: 'block',
    height: space['5'],
    width: space['5'],
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
  },
});
