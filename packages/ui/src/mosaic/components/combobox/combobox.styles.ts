import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';

export const styles = stylex.create({
  positioner: {
    outline: 'none',
  },
  popup: {
    borderRadius: radiusVars['--cl-radius-lg'],
    outline: 'none',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-background'],
    boxShadow: shadowVars['--cl-shadow-md'],
    color: colorVars['--cl-color-foreground'],
    opacity: {
      default: 1,
      ':where([data-ending-style], [data-starting-style])': 0,
    },
    // Reduced motion drops the scale VALUE as well as its transition: left in, it would
    // apply instantly and snap the popup out of 96% on the way out.
    scale: {
      default: 1,
      ':where([data-ending-style], [data-starting-style])': 0.96,
      '@media (prefers-reduced-motion: reduce)': {
        default: 1,
        ':where([data-ending-style], [data-starting-style])': 1,
      },
    },
    transformOrigin: 'var(--cl-transform-origin)',
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, scale',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: `${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
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
    color: colorVars['--cl-color-foreground-secondary'],
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    textAlign: 'center',
  },
  indicator: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
});
