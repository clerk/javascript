import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';
import { selectOptionScope } from './select.markers.stylex';
import { selectVars } from './select.vars.stylex';

const POPUP_ENTER_SCALE = 0.96;
const popupScale = selectVars['--_cl-select-popup-scale'];

// Overlaid, the row's box is the trigger's: the popup widens by its border and the viewport's
// padding and shifts back by the same, and the row repeats the trigger's own insets.

export const value = stylex.create({
  base: {
    flexGrow: 1,
    textAlign: 'start',
    minWidth: 0,
  },
});

// Overlaid, the trigger's open fill is only ever seen crossfading out under the closing popup.
export const trigger = stylex.create({
  aligned: {
    backgroundColor: {
      default: 'transparent',
      ':not([data-disabled]):not([data-pending]):active': colorVars['--cl-color-neutral-alpha-200'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active)': colorVars['--cl-color-neutral-alpha-100'],
      },
    },
  },
});

// So the trigger is already in hover when the popup closes out from over it.
export const triggerRowHovered = stylex.create({
  base: {
    backgroundColor: {
      default: colorVars['--cl-color-neutral-alpha-100'],
      ':not([data-disabled]):not([data-pending]):active': colorVars['--cl-color-neutral-alpha-200'],
    },
  },
});

export const positioner = stylex.create({
  base: {
    outline: 'none',
  },
});

export const popup = stylex.create({
  base: {
    // A real border, not a shadow ring, so it occupies the 1px of layout the alignment counts on.
    borderColor: `light-dark(color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent), color-mix(in oklab, ${colorVars['--cl-color-neutral']} 10%, transparent))`,
    borderRadius: radiusVars['--cl-radius-lg'],
    borderStyle: 'solid',
    borderWidth: '1px',
    outline: 'none',
    backgroundColor: colorVars['--cl-color-background'],
    boxShadow: shadowVars['--cl-shadow-md'],
    color: colorVars['--cl-color-foreground'],
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: 'opacity',
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
    maxHeight: 'var(--cl-available-height)',
    maxWidth: 'min(18rem, calc(100vw - 2rem))',
    // Never narrower than the trigger, or the trigger's chevron shows from under the overlay.
    minWidth: 'max(10rem, var(--cl-anchor-width, 0px))',
  },
  overlaid: {
    translate: `calc(-1px - ${space['0.5']})`,
    minWidth: `max(10rem, calc(var(--cl-anchor-width, 0px) + 2px + 2 * ${space['0.5']}))`,
  },
  scaled: {
    '--_cl-select-popup-scale': {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': POPUP_ENTER_SCALE,
      '@media (prefers-reduced-motion: reduce)': {
        default: 1,
        ':where([data-starting-style], [data-ending-style])': 1,
      },
    },
    scale: popupScale,
    transformOrigin: 'var(--cl-anchor-origin, center)',
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, --_cl-select-popup-scale',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: `${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
  },
});

export const viewport = stylex.create({
  base: {
    padding: space['0.5'],
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
  },
});

export const option = stylex.create({
  base: {
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'none',
    gap: space['2'],
    outline: 'none',
    paddingBlock: space['1.5'],
    paddingInline: '0.625rem',
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':where([data-active])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      '@media (hover: hover)': {
        default: null,
        ':hover': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    color: colorVars['--cl-color-foreground'],
    cursor: { default: 'pointer', ':where([data-disabled])': 'not-allowed' },
    display: 'flex',
    // The viewport is a height-capped flex column; without this the rows squash instead of scrolling.
    flexShrink: 0,
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    opacity: { default: 1, ':where([data-disabled])': 0.5 },
    outlineOffset: 0,
    position: 'relative',
    textAlign: 'start',
    minHeight: space['8'],
    width: '100%',
    // Extends the hit area over the gaps between rows, as Menu items do.
    '::before': {
      insetBlock: `calc(-1 * ${space['0.5']})`,
      insetInline: `calc(-1 * ${space['0.5']})`,
      content: '""',
      position: 'absolute',
    },
  },
  described: {
    paddingBlock: space['2'],
  },
  overlaid: {
    paddingInlineEnd: `calc(1px + ${space['2']})`,
    // A `md` Button's 13px to its text, and the tighter 9px it gives a trailing icon.
    paddingInlineStart: `calc(1px + ${space['3']})`,
  },
});

export const content = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
});

export const description = stylex.create({
  base: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontWeight: fontWeightVars['--cl-font-normal'],
  },
});

// The popup scales about the trigger's center, which is this row's center: undoing it there holds
// the row still.
export const selectedOption = stylex.create({
  counterScale: {
    scale: `calc(1 / ${popupScale})`,
    // About its center, the last row reaches 0.67px past the end of the list — enough to tip the
    // viewport into scrollable. The start edge never is, so the first row needs nothing.
    transformOrigin: { default: null, ':where(:last-child)': '50% 100%' },
  },
});

// Rendered on every row and shown only on the selected one, so labels never shift with selection.
export const indicator = stylex.create({
  base: {
    color: colorVars['--cl-color-foreground-secondary'],
    visibility: {
      default: 'hidden',
      [stylex.when.ancestor('[data-selected]', selectOptionScope)]: 'visible',
    },
  },
});
