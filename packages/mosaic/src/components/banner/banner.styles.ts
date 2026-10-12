import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    borderRadius: radiusVars['--cl-radius-lg'],
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: space['1.5'],
    paddingBlock: space['2'],
    paddingInline: space['3'],
    alignItems: 'flex-start',
    color: colorVars['--cl-color-foreground'],
    display: 'flex',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  icon: {
    flexShrink: 0,
    height: '1lh',
  },
  content: {
    gap: space['1'],
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  label: {
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  description: {
    color: colorVars['--cl-color-foreground-secondary'],
    textWrap: 'pretty',
  },
});

export const rootColors = stylex.create({
  neutral: {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: colorVars['--cl-color-neutral-alpha-100'],
  },
  warning: {
    borderColor: colorVars['--cl-color-warning-border'],
    backgroundColor: colorVars['--cl-color-warning-subtle'],
  },
  negative: {
    borderColor: colorVars['--cl-color-negative-border'],
    backgroundColor: colorVars['--cl-color-negative-subtle'],
  },
  positive: {
    borderColor: colorVars['--cl-color-positive-border'],
    backgroundColor: colorVars['--cl-color-positive-subtle'],
  },
});

export const iconColors = stylex.create({
  neutral: { color: colorVars['--cl-color-foreground-secondary'] },
  warning: { color: colorVars['--cl-color-warning'] },
  negative: { color: colorVars['--cl-color-negative'] },
  positive: { color: colorVars['--cl-color-positive'] },
});
