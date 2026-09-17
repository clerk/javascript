import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, radiusVars, space } from '../../tokens.stylex';
import { checkboxInputMarker } from './checkbox.markers.stylex';

const hoverBorderColor = 'light-dark(#bebebe, #525252)';

export const styles = stylex.create({
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
      ':indeterminate': colorVars['--cl-color-brand'],
      '@media (hover: hover)': {
        ':hover:not(:disabled):not(:checked):not(:indeterminate)': hoverBorderColor,
      },
    },
    borderRadius: radiusVars['--cl-radius-sm'],
    borderStyle: 'solid',
    borderWidth: '1px',
    appearance: 'none',
    backgroundColor: {
      default: colorVars['--cl-color-background'],
      ':checked': colorVars['--cl-color-brand'],
      ':indeterminate': colorVars['--cl-color-brand'],
    },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    display: 'block',
    flexShrink: 0,
    opacity: { default: null, ':disabled': 0.5 },
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: 'background-color, border-color',
    transitionTimingFunction: 'linear',
  },
  indicator: {
    inset: 0,
    alignItems: 'center',
    color: colorVars['--cl-color-brand-foreground'],
    display: 'none',
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute',
  },
  checkedIndicator: {
    display: {
      default: 'none',
      [stylex.when.siblingBefore(':checked:not(:indeterminate)', checkboxInputMarker)]: 'flex',
    },
  },
  indeterminateIndicator: {
    display: {
      default: 'none',
      [stylex.when.siblingBefore(':indeterminate', checkboxInputMarker)]: 'flex',
    },
  },
});

export const sizes = stylex.create({
  sm: { height: space['3.5'], width: space['3.5'] },
  md: { height: space['4'], width: space['4'] },
});

export const indicatorSizes = stylex.create({
  sm: { fontSize: space['2.5'] },
  md: { fontSize: space['3'] },
});
