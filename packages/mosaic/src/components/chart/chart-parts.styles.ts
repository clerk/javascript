import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, focusVars, radiusVars, shadowVars, space } from '../../tokens.stylex';

export const partStyles = stylex.create({
  gridLine: {
    stroke: colorVars['--cl-color-border'],
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
      default: colorVars['--cl-color-foreground-secondary'],
      ':where([data-active])': colorVars['--cl-color-foreground'],
    },
    fontVariantNumeric: 'tabular-nums',
  },
  selection: {
    borderRadius: radiusVars['--cl-radius-md'],
  },
  // The chart is one tab stop with arrow keys inside, so the ring sits on the selected band and
  // rings the whole chart only while keyboard focus has no band, as after Escape.
  selectionRing: {
    outlineColor: {
      default: null,
      ':has(:focus-visible):not(:has([data-focus-visible]))': colorVars['--cl-color-ring'],
    },
    outlineOffset: {
      default: null,
      ':has(:focus-visible):not(:has([data-focus-visible]))': focusVars['--cl-focus-outline-offset'],
    },
    outlineStyle: {
      default: null,
      ':has(:focus-visible):not(:has([data-focus-visible]))': focusVars['--cl-focus-outline-style'],
    },
    outlineWidth: {
      default: null,
      ':has(:focus-visible):not(:has([data-focus-visible]))': focusVars['--cl-focus-outline-width'],
    },
  },
  activatable: {
    cursor: 'pointer',
  },
  cursor: {
    borderRadius: radiusVars['--cl-radius-sm'],
    backgroundColor: colorVars['--cl-color-neutral-alpha-200'],
    outlineColor: { default: null, ':where([data-focus-visible])': colorVars['--cl-color-ring'] },
    outlineOffset: { default: null, ':where([data-focus-visible])': focusVars['--cl-focus-outline-offset'] },
    outlineStyle: { default: null, ':where([data-focus-visible])': focusVars['--cl-focus-outline-style'] },
    outlineWidth: { default: null, ':where([data-focus-visible])': focusVars['--cl-focus-outline-width'] },
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
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      ':where([data-moving])': `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-slow']}, ${durationVars['--cl-duration-slow']}`,
    },
    transitionProperty: {
      default: 'opacity',
      ':where([data-moving])': 'opacity, top, left',
      '@media (prefers-reduced-motion: reduce)': {
        default: 'opacity',
        ':where([data-moving])': 'opacity',
      },
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
    zIndex: 10,
  },
});
