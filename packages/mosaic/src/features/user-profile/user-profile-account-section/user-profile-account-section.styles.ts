import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, space } from '../../../tokens.stylex';
import { contactItemMarker } from './user-profile-account-section.markers.stylex';

const pulse = stylex.keyframes({
  '0%': { opacity: 1 },
  '20%': { opacity: 0.4 },
  '40%': { opacity: 1 },
  '100%': { opacity: 1 },
});

export const styles = stylex.create({
  sections: {
    gap: space['8'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  contactSlot: {
    display: {
      default: 'grid',
      '@media (prefers-reduced-motion: reduce)': { default: 'grid', ':where([data-closed])': 'none' },
    },
    gridTemplateRows: {
      default: '1fr',
      ':where([data-ending-style])': '0fr',
    },
    transitionDuration: durationVars['--cl-duration-slower'],
    transitionProperty: {
      default: 'grid-template-rows',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
  contactSlotAppear: {
    gridTemplateRows: {
      '@starting-style': '0fr',
      default: '1fr',
      ':where([data-ending-style])': '0fr',
    },
  },
  contactClip: {
    overflow: 'clip',
    alignContent: 'start',
    display: 'grid',
    gridRowEnd: 'span 2',
    gridRowStart: '1',
    minHeight: 0,
  },
  contactItem: {
    borderBlockStartColor: {
      default: colorVars['--cl-color-border'],
      ':where([data-ending-style])': 'transparent',
      '@media (prefers-reduced-motion: reduce)': {
        default: colorVars['--cl-color-border'],
        ':where([data-ending-style])': colorVars['--cl-color-border'],
      },
    },
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: {
      default: 'border-block-start-color',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: 'linear',
  },
  contactFade: {
    opacity: {
      default: 1,
      [stylex.when.ancestor(':where([data-starting-style], [data-ending-style])', contactItemMarker)]: 0,
      '@media (prefers-reduced-motion: reduce)': {
        default: 1,
        [stylex.when.ancestor(':where([data-starting-style], [data-ending-style])', contactItemMarker)]: 1,
      },
    },
    transform: {
      default: 'scale(1)',
      [stylex.when.ancestor(':where([data-starting-style], [data-ending-style])', contactItemMarker)]: 'scale(0.98)',
      '@media (prefers-reduced-motion: reduce)': {
        default: 'scale(1)',
        [stylex.when.ancestor(':where([data-starting-style], [data-ending-style])', contactItemMarker)]: 'scale(1)',
      },
    },
    transformOrigin: 'left',
    transitionDelay: {
      default: durationVars['--cl-duration-slow'],
      [stylex.when.ancestor(':where([data-ending-style])', contactItemMarker)]: durationVars['--cl-duration-instant'],
    },
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      [stylex.when.ancestor(':where([data-ending-style])', contactItemMarker)]: durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: {
      default: `${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-default']}`,
      [stylex.when.ancestor(':where([data-ending-style])', contactItemMarker)]: easingVars['--cl-ease-exit'],
    },
  },
  contactPending: {
    animationDelay: `calc(var(--_cl-contact-index) * 80ms)`,
    animationDuration: '1.4s',
    animationIterationCount: 'infinite',
    animationName: {
      default: pulse,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
});

export const contactIndex = stylex.create({
  at: (index: number) => ({ '--_cl-contact-index': index }),
});
