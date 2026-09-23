import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';

const reduceMotion = '@media (prefers-reduced-motion: reduce)';

export const styles = stylex.create({
  positioner: {
    pointerEvents: 'none',
    width: 'max-content',
  },
  items: {
    display: 'contents',
  },
  destructive: {
    '--_cl-icon-color': colorVars['--cl-color-negative'],
  },
  bar: {
    borderRadius: radiusVars['--cl-radius-lg'],
    gap: space['1'],
    paddingBlock: space['1'],
    paddingInline: space['1'],
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-background'],
    blockSize: space['10'],
    boxShadow: shadowVars['--cl-shadow-lg'],
    display: 'flex',
    flexShrink: 0,
    opacity: {
      default: 1,
      ':is([data-open="false"])': 0,
    },
    pointerEvents: {
      default: 'auto',
      ':is([data-open="false"])': 'none',
    },
    transform: {
      default: 'translateY(0)',
      [reduceMotion]: {
        default: 'translateY(0)',
        ':is([data-open="false"])': 'translateY(0)',
      },
      ':is([data-open="false"])': 'translateY(0.25rem)',
    },
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}`,
      ':is([data-open="false"])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, transform',
      [reduceMotion]: 'opacity',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':is([data-open="false"])': easingVars['--cl-ease-exit'],
    },
  },
  count: {
    paddingInline: space['2'],
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    whiteSpace: 'nowrap',
  },
  separator: {
    marginBlock: space['1'],
    marginInline: space['0.5'],
    alignSelf: 'stretch',
    backgroundColor: colorVars['--cl-color-border'],
    width: '1px',
  },
});
