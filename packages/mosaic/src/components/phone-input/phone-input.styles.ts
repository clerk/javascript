import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';

const popupRadius = radiusVars['--cl-radius-xl'];
const listInset = space['1.5'];
const optionRadius = `max(0px, calc(${popupRadius} - ${listInset}))`;

export const styles = stylex.create({
  triggerStart: {
    paddingInlineStart: 0,
  },
  trigger: {
    '--_cl-icon-color': {
      default: colorVars['--cl-color-input-placeholder'],
      ':not([data-disabled])[aria-expanded="true"]': colorVars['--cl-color-foreground'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-foreground'],
      },
    },
    borderRadius: 'max(0px, calc(var(--_cl-input-group-radius) - 1px))',
    borderWidth: 0,
    alignItems: 'center',
    alignSelf: 'stretch',
    appearance: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    outlineOffset: { default: null, ':focus-visible': 0 },
    paddingInlineEnd: 0,
    paddingInlineStart: `calc(${space['2']} + var(--_cl-input-group-inset))`,
    userSelect: 'none',
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
    fontSize: '1rem',
    justifyContent: 'center',
    lineHeight: 1,
    height: space['4'],
    width: space['4'],
  },
  divider: {
    backgroundColor: colorVars['--cl-color-border-subtle'],
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
    borderRadius: popupRadius,
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-surface'],
    boxShadow: shadowVars['--cl-shadow-md'],
    color: colorVars['--cl-color-foreground'],
  },
  countrySearchRow: {
    gap: space['1.5'],
    alignItems: 'center',
    borderBlockEndColor: colorVars['--cl-color-border-subtle'],
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: '1px',
    display: 'flex',
    flexShrink: 0,
    paddingInlineEnd: space['2'],
    paddingInlineStart: space['3'],
    height: space['9'],
  },
  countrySearchIcon: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: space['4'],
    width: space['4'],
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
  countryList: {
    padding: listInset,
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '16rem',
  },
  option: {
    borderRadius: optionRadius,
    gap: space['2'],
    outline: {
      default: 'none',
      '@media (forced-colors: active)': {
        default: null,
        ':is([data-active])': '2px solid CanvasText',
      },
    },
    paddingBlock: space['1'],
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':is([data-active])': colorVars['--cl-color-neutral-alpha-100'],
      '@media (hover: hover)': {
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': colorVars['--cl-color-neutral-alpha-100'],
      },
    },
    color: {
      default: colorVars['--cl-color-foreground-secondary'],
      ':where([data-active])': colorVars['--cl-color-foreground'],
    },
    cursor: 'pointer',
    display: 'flex',
    flexShrink: 0,
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    paddingInlineEnd: space['1.5'],
    paddingInlineStart: space['1.5'],
    height: space['8'],
  },
  empty: {
    paddingBlock: space['6'],
    paddingInline: space['3'],
    color: colorVars['--cl-color-foreground-secondary'],
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    textAlign: 'center',
  },
  optionFlag: {
    fontSize: '1rem',
    lineHeight: 1,
  },
  optionCode: {
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
});
