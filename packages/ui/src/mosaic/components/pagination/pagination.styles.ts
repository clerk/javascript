import * as stylex from '@stylexjs/stylex';

import { colorVars, space, typeScaleVars } from '../../tokens.stylex';

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
      default: colorVars['--cl-color-foreground-secondary'],
      ':where([aria-current="page"])': colorVars['--cl-color-foreground'],
    },
  },
  ellipsis: {
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'inline-flex',
    justifyContent: 'center',
    height: space['7'],
    width: space['7'],
  },
  pageSize: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
  },
  pageSizeOption: {
    paddingBlock: 0,
    paddingInline: space['2'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    minHeight: space['7'],
  },
});
