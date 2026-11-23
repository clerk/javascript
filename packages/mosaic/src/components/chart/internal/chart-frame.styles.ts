import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  radiusVars,
  shadowVars,
  space,
  typeScaleVars,
} from '../../../tokens.stylex';

export const frameStyles = stylex.create({
  root: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    width: '100%',
  },
  height: (height: string) => ({ height }),
  plotArea: {
    flexGrow: 1,
    position: 'relative',
    minHeight: 0,
  },
  plot: {
    fontSize: typeScaleVars['--cl-text-xs-size'],
    isolation: 'isolate',
  },
  // Above the cursor, so the hover band shows only in the gaps and bar colors stay exact. The
  // interaction surface below still takes the pointer, because nothing here does.
  marks: {
    pointerEvents: 'none',
    zIndex: 1,
  },
  gridLine: {
    stroke: colorVars['--cl-color-border'],
    strokeDasharray: '1 3',
    strokeLinecap: 'round',
    strokeWidth: 1,
  },
  zeroLine: {
    stroke: colorVars['--cl-color-foreground'],
    strokeWidth: 2,
  },
  tick: {
    fill: {
      default: colorVars['--cl-color-foreground-secondary'],
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
    backgroundColor: colorVars['--cl-color-surface'],
    boxShadow: shadowVars['--cl-shadow-md'],
    color: colorVars['--cl-color-foreground'],
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: 'opacity',
    transitionTimingFunction: easingVars['--cl-ease-default'],
    zIndex: 10,
  },
  overlay: {
    inset: 0,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 2,
  },
});
