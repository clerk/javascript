import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['6'],
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    display: 'block',
  },

  /**
   * The headline as a button: the heading's own type, inline so the caret can align to its
   * x-height, with a little room around it for the focus ring.
   */
  navTrigger: {
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
  // `vertical-align: middle` centers the caret on the title's x-height rather than the line box.
  caret: {
    '--_cl-icon-color': colorVars['--cl-color-foreground-secondary'],
    marginInlineStart: space['1'],
    verticalAlign: 'middle',
  },
  sections: {
    gap: space['8'],
    display: 'flex',
    flexDirection: 'column',
  },
});
