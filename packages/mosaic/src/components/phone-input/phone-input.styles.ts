import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, shadowVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  triggerStart: {
    paddingInlineStart: 'max(0px, calc(var(--_cl-input-group-inset) - 1px))',
  },
  trigger: {
    '--_cl-icon-color': colorVars['--cl-color-foreground-secondary'],
    borderRadius: 'max(0px, calc(var(--_cl-input-group-radius) - var(--_cl-input-group-inset)))',
    borderWidth: 0,
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    outlineOffset: { default: null, ':focus-visible': 0 },
    paddingInlineEnd: 0,
    paddingInlineStart: space['1.5'],
    userSelect: 'none',
    height: 'calc(var(--_cl-input-group-height) - 2 * var(--_cl-input-group-inset))',
  },
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
    fontSize: typeScaleVars['--cl-text-xs-size'],
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
    color: colorVars['--cl-color-foreground'],
    fontVariantNumeric: 'tabular-nums',
    paddingInlineEnd: 0,
    paddingInlineStart: space['2'],
  },
  control: {
    fontVariantNumeric: 'tabular-nums',
    paddingInlineStart: space['1.5'],
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
