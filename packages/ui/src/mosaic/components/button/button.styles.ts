import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';
import { iconScope } from '../icon/icon.markers.stylex';

// Every neutral-ish fill in the matrix is one of three steps up the same gray ramp, so
// the neutral family shares one set of values no matter which variant renders it:
//   step 0 — `--cl-color-neutral`: `filled-neutral` at rest, `outline-*`/`ghost-*` hover
//   step 1 — `filled-neutral` hover, `outline-*`/`ghost-*` pressed
//   step 2 — `filled-neutral` pressed
// StyleX inlines these, so no variable is emitted. They must be local bindings; an
// imported one fails to compile.
const neutralStep1 = `color-mix(in oklab, ${colorVars['--cl-color-neutral']}, ${colorVars['--cl-color-neutral-foreground']} 8%)`;
const neutralStep2 = `color-mix(in oklab, ${colorVars['--cl-color-neutral']}, ${colorVars['--cl-color-neutral-foreground']} 16%)`;

// Each filled fill blends toward its own on-fill: 12%/24% for primary, 8%/16% for
// negative and for neutral, whose foreground is dark rather than light.
const primaryHover = `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 12%)`;
const primaryActive = `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 20%)`;
const negativeHover = `color-mix(in oklab, ${colorVars['--cl-color-negative']}, ${colorVars['--cl-color-negative-foreground']} 8%)`;
const negativeActive = `color-mix(in oklab, ${colorVars['--cl-color-negative']}, ${colorVars['--cl-color-negative-foreground']} 16%)`;

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
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontWeight: fontWeightVars['--cl-font-medium'],
    justifyContent: 'center',
    outlineOffset: '2px',
    // The press is the one state that has to read as contact rather than a fade, so it
    // lands with no duration at all. Releasing falls back to `fast`, since `:active` stops
    // matching the moment the color starts heading back — an instant press, a soft settle.
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      ':active': durationVars['--cl-duration-instant'],
    },
    transitionProperty: 'background-color, border-color, color, opacity',
    // Linear, not `--cl-ease-default`: nothing here moves. Color interpolation is already
    // perceptually non-uniform, so an ease on top only makes the midpoint drag, and the
    // house curve's overshoot would extrapolate past the target color for no gain.
    transitionTimingFunction: 'linear',
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

  // state / modifiers
  fullWidth: { width: '100%' },
  disabled: { cursor: 'not-allowed', opacity: 0.5, pointerEvents: 'none' },
});

// variant × color, one entry per cell of the design matrix. Each is self-contained
// so a cell can be read — and tuned — against the spec without tracing shared parts.
// Keys are `<variant>-<color>` so the component can index them directly.
export const variants = stylex.create({
  // Hover excludes `:active` rather than relying on the cascade. StyleX gives at-rules
  // extra priority, so a `@media (hover: hover)` `:hover` outranks a bare `:active` and
  // would win while pressing; `:not(:active)` stops it matching instead, which no longer
  // depends on how StyleX orders equal-specificity rules. `:active` stays outside the
  // media query so no-hover devices, which never match it, still get a pressed state.
  'filled-primary': {
    backgroundColor: {
      default: colorVars['--cl-color-primary'],
      ':active': primaryActive,
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': primaryHover,
      },
    },
    color: colorVars['--cl-color-primary-foreground'],
  },
  'filled-neutral': {
    backgroundColor: {
      default: colorVars['--cl-color-neutral'],
      ':active': neutralStep2,
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': neutralStep1,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  'filled-negative': {
    backgroundColor: {
      default: colorVars['--cl-color-negative'],
      ':active': negativeActive,
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': negativeHover,
      },
    },
    color: colorVars['--cl-color-negative-foreground'],
  },

  // The border is `--cl-color-border` in every state — it never transitions, the fill
  // just rises underneath it. That keeps the border opaque throughout, so it can't
  // alpha-fade against an incoming fill, and leaves the border independently themeable.
  // It sits one step darker than the hover fill, and lands within 0.01 L of the pressed
  // fill, so a pressed outline button still reads as one shape.
  'outline-primary': {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': colorVars['--cl-color-neutral'],
      },
    },
    color: colorVars['--cl-color-primary'],
  },
  'outline-neutral': {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': colorVars['--cl-color-neutral'],
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  'outline-negative': {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': colorVars['--cl-color-neutral'],
      },
    },
    color: colorVars['--cl-color-negative'],
  },

  'ghost-primary': {
    backgroundColor: {
      default: 'transparent',
      ':active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': colorVars['--cl-color-neutral'],
      },
    },
    color: colorVars['--cl-color-primary'],
  },
  'ghost-neutral': {
    backgroundColor: {
      default: 'transparent',
      ':active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': colorVars['--cl-color-neutral'],
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  // negative is the one ghost that tints instead of graying, so its pressed step walks
  // its own faded fill toward the negative it carries rather than joining the gray ramp.
  'ghost-negative': {
    backgroundColor: {
      default: 'transparent',
      ':active': `color-mix(in oklab, ${colorVars['--cl-color-negative-faded']}, ${colorVars['--cl-color-negative']} 8%)`,
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': colorVars['--cl-color-negative-faded'],
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
    textDecorationLine: { default: 'none', ':hover': 'underline' },
    textUnderlineOffset: '2px',
    height: 'auto',
  },
  'link-neutral': {
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-neutral-foreground'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
    textDecorationLine: { default: 'none', ':hover': 'underline' },
    textUnderlineOffset: '2px',
    height: 'auto',
  },
  'link-negative': {
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-negative'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
    textDecorationLine: { default: 'none', ':hover': 'underline' },
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
