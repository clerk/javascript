import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, shadowVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  triggerContent: {
    gap: space['0.5'],
    alignItems: 'center',
    display: 'flex',
  },
  flag: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: 1,
  },
  triggerFlag: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    fontSize: space['4'],
    justifyContent: 'center',
    height: space['4'],
    width: space['4'],
  },
  divider: {
    backgroundColor: colorVars['--cl-color-border'],
    flexShrink: 0,
    height: space['3.5'],
    width: '1px',
  },
  prefix: {
    gap: space['2'],
    color: colorVars['--cl-color-brand'],
    fontVariantNumeric: 'tabular-nums',
    paddingInlineEnd: 0,
    paddingInlineStart: space['2'],
  },
  control: {
    fontVariantNumeric: 'tabular-nums',
    paddingInlineStart: space['2'],
  },
  popup: {
    borderRadius: radiusVars['--cl-radius-lg'],
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-background'],
    boxShadow: shadowVars['--cl-shadow-md'],
    color: colorVars['--cl-color-foreground'],
  },
  countrySearchContainer: {
    paddingInline: space['2'],
    flexShrink: 0,
    paddingBlockEnd: space['1'],
    paddingBlockStart: space['2'],
  },
  optionName: {
    overflow: 'hidden',
    flexGrow: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  optionCode: {
    color: colorVars['--cl-color-foreground-secondary'],
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  indicatorSlot: {
    display: 'flex',
    flexShrink: 0,
    width: space['3'],
  },
});
