import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['1'],
    paddingBlock: space['10'],
    paddingInline: space['6'],
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
  },
  icon: {
    display: 'inline-flex',
    marginBlockEnd: space['1'],
  },
  label: {
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  description: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    maxWidth: '32ch',
  },
  actions: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBlockStart: space['2'],
  },
});
