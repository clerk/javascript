import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars, space, typeScaleVars } from '../../tokens.stylex';

const errorIn = stylex.keyframes({
  from: { opacity: 0, transform: `translateY(calc(-1 * ${space['0.5']}))` },
});

const errorFadeIn = stylex.keyframes({
  from: { opacity: 0 },
});

export const styles = stylex.create({
  errorEnter: {
    animationDuration: durationVars['--cl-duration-base'],
    animationFillMode: 'backwards',
    animationName: {
      default: errorIn,
      '@media (prefers-reduced-motion: reduce)': errorFadeIn,
    },
    animationTimingFunction: easingVars['--cl-ease-enter'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  actions: {
    gap: space['2'],
    display: 'grid',
  },
  fieldGroup: {
    gap: space['3'],
    display: 'grid',
  },
  links: {
    columnGap: space['4'],
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: space['1'],
  },
  stackedField: {
    alignItems: 'center',
    textAlign: 'center',
  },
  status: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
});
