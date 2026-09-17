import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const list = stylex.create({
  base: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-lg'],
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: space['3'],
    backgroundColor: colorVars['--cl-color-background-subtle'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});

export const item = stylex.create({
  base: {
    paddingBlock: space['3'],
    alignItems: 'baseline',
    columnGap: space['6'],
    display: 'flex',
    justifyContent: 'space-between',
  },
  divided: {
    borderBlockEndColor: colorVars['--cl-color-border'],
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: {
      default: '1px',
      ':last-child': 0,
    },
  },
});

export const label = stylex.create({
  base: {
    color: colorVars['--cl-color-foreground'],
    flexShrink: 0,
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
});

export const value = stylex.create({
  base: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textAlign: 'end',
    minWidth: 0,
  },
});
