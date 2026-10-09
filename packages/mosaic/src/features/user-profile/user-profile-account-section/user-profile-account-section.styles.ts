import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars } from '../../../tokens.stylex';

export const styles = stylex.create({
  badgeSlot: {
    alignItems: 'center',
    display: { default: 'grid', ':empty': 'none' },
    justifyItems: 'start',
  },
  badgeSlotItem: {
    filter: {
      default: 'blur(0)',
      ':where([data-starting-style], [data-ending-style])': 'blur(1px)',
      '@media (prefers-reduced-motion: reduce)': {
        default: 'blur(0)',
        ':where([data-starting-style], [data-ending-style])': 'blur(0)',
      },
    },
    gridColumnStart: '1',
    gridRowStart: '1',
    opacity: { default: 1, ':where([data-starting-style], [data-ending-style])': 0 },
    scale: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0.9,
      '@media (prefers-reduced-motion: reduce)': {
        default: 1,
        ':where([data-starting-style], [data-ending-style])': 1,
      },
    },
    transitionDelay: {
      default: durationVars['--cl-duration-fast'],
      ':where([data-ending-style])': durationVars['--cl-duration-instant'],
    },
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, scale, filter, translate',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: `${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-default']}, ${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
    translate: {
      default: '0 0',
      ':where([data-ending-style])': '0 var(--_cl-badge-shift, 0px)',
      ':where([data-starting-style])': '0 calc(-1 * var(--_cl-badge-shift, 0px))',
      '@media (prefers-reduced-motion: reduce)': {
        default: '0 0',
        ':where([data-starting-style], [data-ending-style])': '0 0',
      },
    },
  },
});

export const badgeShift = stylex.create({
  along: (direction: number) => ({ '--_cl-badge-shift': `${direction * 0.5}rem` }),
});
