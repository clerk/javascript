import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, space, typeScaleVars } from '../../tokens.stylex';

export const entity = stylex.create({
  base: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    minWidth: 0,
  },
});

export const media = stylex.create({
  base: {
    alignItems: 'center',
    aspectRatio: '1/1',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    width: space['9.5'],
  },
});

export const content = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
});

export const label = stylex.create({
  base: {
    gap: space['2'],
    alignItems: 'center',
    color: colorVars['--cl-color-foreground'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    minWidth: 0,
  },
});

export const description = stylex.create({
  base: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
});
