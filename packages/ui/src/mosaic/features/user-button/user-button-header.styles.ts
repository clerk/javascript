import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    padding: space['3'],
    gap: space['3'],
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },

  title: {
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },

  description: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },

  actions: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
  },

  actionsStacked: {
    display: 'grid',
    flexBasis: '100%',
    gridAutoColumns: 'minmax(0, 1fr)',
    gridAutoFlow: 'column',
  },
});
