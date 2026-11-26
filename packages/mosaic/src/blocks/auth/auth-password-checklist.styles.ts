import * as stylex from '@stylexjs/stylex';

import { colorVars, easingVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

const iconSize = space['3.5'];
const duration = 'var(--_cl-pwrule-duration, 160ms)';
const ease = `var(--_cl-pwrule-ease, ${easingVars['--cl-ease-enter']})`;
const textDuration = 'var(--_cl-pwrule-text-duration, 150ms)';
const fromScale = 'var(--_cl-pwrule-scale, 0.25)';
const fromBlur = 'var(--_cl-pwrule-blur, 4px)';

export const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: space['1.5'],
    listStyle: 'none',
    display: 'grid',
  },
  chips: {
    margin: 0,
    padding: 0,
    gap: space['1.5'],
    listStyle: 'none',
    display: 'flex',
    flexWrap: 'wrap',
  },
  row: {
    gap: space['2'],
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    transitionDuration: textDuration,
    transitionProperty: 'color, background-color, box-shadow',
    transitionTimingFunction: 'ease',
  },
  chip: {
    borderRadius: radiusVars['--cl-radius-full'],
    gap: space['1'],
    paddingBlock: space['1'],
    boxShadow: `inset 0 0 0 1px ${colorVars['--cl-color-border']}`,
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    paddingInlineEnd: space['2.5'],
    paddingInlineStart: space['1.5'],
  },
  chipMet: {
    backgroundColor: colorVars['--cl-color-positive-subtle'],
    boxShadow: 'inset 0 0 0 1px transparent',
  },
  rowMet: {
    color: colorVars['--cl-color-foreground'],
  },
  rowMissed: {
    color: colorVars['--cl-color-negative'],
  },
  icon: {
    display: 'inline-grid',
    flexShrink: 0,
    height: iconSize,
    width: iconSize,
  },
  mark: {
    borderRadius: radiusVars['--cl-radius-full'],
    gridColumn: '1',
    gridRow: '1',
    transitionDuration: {
      default: duration,
      '@media (prefers-reduced-motion: reduce)': '100ms',
    },
    transitionProperty: {
      default: 'opacity, transform, filter',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: ease,
  },
  ring: {
    boxShadow: 'inset 0 0 0 1.5px currentColor',
  },
  check: {
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-positive'],
    color: colorVars['--cl-color-positive-foreground'],
    display: 'flex',
    justifyContent: 'center',
  },
  shown: {
    filter: 'blur(0)',
    opacity: 1,
    transform: 'scale(1)',
  },
  hidden: {
    filter: {
      default: `blur(${fromBlur})`,
      '@media (prefers-reduced-motion: reduce)': 'blur(0)',
    },
    opacity: 0,
    transform: {
      default: `scale(${fromScale})`,
      '@media (prefers-reduced-motion: reduce)': 'scale(1)',
    },
    transitionDuration: {
      default: `calc(${duration} * 0.75)`,
      '@media (prefers-reduced-motion: reduce)': '100ms',
    },
    transitionTimingFunction: easingVars['--cl-ease-exit'],
  },
  drawCircle: {
    borderRadius: radiusVars['--cl-radius-full'],
    alignItems: 'center',
    backgroundColor: 'transparent',
    boxShadow: 'inset 0 0 0 1.5px currentColor',
    color: colorVars['--cl-color-positive-foreground'],
    justifyContent: 'center',
    transitionDuration: duration,
    transitionProperty: 'background-color, box-shadow',
    transitionTimingFunction: ease,
  },
  drawCircleMet: {
    backgroundColor: colorVars['--cl-color-positive'],
    boxShadow: `inset 0 0 0 1.5px ${colorVars['--cl-color-positive']}`,
  },
  drawCheck: {
    gridColumn: '1',
    gridRow: '1',
    clipPath: 'inset(0 100% 0 0)',
    display: 'flex',
    transitionDuration: {
      default: duration,
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
    transitionProperty: 'clip-path',
    transitionTimingFunction: ease,
  },
  drawCheckMet: {
    clipPath: 'inset(0 0 0 0)',
    transitionDelay: {
      default: `calc(${duration} * 0.4)`,
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
  },
  drawCheckUnmet: {
    transitionDelay: '0ms',
  },
});
