import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars, focusVars, space } from '../../../tokens.stylex';
import { contactItemMarker, contactSlotMarker } from './user-profile-account-section.markers.stylex';

const ring = `calc(${focusVars['--cl-focus-outline-width']} + ${focusVars['--cl-focus-outline-offset']})`;

export const styles = stylex.create({
  contactSlot: {
    display: 'grid',
    gridTemplateRows: {
      default: 'auto 1fr',
      ':where([data-starting-style], [data-ending-style])': 'auto 0fr',
    },
    transitionDelay: durationVars['--cl-duration-base'],
    transitionDuration: durationVars['--cl-duration-slower'],
    transitionProperty: {
      default: 'grid-template-rows',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: easingVars['--cl-ease-in-out'],
  },
  contactClip: {
    marginInline: `calc(-1 * ${ring})`,
    overflow: 'clip',
    paddingInline: ring,
    alignContent: 'start',
    display: 'grid',
    gridRowEnd: 'span 2',
    gridRowStart: '1',
    maskImage: `linear-gradient(to top, transparent, black calc(${space['4']} - ${ring}))`,
    minHeight: 0,
  },
  contactEmpty: {
    gridRowStart: '1',
    opacity: {
      default: 0,
      [stylex.when.ancestor(':where([data-starting-style], [data-ending-style])', contactSlotMarker)]: 1,
      '@media (prefers-reduced-motion: reduce)': {
        default: 0,
        [stylex.when.ancestor(':where([data-starting-style], [data-ending-style])', contactSlotMarker)]: 1,
      },
    },
    transitionDelay: {
      default: durationVars['--cl-duration-instant'],
      [stylex.when.ancestor(':where([data-ending-style])', contactSlotMarker)]:
        `calc(${durationVars['--cl-duration-base']} + ${durationVars['--cl-duration-fast']})`,
    },
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      [stylex.when.ancestor(':where([data-ending-style])', contactSlotMarker)]: durationVars['--cl-duration-base'],
    },
    transitionProperty: {
      default: 'opacity',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-exit'],
      [stylex.when.ancestor(':where([data-ending-style])', contactSlotMarker)]: easingVars['--cl-ease-enter'],
    },
  },
  contactItem: {
    borderBlockStartWidth: {
      default: '0px',
      [stylex.when.ancestor(':where([data-open] ~ *)', contactSlotMarker)]: '1px',
    },
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
    transitionDelay: {
      default: `calc(${durationVars['--cl-duration-base']} + ${durationVars['--cl-duration-slow']})`,
      [stylex.when.ancestor(':where([data-ending-style])', contactItemMarker)]: durationVars['--cl-duration-base'],
    },
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      [stylex.when.ancestor(':where([data-ending-style])', contactItemMarker)]: durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      [stylex.when.ancestor(':where([data-ending-style])', contactItemMarker)]: easingVars['--cl-ease-exit'],
    },
  },
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
