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
import { selectOptionScope } from './select.markers.stylex';

// With `alignItemWithTrigger` the selected option's box lands over the trigger's, so the two
// boxes must inset their text identically: the trigger is a `md` Button (32px, 1px border, 12px
// inline padding, sm text), and the option gets the same 13px from the popup's 1px border, the
// viewport's 2px padding, and its own 10px padding at the same 32px height.

export const value = stylex.create({
  base: {
    flexGrow: 1,
    textAlign: 'start',
    minWidth: 0,
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
    borderColor: 'light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))',
    borderRadius: radiusVars['--cl-radius-lg'],
    borderStyle: 'solid',
    borderWidth: '1px',
    outline: 'none',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px light-dark(oklch(0.2046 0 0 / 12%), transparent),
                0 24px 24px -10px light-dark(oklch(0.2046 0 0 / 4%), transparent)`,
    color: colorVars['--cl-color-card-foreground'],
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    scale: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0.96,
      '@media (prefers-reduced-motion: reduce)': {
        default: 1,
        ':where([data-starting-style], [data-ending-style])': 1,
      },
    },
    transformOrigin: 'var(--cl-anchor-origin, center)',
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, scale',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: `linear, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': `linear, ${easingVars['--cl-ease-exit']}`,
    },
    maxHeight: 'var(--cl-available-height)',
    maxWidth: 'min(18rem, calc(100vw - 2rem))',
    // Never narrower than the trigger, or the trigger's chevron shows from under the overlay.
    minWidth: 'max(10rem, var(--cl-anchor-width, 0px))',
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
    color: colorVars['--cl-color-card-foreground'],
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
    transitionDuration: durationVars['--cl-duration-base'],
    transitionProperty: 'background-color',
    transitionTimingFunction: 'linear',
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
    color: colorVars['--cl-color-neutral-faded'],
    fontWeight: fontWeightVars['--cl-font-normal'],
  },
});

// Rendered on every row and shown only on the selected one, so labels never shift with selection.
export const indicator = stylex.create({
  base: {
    color: colorVars['--cl-color-neutral-faded'],
    visibility: {
      default: 'hidden',
      [stylex.when.ancestor('[data-selected]', selectOptionScope)]: 'visible',
    },
  },
});
