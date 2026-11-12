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
import { inputGroupScope } from '../input-group/input-group.markers.stylex';

const popupRadius = radiusVars['--cl-radius-xl'];
const inset = space['1.5'];
const optionRadius = `max(0px, calc(${popupRadius} - ${inset}))`;

export const styles = stylex.create({
  positioner: {
    outline: 'none',
  },
  popup: {
    borderRadius: popupRadius,
    outline: 'none',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-surface'],
    boxShadow: shadowVars['--cl-shadow-md'],
    color: colorVars['--cl-color-foreground'],
    opacity: {
      default: 1,
      ':where([data-ending-style], [data-starting-style])': 0,
    },
    // The reduced-motion scale value goes too, or the exit snaps out of 96%.
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
    padding: inset,
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '16rem',
  },
  list: {
    padding: inset,
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '16rem',
  },
  option: {
    borderRadius: optionRadius,
    gap: space['1'],
    outline: {
      default: 'none',
      '@media (forced-colors: active)': {
        default: null,
        ':is([data-active])': '2px solid CanvasText',
      },
    },
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':is([data-active])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      '@media (hover: hover)': {
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
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
    paddingInlineEnd: space['1.5'],
    paddingInlineStart: space['1.5'],
    position: 'relative',
    height: space['8'],
    '::before': {
      insetBlock: `calc(-1 * ${space['0.5']})`,
      insetInline: `calc(-1 * ${space['0.5']})`,
      content: '""',
      position: 'absolute',
    },
  },
  empty: {
    paddingBlock: {
      default: space['6'],
      ':empty': 0,
    },
    paddingInline: {
      default: space['3'],
      ':empty': 0,
    },
    color: colorVars['--cl-color-foreground-secondary'],
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    textAlign: 'center',
  },
  media: {
    alignItems: 'center',
    aspectRatio: '1/1',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    width: space['4'],
  },
  label: {
    flexGrow: 1,
    minWidth: 0,
  },
  detail: {
    color: colorVars['--cl-color-foreground-secondary'],
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  indicator: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    marginInlineStart: 'auto',
    width: space['4'],
  },
});

export const trigger = stylex.create({
  base: {
    backgroundColor: 'transparent',
    color: {
      default: colorVars['--cl-color-input-placeholder'],
      '@media (hover: hover)': {
        default: null,
        [stylex.when.ancestor(':hover', inputGroupScope)]: colorVars['--cl-color-foreground'],
      },
    },
  },
  clear: {
    color: {
      default: colorVars['--cl-color-input-placeholder'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-foreground'],
      },
    },
    marginInlineEnd: `calc(-1 * ${space['2']})`,
    width: space['5.5'],
  },
});
