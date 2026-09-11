import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['4'],
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  controls: {
    gap: space['1'],
    alignItems: 'center',
    display: 'flex',
  },
  page: {
    color: {
      default: colorVars['--cl-color-neutral-faded'],
      ':where([aria-current="page"])': colorVars['--cl-color-neutral-foreground'],
    },
  },
  ellipsis: {
    alignItems: 'center',
    color: colorVars['--cl-color-neutral-faded'],
    display: 'inline-flex',
    justifyContent: 'center',
  },
  pageSize: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
  },
});

export const ellipsisSizes = stylex.create({
  sm: { height: space['6'], width: space['6'] },
  md: { height: space['7'], width: space['7'] },
  lg: { height: space['8'], width: space['8'] },
});
