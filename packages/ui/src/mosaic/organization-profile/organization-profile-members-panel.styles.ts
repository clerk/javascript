import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../tokens.stylex';

export const styles = stylex.create({
  filterButton: {
    flexShrink: 0,
  },
  root: {
    gap: space['6'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  search: {
    paddingInlineStart: space['8'],
  },
  searchGroup: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
  },
  searchIcon: {
    color: colorVars['--cl-color-neutral-faded'],
    insetInlineStart: space['3'],
    pointerEvents: 'none',
    position: 'absolute',
    transform: 'translateY(-50%)',
    top: '50%',
  },
  searchWrapper: {
    position: 'relative',
    width: '17rem',
  },
  toolbar: {
    gap: space['4'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
});
