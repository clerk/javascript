import * as stylex from '@stylexjs/stylex';

import { colorVars } from '../../tokens.stylex';

export const styles = stylex.create({
  base: {
    borderColor: 'transparent',
    borderRadius: 'var(--_cl-media-radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    alignItems: 'center',
    aspectRatio: '1 / 1',
    backgroundColor: 'transparent',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
  },
  bordered: {
    borderColor: colorVars['--cl-color-border'],
  },
  filled: {
    backgroundColor: colorVars['--cl-color-neutral-alpha-100'],
  },
});
