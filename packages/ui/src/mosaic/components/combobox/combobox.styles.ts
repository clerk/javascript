import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  positioner: {
    outline: 'none',
  },
  popup: {
    borderRadius: radiusVars['--cl-radius-lg'],
    outline: 'none',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px light-dark(oklch(0.2046 0 0 / 12%), transparent),
                0 24px 24px -10px light-dark(oklch(0.2046 0 0 / 4%), transparent),
                0 0 0 1px light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))`,
    color: colorVars['--cl-color-card-foreground'],
    opacity: {
      default: 1,
      ':where([data-ending-style], [data-starting-style])': 0,
    },
    scale: {
      default: 1,
      ':where([data-ending-style], [data-starting-style])': 0.96,
    },
    transformOrigin: 'var(--cl-transform-origin)',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0.01ms',
    },
    transitionProperty: 'opacity, scale',
    transitionTimingFunction: 'ease-out',
    maxHeight: 'var(--cl-available-height)',
    minWidth: '12.5rem',
  },
  viewport: {
    padding: space['1'],
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '16rem',
  },
  list: {
    padding: space['1'],
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '16rem',
  },
  option: {
    borderRadius: radiusVars['--cl-radius-md'],
    gap: space['2'],
    outline: {
      default: 'none',
      '@media (forced-colors: active)': {
        default: null,
        ':is([data-active])': '2px solid CanvasText',
      },
    },
    paddingInline: space['2'],
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':is([data-active])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      '@media (hover: hover)': {
        ':hover': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    cursor: {
      default: 'pointer',
      ':is([data-disabled])': 'not-allowed',
    },
    display: 'flex',
    flexShrink: 0,
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    opacity: {
      default: 1,
      ':is([data-disabled])': 0.5,
    },
    height: space['9'],
  },
  empty: {
    paddingBlock: space['6'],
    paddingInline: space['3'],
    color: colorVars['--cl-color-neutral-faded'],
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    textAlign: 'center',
  },
});
