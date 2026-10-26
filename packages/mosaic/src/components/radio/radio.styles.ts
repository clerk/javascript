import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, radiusVars, space } from '../../tokens.stylex';
import { radioInputMarker } from './radio.markers.stylex';

const hoverBorderColor = 'light-dark(#bebebe, #525252)';

export const styles = stylex.create({
  group: {
    gap: space['3'],
    display: 'flex',
    flexDirection: 'column',
  },
  root: {
    display: 'inline-flex',
    flexShrink: 0,
    position: 'relative',
    verticalAlign: 'middle',
  },
  input: {
    borderColor: {
      default: colorVars['--cl-color-border'],
      ':checked': colorVars['--cl-color-brand'],
      '@media (hover: hover)': {
        ':hover:not(:disabled):not(:checked)': hoverBorderColor,
      },
    },
    borderRadius: radiusVars['--cl-radius-full'],
    borderStyle: 'solid',
    borderWidth: '1px',
    appearance: 'none',
    backgroundColor: {
      default: colorVars['--cl-color-background'],
      ':checked': colorVars['--cl-color-brand'],
    },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    display: 'block',
    flexShrink: 0,
    opacity: { default: null, ':disabled': 0.5 },
    position: 'relative',
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: 'background-color, border-color',
    transitionTimingFunction: 'linear',
  },
  hitTarget: {
    '::before': {
      inset: `calc(-1 * ${space['3']})`,
      content: '""',
      display: { default: 'none', '@media (pointer: coarse)': 'block' },
      position: 'absolute',
    },
  },
  fieldHitTarget: {
    '::before': {
      inset: `calc(-1 * (${space['2']} + 1px))`,
      display: 'block',
    },
  },
  indicator: {
    borderRadius: radiusVars['--cl-radius-full'],
    backgroundColor: colorVars['--cl-color-brand-foreground'],
    display: {
      default: 'none',
      [stylex.when.siblingBefore(':checked', radioInputMarker)]: 'block',
    },
    insetBlockStart: '50%',
    insetInlineStart: '50%',
    pointerEvents: 'none',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
  },
});

export const sizes = stylex.create({
  sm: { height: space['3.5'], width: space['3.5'] },
  md: { height: space['4'], width: space['4'] },
});

export const firstLine = stylex.create({
  sm: { marginTop: `max(0px, calc((1lh - ${space['3.5']}) / 2))` },
  md: { marginTop: `max(0px, calc((1lh - ${space['4']}) / 2))` },
});

export const indicatorSizes = stylex.create({
  sm: { height: space['1.5'], width: space['1.5'] },
  md: { height: space['1.5'], width: space['1.5'] },
});
