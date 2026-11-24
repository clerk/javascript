import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, radiusVars, shadowVars, space } from '../../tokens.stylex';

export const partStyles = stylex.create({
  gridLine: {
    stroke: colorVars['--cl-color-chart-grid'],
    strokeDasharray: '1 3',
    strokeLinecap: 'round',
    strokeWidth: 1,
  },
  yLine: {
    stroke: colorVars['--cl-color-foreground'],
    strokeWidth: 2,
  },
  tick: {
    fill: {
      default: colorVars['--cl-color-chart-label'],
      ':where([data-active])': colorVars['--cl-color-foreground'],
    },
    fontVariantNumeric: 'tabular-nums',
  },
  selection: {
    borderRadius: radiusVars['--cl-radius-md'],
  },
  activatable: {
    cursor: 'pointer',
  },
  cursor: {
    borderRadius: radiusVars['--cl-radius-sm'],
    backgroundColor: colorVars['--cl-color-neutral-alpha-200'],
  },
  tooltip: {
    padding: space['3'],
    borderRadius: radiusVars['--cl-radius-lg'],
    backgroundColor: colorVars['--cl-color-chart-tooltip'],
    boxShadow: shadowVars['--cl-shadow-md'],
    color: colorVars['--cl-color-foreground'],
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: 'opacity',
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
    zIndex: 10,
  },
});
