import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['6'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  title: {
    display: 'block',
  },

  back: {
    font: 'inherit',
    borderRadius: radiusVars['--cl-radius-md'],
    marginInline: `calc(-1 * ${space['1']})`,
    paddingInline: space['1'],
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline',
    textAlign: 'start',
  },

  backIcon: {
    '--_cl-icon-color': colorVars['--cl-color-foreground-secondary'],
    marginInlineEnd: space['1'],
    verticalAlign: 'middle',
  },

  sections: {
    gap: space['8'],
    display: 'flex',
    flexDirection: 'column',
  },
});
