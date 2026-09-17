import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

const pulse = stylex.keyframes({
  '50%': { opacity: 0.5 },
});

export const styles = stylex.create({
  skeleton: {
    borderRadius: radiusVars['--cl-radius-sm'],
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationName: {
      default: pulse,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    backgroundColor: colorVars['--cl-color-neutral-alpha-200'],
    height: '1lh',
    width: space['16'],
  },
  codes: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-background-subtle'],
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    listStyleType: 'none',
  },
  cell: {
    borderColor: colorVars['--cl-color-border'],
    borderStyle: 'solid',
    paddingBlock: space['2'],
    paddingInline: space['3'],
    alignItems: 'center',
    borderBlockEndWidth: 0,
    borderBlockStartWidth: { default: 0, ':nth-child(n + 3)': '1px' },
    borderInlineEndWidth: { default: 0, ':nth-child(odd)': '1px' },
    borderInlineStartWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    minWidth: 0,
  },
  code: {
    overflowWrap: 'anywhere',
  },
});
