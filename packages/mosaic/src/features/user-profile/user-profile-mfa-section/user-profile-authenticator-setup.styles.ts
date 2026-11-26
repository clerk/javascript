import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../../tokens.stylex';

export const styles = stylex.create({
  content: {
    paddingBlockEnd: 0,
    paddingBlockStart: space['3'],
  },
  setup: {
    gap: space['3'],
    display: 'grid',
  },
  panels: {
    display: 'grid',
  },
  qrCode: {
    display: 'flex',
    justifyContent: 'center',
  },
  qrTile: {
    padding: space['2'],
    borderRadius: radiusVars['--cl-radius-lg'],
    backgroundColor: '#fff',
    boxShadow: `inset 0 0 0 1px ${colorVars['--cl-color-border-subtle']}`,
    display: 'flex',
  },
  setupKey: {
    gap: space['4'],
    display: 'grid',
  },
});
