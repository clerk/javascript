import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars } from '../tokens.stylex';

// Focus is marked with a border colour change and a soft box-shadow rather than the
// system focus ring, so a text-entry field reads as a field rather than a control.
const hoverBorderColor = 'light-dark(#bebebe, #525252)';
const focusShadow = '0 0 0 3px light-dark(rgb(23 23 23 / 8%), rgb(255 255 255 / 8%))';
const invalidFocusShadow = `0 0 0 3px light-dark(
  color-mix(in oklab, ${colorVars['--cl-color-negative']} 12%, transparent),
  color-mix(in oklab, ${colorVars['--cl-color-negative']} 15%, transparent)
)`;
const disabledBackgroundColor = `color-mix(in oklab, ${colorVars['--cl-color-primary']} 5%, transparent)`;

export const inputStyles = stylex.create({
  base: {
    borderColor: {
      default: colorVars['--cl-color-border'],
      ':focus-visible': hoverBorderColor,
      ':focus-visible:where([aria-invalid="true"])': colorVars['--cl-color-negative'],
      ':where([aria-invalid="true"])': colorVars['--cl-color-negative'],
      '@media (hover: hover)': {
        ':hover:not([aria-invalid="true"])': hoverBorderColor,
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
    backgroundColor: colorVars['--cl-color-input'],
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
      ':focus-visible': durationVars['--cl-duration-fast'],
    },
    transitionProperty: 'color, background-color, border-color, box-shadow',
    transitionTimingFunction: {
      default: 'linear',
      ':focus-visible': `linear, linear, linear, ${easingVars['--cl-ease-default']}`,
    },
  },
  disabled: {
    backgroundColor: disabledBackgroundColor,
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none',
  },
});
