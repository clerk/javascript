import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

export const styles = stylex.create({
  root: {
    borderRadius: radiusVars['--cl-radius-xl'],
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px light-dark(oklch(0.2046 0 0 / 12%), transparent),
                0 24px 24px -10px light-dark(oklch(0.2046 0 0 / 4%), transparent),
                0 0 0 1px light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))`,
    color: colorVars['--cl-color-card-foreground'],
    display: 'grid',
    gridTemplateColumns: {
      default: `calc(${space['40']} + ${space['15']}) minmax(0, 1fr)`,
      '@media (max-width: 47.99rem)': 'minmax(0, 1fr)',
    },
    gridTemplateRows: 'auto',
    maxWidth: '66rem',
    minHeight: 0,
    width: '100%',
  },
  sidebar: {
    padding: space['4'],
    borderBlockEndColor: {
      default: 'transparent',
      '@media (max-width: 47.99rem)': colorVars['--cl-color-border'],
    },
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: {
      default: '0px',
      '@media (max-width: 47.99rem)': '1px',
    },
    borderInlineEndColor: colorVars['--cl-color-border'],
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: {
      default: '1px',
      '@media (max-width: 47.99rem)': '0px',
    },
    display: 'flex',
    flexDirection: {
      default: 'column',
      '@media (max-width: 47.99rem)': 'row',
    },
    minHeight: 0,
    minWidth: 0,
  },
  navigation: {
    gap: space['1'],
    display: 'flex',
    flexDirection: {
      default: 'column',
      '@media (max-width: 47.99rem)': 'row',
    },
    minWidth: 0,
    overflowX: {
      default: 'visible',
      '@media (max-width: 47.99rem)': 'auto',
    },
  },
  navigationItem: {
    borderColor: 'transparent',
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '0px',
    gap: space['2'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}`,
    },
    paddingBlock: space['2'],
    paddingInline: space['2.5'],
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': colorVars['--cl-color-border-faded'],
    },
    color: colorVars['--cl-color-neutral-faded'],
    cursor: 'pointer',
    display: 'flex',
    flexShrink: 0,
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    outlineOffset: '2px',
    textAlign: 'start',
    whiteSpace: 'nowrap',
    width: {
      default: '100%',
      '@media (max-width: 47.99rem)': 'auto',
    },
  },
  navigationItemActive: {
    backgroundColor: colorVars['--cl-color-border-faded'],
    color: colorVars['--cl-color-card-foreground'],
  },
  branding: {
    gap: space['1'],
    alignItems: 'center',
    color: colorVars['--cl-color-neutral-faded'],
    display: {
      default: 'flex',
      '@media (max-width: 47.99rem)': 'none',
    },
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    marginBlockStart: 'auto',
  },
  brandingLink: {
    borderRadius: radiusVars['--cl-radius-sm'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}`,
    },
    alignItems: 'center',
    color: 'inherit',
    display: 'inline-flex',
    outlineOffset: '2px',
    height: space['4'],
  },
  main: {
    minWidth: 0,
  },
  content: {
    paddingBlock: space['16'],
    paddingInline: space['16'],
  },
});
