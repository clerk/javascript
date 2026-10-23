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
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    fontSize: typeScaleVars['--cl-text-xs-size'],
    justifyContent: 'center',
    lineHeight: 1,
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
  countrySearchRow: {
    gap: space['1'],
    alignItems: 'center',
    borderBlockEndColor: colorVars['--cl-color-border'],
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: '1px',
    display: 'flex',
    flexShrink: 0,
    paddingInlineEnd: space['2'],
    paddingInlineStart: space['1'],
    height: space['8'],
  },
  countrySearchIcon: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: space['5'],
    width: space['5'],
  },
  countrySearchInput: {
    borderRadius: 0,
    outline: {
      default: 'none',
      '@media (forced-colors: active)': {
        default: null,
        ':focus-visible': '2px solid CanvasText',
      },
    },
    outlineOffset: {
      default: null,
      '@media (forced-colors: active)': {
        default: null,
        ':focus-visible': '2px',
      },
    },
    paddingInlineEnd: space['1'],
    paddingInlineStart: space['0.5'],
    height: space['6'],
    '::placeholder': {
      color: colorVars['--cl-color-foreground-secondary'],
    },
  },
  option: {
    paddingInlineStart: `calc(${space['1']} + 1px)`,
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
