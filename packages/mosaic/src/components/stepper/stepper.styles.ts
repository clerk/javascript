import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';
import { stepperSegmentMarker } from './stepper.markers.stylex';

const reduceMotion = '@media (prefers-reduced-motion: reduce)' as const;
const upcomingHover = `color-mix(in oklab, ${colorVars['--cl-color-foreground']} 25%, transparent)`;

export const styles = stylex.create({
  root: {
    gap: space['6'],
    alignItems: 'center',
    display: 'flex',
  },
  text: {
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontVariantNumeric: 'tabular-nums',
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    whiteSpace: 'nowrap',
  },
  label: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
  count: {
    color: colorVars['--cl-color-foreground'],
  },
  segments: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
  },
  segment: {
    borderRadius: radiusVars['--cl-radius-full'],
    display: 'block',
    flexShrink: 0,
    transitionDuration: {
      default: durationVars['--cl-duration-slow'],
      [reduceMotion]: durationVars['--cl-duration-instant'],
    },
    transitionProperty: 'width, background-color',
    transitionTimingFunction: easingVars['--cl-ease-in-out'],
    height: space['1.5'],
  },
  button: {
    borderStyle: 'none',
    appearance: 'none',
    cursor: 'pointer',
    position: 'relative',
    '::after': {
      content: '""',
      position: 'absolute',
      insetBlock: `calc(-1 * ${space['2']})`,
      insetInline: `calc(-0.5 * ${space['2']})`,
    },
  },
  upcomingHover: {
    backgroundColor: {
      default: colorVars['--cl-color-neutral-subtle'],
      '@media (hover: hover)': {
        default: null,
        ':hover': upcomingHover,
        [stylex.when.siblingAfter(':hover', stepperSegmentMarker)]: upcomingHover,
      },
    },
  },
});

export const segmentStates = stylex.create({
  complete: {
    backgroundColor: colorVars['--cl-color-foreground'],
    width: space['3'],
  },
  current: {
    backgroundColor: colorVars['--cl-color-foreground'],
    width: space['6'],
  },
  upcoming: {
    backgroundColor: colorVars['--cl-color-neutral-subtle'],
    width: space['3'],
  },
});
