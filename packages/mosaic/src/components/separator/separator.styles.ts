import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  plain: {
    backgroundColor: colorVars['--cl-color-border'],
    height: '1px',
    width: '100%',
  },
  labelled: {
    gap: space['4'],
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'flex',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    width: '100%',
    '::after': {
      backgroundColor: colorVars['--cl-color-border'],
      content: '""',
      flexGrow: 1,
      height: '1px',
    },
    '::before': {
      backgroundColor: colorVars['--cl-color-border'],
      content: '""',
      flexGrow: 1,
      height: '1px',
    },
  },
});
