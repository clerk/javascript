import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, space } from '../../tokens.stylex';
import { switchInputMarker } from './switch.markers.stylex';

const thumbInset = '2px';
const trackOffHover = `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 24%, transparent)`;
const trackOnHover = `color-mix(in oklab, ${colorVars['--cl-color-brand']}, ${colorVars['--cl-color-brand-foreground']} 12%)`;
const thumbOff = `light-dark(${colorVars['--cl-color-background']}, ${colorVars['--cl-color-foreground']})`;

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    flexShrink: 0,
    position: 'relative',
    verticalAlign: 'middle',
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    margin: 0,
    borderRadius: '9999px',
    borderWidth: 0,
    appearance: 'none',
    backgroundColor: {
      default: colorVars['--cl-color-neutral-alpha-300'],
      ':checked': colorVars['--cl-color-brand'],
      '@media (hover: hover)': {
        ':hover:not(:disabled):checked': trackOnHover,
        ':hover:not(:disabled):not(:checked)': trackOffHover,
      },
    },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    display: 'block',
    flexShrink: 0,
    position: 'relative',
    transitionDuration: durationVars['--cl-duration-base'],
    transitionProperty: 'background-color',
    transitionTimingFunction: 'linear',
    height: '100%',
    width: '100%',
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
  thumb: {
    '--_cl-switch-direction': { default: '1', ':is([dir="rtl"] *)': '-1' },
    '--_cl-switch-press': {
      default: '0px',
      [stylex.when.siblingBefore(':active:not(:disabled)', switchInputMarker)]: 'var(--_cl-switch-stretch)',
      '@media (prefers-reduced-motion: reduce)': {
        default: '0px',
        [stylex.when.siblingBefore(':active:not(:disabled)', switchInputMarker)]: '0px',
      },
    },
    borderRadius: '9999px',
    backgroundColor: {
      default: thumbOff,
      [stylex.when.siblingBefore(':checked', switchInputMarker)]: colorVars['--cl-color-brand-foreground'],
    },
    insetInlineStart: thumbInset,
    pointerEvents: 'none',
    position: 'absolute',
    transform: {
      default: 'none',
      [stylex.when.siblingBefore(':checked', switchInputMarker)]:
        'translateX(calc((var(--_cl-switch-travel) - var(--_cl-switch-press)) * var(--_cl-switch-direction)))',
    },
    transitionDuration: `${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-slow']}, ${durationVars['--cl-duration-slow']}`,
    transitionProperty: {
      default: 'background-color, transform, width',
      '@media (prefers-reduced-motion: reduce)': 'background-color',
    },
    transitionTimingFunction: `linear, ${easingVars['--cl-ease-default']}, ${easingVars['--cl-ease-default']}`,
    height: 'var(--_cl-switch-thumb)',
    top: thumbInset,
    width: 'calc(var(--_cl-switch-thumb) + var(--_cl-switch-press))',
  },
});

export const sizes = stylex.create({
  sm: {
    '--_cl-switch-stretch': '3px',
    '--_cl-switch-thumb': `calc(${space['3.5']} - 2 * ${thumbInset})`,
    '--_cl-switch-travel': `calc(${space['6']} - ${space['3.5']})`,
    height: space['3.5'],
    width: space['6'],
  },
  md: {
    '--_cl-switch-stretch': '4px',
    '--_cl-switch-thumb': `calc(${space['4.5']} - 2 * ${thumbInset})`,
    '--_cl-switch-travel': `calc(${space['8']} - ${space['4.5']})`,
    height: space['4.5'],
    width: space['8'],
  },
});

export const firstLine = stylex.create({
  sm: { marginTop: `max(0px, calc((1lh - ${space['3.5']}) / 2))` },
  md: { marginTop: `max(0px, calc((1lh - ${space['4.5']}) / 2))` },
});
