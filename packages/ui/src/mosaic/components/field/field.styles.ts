import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, fontWeightVars, space } from '../../tokens.stylex';

const ROOT_GAP = space['2'];
const MESSAGE_FADE = space['3'];

export const styles = stylex.create({
  root: {
    gap: ROOT_GAP,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: colorVars['--cl-color-primary'],
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  message: {
    margin: 0,
  },
  description: {
    color: colorVars['--cl-color-neutral-faded'],
  },
  messageRoot: {
    overflow: 'clip',
    alignContent: 'start',
    display: 'grid',
    maskImage: `linear-gradient(to bottom, black calc(100% - ${MESSAGE_FADE}), transparent)`,
    maskRepeat: 'no-repeat',
    maskSize: {
      default: `100% calc(100% + ${MESSAGE_FADE})`,
      ':where(:not([data-open]), [data-starting-style])': '100% 100%',
    },
    position: 'relative',
    transitionDuration: durationVars['--cl-duration-slow'],
    transitionProperty: {
      default: 'height, margin-top, mask-size',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: easingVars['--cl-ease-enter'],
    height: {
      default: 'var(--_cl-field-message-height)',
      ':where(:not([data-open]), [data-starting-style])': 0,
    },
    marginTop: {
      default: 0,
      ':where(:not([data-open]), [data-starting-style])': `calc(-1 * ${ROOT_GAP})`,
    },
  },
  feedback: {
    inset: { default: null, ':where([data-ending-style])': '0 0 auto' },
    gap: space['1'],
    alignItems: 'flex-start',
    display: 'flex',
    opacity: { default: 1, ':where([data-starting-style], [data-ending-style])': 0 },
    position: { default: null, ':where([data-ending-style])': 'absolute' },
    textWrap: 'pretty',
    transitionDuration: durationVars['--cl-duration-base'],
    transitionProperty: 'opacity',
    transitionTimingFunction: 'linear',
  },
  error: {
    color: colorVars['--cl-color-negative'],
  },
  success: {
    color: colorVars['--cl-color-positive'],
  },
  feedbackIcon: {
    flexShrink: 0,
    height: '1lh',
  },
});

export const dynamic = stylex.create({
  messageHeight: (height: number) => ({ '--_cl-field-message-height': `${height}px` }),
});
