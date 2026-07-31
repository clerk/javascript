import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  fontWeightVars,
  radiusVars,
  space,
  targetVars,
  typeScaleVars,
} from '../../tokens.stylex';
import { iconScope } from '../icon/icon.markers.stylex';

// Neutral fills are three steps up one gray ramp, shared across variants:
//   step 0 — `filled-neutral` rest, `outline-*`/`ghost-*` hover
//   step 1 — `filled-neutral` hover, `outline-*`/`ghost-*` pressed
//   step 2 — `filled-neutral` pressed
//
// Scrim opacities over `transparent`, so they composite against any backdrop. Not
// `--cl-color-neutral`: it's a 900, so a percentage of it lands lighter than the same
// percentage of black by an amount that shifts with the backdrop.
//
// TODO: codify this %-mix scale as shared tokens once more components adopt these
// shades — `item` and `avatar` still mix from `--cl-color-neutral`, and unifying them
// is a palette-wide change.
//
// Must be local bindings — StyleX inlines them; an imported one fails to compile.
const neutralStep0 = `color-mix(in oklab, light-dark(oklch(0 0 0), oklch(1 0 0)) 6%, transparent)`;
const neutralStep1 = `color-mix(in oklab, light-dark(oklch(0 0 0), oklch(1 0 0)) 12%, transparent)`;
const neutralStep2 = `color-mix(in oklab, light-dark(oklch(0 0 0), oklch(1 0 0)) 18%, transparent)`;

// Opaque fills blend toward their own on-fill at the same 12%/18%. Neutral has no fill
// to blend from, so it rides the opacity ramp above.
const primaryHover = `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 12%)`;
const primaryActive = `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 18%)`;
const negativeHover = `color-mix(in oklab, ${colorVars['--cl-color-negative']}, ${colorVars['--cl-color-negative-foreground']} 12%)`;
const negativeActive = `color-mix(in oklab, ${colorVars['--cl-color-negative']}, ${colorVars['--cl-color-negative-foreground']} 18%)`;

// Interactive states are gated on `:enabled`: the `disabled` attribute blocks activation but
// not matching, and the button stays hit-testable so `cursor: not-allowed` renders and a
// wrapping tooltip still gets the pointer. Disabled keeps its resting fill and only dims.
//
// Hover also excludes `:active` explicitly — StyleX gives at-rules extra priority, so a
// `@media (hover: hover)` `:hover` would outrank a bare `:active` and win while pressing.
// Both selectors are written out per cell rather than hoisted to a const: `@stylexjs/sort-keys`
// reads a computed key as its identifier name and fails the ordering.
//
// `[data-open]` takes the pressed fill too, so a button acting as a disclosure trigger stays
// visibly engaged for as long as its surface is open. Disclosure primitives set it on the
// trigger (`popover-trigger.tsx` and friends); a plain button never carries it. It is excluded
// from hover for the same reason `:active` is — otherwise moving the pointer over an open
// trigger would lift it back to the lighter hover step.

