import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

export const tooltipSurface = stylex.create({
  base: {
    borderRadius: radiusVars['--cl-radius-md'],
    gap: space['1'],
    paddingBlock: space['1'],
    paddingInline: space['1.5'],
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-foreground'],
    color: colorVars['--cl-color-background'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transform: {
      default: 'scale(1)',
      ':where([data-starting-style], [data-ending-style])': 'scale(0.94)',
      '@media (prefers-reduced-motion: reduce)': {
        default: 'scale(1)',
        ':where([data-starting-style], [data-ending-style])': 'scale(1)',
      },
    },
    transformOrigin: 'var(--cl-anchor-origin, center)',
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: `${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
    maxWidth: 'min(20rem, calc(100vw - 2rem))',
  },
});
