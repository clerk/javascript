import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['4'],
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
  /**
   * Beside the title, `vertical-align: middle`: the caret's midpoint on the baseline plus half the
   * x-height, which centers it on the lowercase letters rather than the line box. Sized in `em`
   * through the icon's `inherit` size, so it scales with the heading; coloured through the icon's
   * own variable rather than `color`, which the icon sets itself.
   */
  caret: {
    '--_cl-icon-color': colorVars['--cl-color-foreground-secondary'],
    fontSize: '0.6em',
    marginInlineStart: '0.25em',
    verticalAlign: 'middle',
  },
  sections: {
    gap: space['10'],
    display: 'flex',
    flexDirection: 'column',
  },
});
