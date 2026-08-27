import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, targetVars, typeScaleVars } from './tokens.stylex';

const profilePageCompact = '@media (max-width: 48rem)' as const;

export const styles = stylex.create({
  root: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    color: colorVars['--cl-color-card-foreground'],
    display: 'grid',
    gridTemplateColumns: {
      default: `calc(${space['40']} + ${space['15']}) minmax(0, 1fr)`,
      [profilePageCompact]: 'minmax(0, 1fr)',
    },
    gridTemplateRows: 'auto',
    maxWidth: '66rem',
    minHeight: '37.5rem',
    width: '100%',
  },
  sidebar: {
    padding: space['4'],
    borderBlockEndColor: {
      default: 'transparent',
      [profilePageCompact]: colorVars['--cl-color-border'],
    },
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: {
      default: '0px',
      [profilePageCompact]: '1px',
    },
    borderInlineEndColor: colorVars['--cl-color-border'],
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: {
      default: '1px',
      [profilePageCompact]: '0px',
    },
    display: 'flex',
    flexDirection: {
      default: 'column',
      [profilePageCompact]: 'row',
    },
    minHeight: 0,
    minWidth: 0,
  },
  navigation: {
    gap: space['1'],
    display: 'flex',
    flexDirection: {
      default: 'column',
      [profilePageCompact]: 'row',
    },
    minWidth: 0,
    overflowX: {
      default: 'visible',
      [profilePageCompact]: 'auto',
    },
  },
  navigationItem: {
    borderColor: 'transparent',
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '0px',
    gap: space['2'],
    paddingBlock: space['2'],
    paddingInline: space['2.5'],
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':where([data-selected])': colorVars['--cl-color-border-faded'],
      ':active': colorVars['--cl-color-border-faded'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active):not([data-selected])': colorVars['--cl-color-border-faded'],
      },
    },
    color: {
      default: colorVars['--cl-color-neutral-faded'],
      ':where([data-selected])': colorVars['--cl-color-card-foreground'],
    },
    cursor: 'pointer',
    display: 'flex',
    flexShrink: 0,
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textAlign: 'start',
    whiteSpace: 'nowrap',
    minHeight: {
      default: null,
      '@media (pointer: coarse)': targetVars['--cl-target-coarse'],
    },
    width: {
      default: '100%',
      [profilePageCompact]: 'auto',
    },
  },
  branding: {
    gap: space['1'],
    alignItems: 'center',
    color: colorVars['--cl-color-neutral-faded'],
    display: {
      default: 'flex',
      [profilePageCompact]: 'none',
    },
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    marginBlockStart: 'auto',
  },
  brandingLink: {
    borderRadius: radiusVars['--cl-radius-sm'],
    alignItems: 'center',
    color: 'inherit',
    display: 'inline-flex',
    height: space['4'],
  },
  main: { minWidth: 0 },
  content: {
    paddingBlock: space['16'],
    paddingInline: space['16'],
  },
});
