import * as stylex from '@stylexjs/stylex';

import { radiusVars } from '../../tokens.stylex';

export const styles = stylex.create({
  frame: {
    userSelect: 'none',
    visibility: 'hidden',
    maxWidth: '100%',
    width: 'fit-content',
  },
  text: {
    overflow: 'hidden',
    display: 'block',
    whiteSpace: 'nowrap',
  },
  block: {
    overflow: 'hidden',
    display: 'flex',
    position: 'relative',
  },
});

export const shapes = stylex.create({
  rounded: { borderRadius: radiusVars['--cl-radius-md'] },
  pill: { borderRadius: radiusVars['--cl-radius-full'] },
  square: { borderRadius: radiusVars['--cl-radius-none'] },
});

export const size = stylex.create({
  fixed: (width: string, height: string) => ({ height, width }),
});
