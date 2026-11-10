import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars } from '../tokens.stylex';

// Focus is marked with a border colour change and a soft box-shadow rather than the
// system focus ring, so a text-entry field reads as a field rather than a control.
const hoverBorderColor = 'light-dark(#bebebe, #525252)';
const focusShadow = '0 0 0 3px light-dark(rgb(23 23 23 / 8%), rgb(255 255 255 / 8%))';
const invalidFocusShadow = `0 0 0 3px ${colorVars['--cl-color-negative-alpha-300']}`;
const readOnlyBackgroundColor = colorVars['--cl-color-neutral-alpha-200'];
const readOnlyBorderColor = `light-dark(color-mix(in oklab, ${colorVars['--cl-color-neutral']} 24%, transparent), ${colorVars['--cl-color-neutral-alpha-200']})`;
const disabledBackgroundColor = `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 5%, transparent)`;

export const inputStyles = stylex.create({
  base: {
    borderColor: {
      default: colorVars['--cl-color-border'],
      ':focus-visible': hoverBorderColor,
      ':focus-visible:where([aria-invalid="true"])': colorVars['--cl-color-negative'],
      ':where([aria-invalid="true"])': colorVars['--cl-color-negative'],
      ':read-only:not(:disabled, [aria-disabled="true"]):not([aria-invalid="true"])': readOnlyBorderColor,
      '@media (hover: hover)': {
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"], :read-only):not([aria-invalid="true"])':
          hoverBorderColor,
      },
    },
    borderStyle: 'solid',
    borderWidth: '1px',
    outline: {
      default: 'none',
      '@media (forced-colors: active)': {
        default: null,
        ':focus-visible': '2px solid CanvasText',
      },
    },
    backgroundColor: {
      default: colorVars['--cl-color-input'],
      ':read-only:not(:disabled, [aria-disabled="true"])': readOnlyBackgroundColor,
    },
    boxShadow: {
      default: null,
      ':focus-visible': focusShadow,
      ':focus-visible:where([aria-invalid="true"])': invalidFocusShadow,
    },
    outlineOffset: {
      default: null,
      '@media (forced-colors: active)': {
        default: null,
        ':focus-visible': '2px',
      },
    },
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      ':focus-visible': durationVars['--cl-duration-instant'],
      ':focus-visible:where([aria-invalid="true"])': durationVars['--cl-duration-base'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"], :read-only):not([aria-invalid="true"])':
          durationVars['--cl-duration-instant'],
      },
    },
    transitionProperty: 'color, background-color, border-color, box-shadow',
    transitionTimingFunction: 'linear',
  },
  group: {
    borderColor: {
      default: colorVars['--cl-color-border'],
      ':where([data-invalid])': colorVars['--cl-color-negative'],
      ':has(input:focus-visible, textarea:focus-visible)': hoverBorderColor,
      ':has(input:focus-visible, textarea:focus-visible):where([data-invalid])': colorVars['--cl-color-negative'],
      ':has(input:read-only:not(:disabled, [aria-disabled="true"])):not([data-invalid])': readOnlyBorderColor,
      '@media (hover: hover)': {
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"], :has(input:read-only)):not([data-invalid])':
          hoverBorderColor,
      },
    },
    borderStyle: 'solid',
    borderWidth: '1px',
    outline: {
      default: 'none',
      '@media (forced-colors: active)': {
        default: null,
        ':has(input:focus-visible, textarea:focus-visible)': '2px solid CanvasText',
      },
    },
    backgroundColor: {
      default: colorVars['--cl-color-input'],
      ':has(input:read-only:not(:disabled, [aria-disabled="true"]))': readOnlyBackgroundColor,
    },
    boxShadow: {
      default: null,
      ':has(input:focus-visible, textarea:focus-visible)': focusShadow,
      ':has(input:focus-visible, textarea:focus-visible):where([data-invalid])': invalidFocusShadow,
    },
    outlineOffset: {
      default: null,
      '@media (forced-colors: active)': {
        default: null,
        ':has(input:focus-visible, textarea:focus-visible)': '2px',
      },
    },
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      ':has(input:focus-visible, textarea:focus-visible)': durationVars['--cl-duration-instant'],
      ':has(input:focus-visible, textarea:focus-visible):where([data-invalid])': durationVars['--cl-duration-base'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"], :has(input:read-only)):not([data-invalid])':
          durationVars['--cl-duration-instant'],
      },
    },
    transitionProperty: 'color, background-color, border-color, box-shadow',
    transitionTimingFunction: 'linear',
  },
  disabled: {
    backgroundColor: disabledBackgroundColor,
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none',
  },
});
