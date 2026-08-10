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
    backgroundColor: 'var(--cl-color-background)',
    borderColor: 'light-dark(var(--cl-color-border-faded), var(--cl-color-background))',
    borderRadius: 'var(--cl-radius-lg)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  providerIcon: {
    display: 'block',
    height: '20px',
    width: '20px',
  },
  root: {
    gap: space['6'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});