export const styles = stylex.create({
  base: {
    borderColor: 'transparent',
    borderRadius: radiusVars['--cl-radius-control'],
    borderStyle: 'solid',
    borderWidth: '1px',
    // one ring for every color and variant — it reads as focus, not as the button's color
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}`,
    },
    alignItems: 'center',
    // Strips UA control styling so what's below is the whole appearance, not an override.
    appearance: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'inline-flex',
    // A button is sized by its own axis, not by whatever row it lands in.
    flexShrink: 0,
    fontFamily: 'inherit',
    fontWeight: fontWeightVars['--cl-font-medium'],
    justifyContent: 'center',
    outlineOffset: '2px',
    // The press reads as contact, not a fade, so it lands instantly. Release falls back to
    // `fast` — `:active` stops matching as the color heads back. Instant press, soft settle.
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      ':enabled:active': durationVars['--cl-duration-instant'],
    },
    transitionProperty: 'background-color, border-color, color, opacity',
    // Linear, not `--cl-ease-default`: nothing here moves. An ease on already non-uniform
    // color interpolation just drags the midpoint, and the house curve's overshoot would
    // extrapolate past the target color.
    transitionTimingFunction: 'linear',
    // A double-click on a button is a double-click, not a text selection.
    userSelect: 'none',
    // A wrapped label would outgrow the fixed height, so it truncates instead (see `label`).
    whiteSpace: 'nowrap',
  },

  // The ellipsis comes from `truncationStyles.singleLine`; this adds the part specific to
  // sitting in the button's row — releasing the flex-item min-width floor, without which
  // the box never shrinks enough to clip. `item` releases the floor on the parent instead.
  label: {
    minWidth: 0,
  },

  // shape — icon buttons zero their inline padding; width tracks the height. Longhands because
  // StyleX ranks a longhand above a shorthand, so `paddingInline` would lose to what `sizes` sets.
  shapeSquare: {
    borderRadius: radiusVars['--cl-radius-control'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
  },
  shapeCircle: {
    borderRadius: radiusVars['--cl-radius-full'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
  },

  // Under a coarse pointer the hit area floors at the target size — grown by an overlay
  // rather than by `min-height`, so the button keeps the size its axis gives it and only the
  // region answering a tap gets bigger. Its own atom rather than a per-size override: the
  // floor is one physical constant, and `link` — text, not a control — opts out by not
  // receiving it.
  //
  // The insets resolve against the button's own box, so one expression covers every size:
  // the overlay lands at exactly the target height whatever the shortfall, and clamps to the
  // button's bounds once the control is already past the floor. `position` is scoped to the
  // media query too — a fine pointer generates no overlay, so it shouldn't take on the
  // stacking change either.
  touchTarget: {
    position: { default: null, '@media (pointer: coarse)': 'relative' },
    '::after': {
      insetBlock: `min(0px, (100% - ${targetVars['--cl-target-coarse']}) / 2)`,
      // Text buttons are already past the floor inline — growing that axis too would only
      // reach into a neighbor's space for nothing.
      insetInline: 0,
      content: { default: null, '@media (pointer: coarse)': '""' },
      position: 'absolute',
    },
  },
  // Icon buttons are square, so the floor has to reach the inline axis as well or the region
  // ends up tall and narrow.
  touchTargetIcon: {
    '::after': {
      insetInline: `min(0px, (100% - ${targetVars['--cl-target-coarse']}) / 2)`,
    },
  },

  // state / modifiers
  fullWidth: { width: '100%' },
  disabled: { cursor: 'not-allowed', opacity: 0.5 },
});

// variant × color, one entry per cell of the design matrix, keyed `<variant>-<color>` so the
// component can index directly. Each cell is self-contained so it reads — and tunes — against
// the spec without tracing shared parts.
export const variants = stylex.create({
  // The pressed state stays outside the hover media query so no-hover devices still get one.
  'filled-primary': {
    backgroundColor: {
      default: colorVars['--cl-color-primary'],
      ':enabled:active': primaryActive,
      ':enabled[data-open]': primaryActive,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active):not([data-open])': primaryHover,
      },
    },
    color: colorVars['--cl-color-primary-foreground'],
  },
  'filled-neutral': {
    backgroundColor: {
      default: neutralStep0,
      ':enabled:active': neutralStep2,
      ':enabled[data-open]': neutralStep2,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active):not([data-open])': neutralStep1,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  'filled-negative': {
    backgroundColor: {
      default: colorVars['--cl-color-negative'],
      ':enabled:active': negativeActive,
      ':enabled[data-open]': negativeActive,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active):not([data-open])': negativeHover,
      },
    },
    color: colorVars['--cl-color-negative-foreground'],
  },

  // The border is `--cl-color-border` in every state — it never transitions, the fill just
  // rises underneath it. Keeps the border opaque so it can't alpha-fade against an incoming
  // fill, and leaves it independently themeable.
  'outline-primary': {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      ':enabled[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-primary'],
  },
  'outline-neutral': {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      ':enabled[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  'outline-negative': {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      ':enabled[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-negative'],
  },

  'ghost-primary': {
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      ':enabled[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-primary'],
  },
  'ghost-neutral': {
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      ':enabled[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  // The one ghost that tints instead of graying, so its pressed step walks its own faded
  // fill toward the negative it carries rather than joining the gray ramp.
  'ghost-negative': {
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': `color-mix(in oklab, ${colorVars['--cl-color-negative-faded']}, ${colorVars['--cl-color-negative']} 8%)`,
      ':enabled[data-open]': `color-mix(in oklab, ${colorVars['--cl-color-negative-faded']}, ${colorVars['--cl-color-negative']} 8%)`,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active):not([data-open])': colorVars['--cl-color-negative-faded'],
      },
    },
    color: colorVars['--cl-color-negative'],
  },

  // link opts out of the box the size axis sets — it reads as text, not a control. Per-side
  // zeros for the same reason `shapeSquare` uses them.
  'link-primary': {
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-primary'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
    textDecorationLine: { default: 'none', ':enabled:hover': 'underline' },
    textUnderlineOffset: '2px',
    height: 'auto',
  },
  'link-neutral': {
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-neutral-foreground'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
    textDecorationLine: { default: 'none', ':enabled:hover': 'underline' },
    textUnderlineOffset: '2px',
    height: 'auto',
  },
  'link-negative': {
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-negative'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
    textDecorationLine: { default: 'none', ':enabled:hover': 'underline' },
    textUnderlineOffset: '2px',
    height: 'auto',
  },
});

// size — height-driven; padding sets only the inline axis. An icon's side tightens to the inset
// it already has above and below, `(height - icon) / 2`, so it sits in a square cell: 8px at md
// and lg exactly, and at sm too, where the ideal 7px is off the 4px scale.
//
/* eslint-disable @stylexjs/no-lookahead-selectors -- every browser this package builds for
   supports `:has()` (`tsdown.mosaic.config.mts`); an older one keeps the untightened padding. */
export const sizes = stylex.create({
  sm: {
    // sm runs a step tighter than md on every inline measure, gap included
    gap: space['1.5'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    paddingInlineEnd: {
      default: space['2.5'],
      [stylex.when.descendant("[data-icon='inline-end']", iconScope)]: space['2'],
    },
    paddingInlineStart: {
      default: space['2.5'],
      [stylex.when.descendant("[data-icon='inline-start']", iconScope)]: space['2'],
    },
    height: space['7'],
  },
  md: {
    gap: space['2'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    paddingInlineEnd: {
      default: space['3'],
      [stylex.when.descendant("[data-icon='inline-end']", iconScope)]: space['2'],
    },
    paddingInlineStart: {
      default: space['3'],
      [stylex.when.descendant("[data-icon='inline-start']", iconScope)]: space['2'],
    },
    height: space['8'],
  },
  lg: {
    gap: space['2'],
    fontSize: typeScaleVars['--cl-text-base-size'],
    lineHeight: typeScaleVars['--cl-text-base-leading'],
    paddingInlineEnd: {
      default: space['3'],
      [stylex.when.descendant("[data-icon='inline-end']", iconScope)]: space['2'],
    },
    paddingInlineStart: {
      default: space['3'],
      [stylex.when.descendant("[data-icon='inline-start']", iconScope)]: space['2'],
    },
    height: space['9'],
  },
});
/* eslint-enable @stylexjs/no-lookahead-selectors */

export const iconSizes = stylex.create({
  sm: { width: space['7'] },
  md: { width: space['8'] },
  lg: { width: space['9'] },
});
