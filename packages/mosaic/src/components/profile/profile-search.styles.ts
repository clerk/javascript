import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

const fade = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

export const styles = stylex.create({
  search: {
    flexShrink: 0,
    marginBlockEnd: space['3'],
    width: '100%',
  },

  results: {
    padding: 0,
    gap: space['3'],
    flexGrow: 1,
    maxHeight: 'none',
    minHeight: 0,
  },

  group: {
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
  },

  groupLabel: {
    gap: space['1.5'],
    paddingBlock: space['1'],
    paddingInline: space['2'],
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },

  groupIcon: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
  },

  match: {
    backgroundColor: 'transparent',
    color: 'inherit',
    fontWeight: fontWeightVars['--cl-font-semibold'],
  },

  target: {
    outline: 'none',
    isolation: 'isolate',
    position: 'relative',
    scrollMarginBlockStart: space['12'],
  },

  targetHighlighted: {
    '::after': {
      inset: `calc(-1 * ${space['3']})`,
      borderRadius: `calc(${radiusVars['--cl-radius-xl']} + ${space['3']})`,
      animationDuration: '1.5s',
      animationFillMode: 'forwards',
      animationName: fade,
      animationTimingFunction: 'linear',
      backgroundColor: colorVars['--cl-color-neutral-alpha-100'],
      content: '""',
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: -1,
    },
  },
});
