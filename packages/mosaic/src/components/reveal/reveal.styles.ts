import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars } from '../../tokens.stylex';

export const reveal = stylex.create({
  root: {
    display: 'grid',
    gridTemplateRows: {
      default: '1fr',
      ':where(:not([data-open]), [data-starting-style])': '0fr',
    },
    transitionDuration: durationVars['--cl-duration-slow'],
    transitionProperty: {
      default: 'grid-template-rows',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': easingVars['--cl-ease-in-out'],
    },
  },
  clip: {
    overflow: 'clip',
    alignContent: 'end',
    display: 'grid',
    gridRowEnd: 'span 2',
    gridRowStart: '1',
    minHeight: 0,
  },
});
