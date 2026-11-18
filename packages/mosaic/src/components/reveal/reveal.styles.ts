import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars, focusVars } from '../../tokens.stylex';

const ringRoom = `calc(${focusVars['--cl-focus-outline-width']} + ${focusVars['--cl-focus-outline-offset']})`;

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
    alignContent: 'end',
    display: 'grid',
    gridRowEnd: 'span 2',
    gridRowStart: '1',
    marginBlockEnd: `calc(${ringRoom} * -1)`,
    paddingBlockEnd: ringRoom,
    minHeight: 0,
    overflowX: 'visible',
    overflowY: 'clip',
  },
});
