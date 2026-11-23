import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

const mark = 'var(--_cl-chart-mark)';

// `BarChart.Bar` is hidden; the Canvas paints every bar from its computed color and geometry.
// Dimmed and projection fills are opaque mixes with the surface, so grid lines never show through.
export const barStyles = stylex.create({
  bar: {
    color: {
      default: mark,
      ':where([data-inactive])': `color-mix(in oklab, ${mark} 40%, ${colorVars['--cl-color-surface']})`,
      ':where([data-projection])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, ${colorVars['--cl-color-surface']})`,
    },
    rowGap: '2px',
    borderBottomLeftRadius: '2px',
    borderBottomRightRadius: '2px',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    maxWidth: '32px',
  },
  projectionOutline: {
    fill: 'none',
    stroke: colorVars['--cl-color-foreground-secondary'],
    strokeDasharray: '3 3',
    strokeWidth: 1,
  },
  error: {
    gap: space['3'],
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },
});
