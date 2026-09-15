import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, fontWeightVars, scrollFadeVars, space } from '../../tokens.stylex';
import { fieldMessageVars } from './field.vars.stylex';

const ROOT_GAP = space['2'];
const MESSAGE_FADE = fieldMessageVars['--_cl-field-message-fade'];
const FADE_SIZE = scrollFadeVars['--cl-scroll-fade-size'];

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
    '--_cl-field-message-fade': {
      default: 0,
      ':where(:not([data-open]), [data-starting-style])': 1,
    },
    overflow: 'clip',
    alignContent: 'start',
    display: 'grid',
    maskImage: `linear-gradient(to bottom, #000 calc(100% - ${FADE_SIZE}), rgb(0 0 0 / calc(1 - ${MESSAGE_FADE})))`,
    position: 'relative',
    transitionDuration: durationVars['--cl-duration-slow'],
    transitionProperty: {
      default: 'height, margin-top, --_cl-field-message-fade',
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
