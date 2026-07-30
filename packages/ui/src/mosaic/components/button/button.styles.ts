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

// Every neutral-ish fill in the matrix is one of three steps up the same gray ramp, so
// the neutral family shares one set of values no matter which variant renders it:
//   step 0 — `filled-neutral` at rest, `outline-*`/`ghost-*` hover
//   step 1 — `filled-neutral` hover, `outline-*`/`ghost-*` pressed
//   step 2 — `filled-neutral` pressed
//
// The steps are opacities of a fully-tilted black/white scrim over `transparent`, not
// opaque values, so the fill composites against whatever it sits on. Deliberately not
// `--cl-color-neutral`: that token is a 900 (sRGB 43,43,52), so a percentage of it lands
// lighter than the same percentage of black, and the shortfall shifts with the backdrop,
// which would make the step numbers stop describing what they render. `item` and `avatar` still mix from `--cl-color-neutral`; unifying the
// two on a shared overlay token is a separate, palette-wide change.
//
// StyleX inlines these, so no variable is emitted. They must be local bindings; an
// imported one fails to compile.
const neutralStep0 = `color-mix(in oklab, light-dark(oklch(0 0 0), oklch(1 0 0)) 6%, transparent)`;
const neutralStep1 = `color-mix(in oklab, light-dark(oklch(0 0 0), oklch(1 0 0)) 12%, transparent)`;
const neutralStep2 = `color-mix(in oklab, light-dark(oklch(0 0 0), oklch(1 0 0)) 18%, transparent)`;

// The two opaque filled fills blend toward their own on-fill instead, 12%/18% each.
// Neutral can't — it has no fill of its own to blend from, so it rides
// the opacity ramp above.
const primaryHover = `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 12%)`;
const primaryActive = `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 18%)`;
const negativeHover = `color-mix(in oklab, ${colorVars['--cl-color-negative']}, ${colorVars['--cl-color-negative-foreground']} 12%)`;
const negativeActive = `color-mix(in oklab, ${colorVars['--cl-color-negative']}, ${colorVars['--cl-color-negative-foreground']} 18%)`;

// A disabled button keeps its resting fill and only dims, so every interactive state is
// gated on `:enabled`. The native `disabled` attribute blocks activation but not matching:
// `:hover` and `:active` still apply to a disabled button, and the button stays hit-testable
// so `cursor: not-allowed` renders and a wrapping tooltip still receives the pointer.
//
// Hover also excludes `:active` rather than relying on the cascade. StyleX gives at-rules
// extra priority, so a `@media (hover: hover)` `:hover` outranks a bare `:active` and would
// win while pressing; `:not(:active)` stops it matching instead, which no longer depends on
// how StyleX orders equal-specificity rules. Both selectors stay written out per cell rather
// than hoisted to a const — `@stylexjs/sort-keys` reads a computed key as its identifier name
// and fails the ordering it can no longer see through.

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
    // The size axis fixes the height, so content that outgrows it is clipped at the edge
    // rather than spilling past the button's own box.
    overflow: 'hidden',
    alignItems: 'center',
    // Strips the UA's own control styling — background, border, and the platform focus ring —
    // so what's below is the whole appearance rather than an override of it.
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
    // The press is the one state that has to read as contact rather than a fade, so it
    // lands with no duration at all. Releasing falls back to `fast`, since `:active` stops
    // matching the moment the color starts heading back — an instant press, a soft settle.
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      ':enabled:active': durationVars['--cl-duration-instant'],
    },
    transitionProperty: 'background-color, border-color, color, opacity',
    // Linear, not `--cl-ease-default`: nothing here moves. Color interpolation is already
    // perceptually non-uniform, so an ease on top only makes the midpoint drag, and the
    // house curve's overshoot would extrapolate past the target color for no gain.
    transitionTimingFunction: 'linear',
    // A double-click on a button is a double-click, not a text selection.
    userSelect: 'none',
    // A wrapped label would grow past the fixed height, so the label stays on one line and
    // truncates instead (see `label`).
    whiteSpace: 'nowrap',
  },

  // The ellipsis itself comes from `truncationStyles.singleLine`; this adds the one part
  // that's specific to sitting in the button's row. `minWidth` releases the flex-item floor
  // at `auto` (min-content), without which the box never shrinks to clip. `item` doesn't
  // need it — it releases the floor on the parent, and its text sits in a column.
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

  // A fingertip needs more than the visual sizes give it, so under a coarse pointer the
  // control floors at the target size. Its own atom rather than a per-size override: the
  // floor is one physical constant, and `link` — which is text, not a control — opts out
  // by not receiving it. `minHeight` leaves the fixed height in charge everywhere else.
  touchTarget: {
    minHeight: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
  },
  // Icon buttons are square, so the floor has to reach the inline axis too or the target
  // ends up tall and narrow.
  touchTargetIcon: {
    minWidth: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
  },

  // state / modifiers
  fullWidth: { width: '100%' },
  disabled: { cursor: 'not-allowed', opacity: 0.5 },
});

// variant × color, one entry per cell of the design matrix. Each is self-contained
// so a cell can be read — and tuned — against the spec without tracing shared parts.
// Keys are `<variant>-<color>` so the component can index them directly.
export const variants = stylex.create({
  // The pressed state stays outside the hover media query so no-hover devices, which never
  // match it, still get one.
  'filled-primary': {
    backgroundColor: {
      default: colorVars['--cl-color-primary'],
      ':enabled:active': primaryActive,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active)': primaryHover,
      },
    },
    color: colorVars['--cl-color-primary-foreground'],
  },
  'filled-neutral': {
    backgroundColor: {
      default: neutralStep0,
      ':enabled:active': neutralStep2,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active)': neutralStep1,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  'filled-negative': {
    backgroundColor: {
      default: colorVars['--cl-color-negative'],
      ':enabled:active': negativeActive,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active)': negativeHover,
      },
    },
    color: colorVars['--cl-color-negative-foreground'],
  },

  // The border is `--cl-color-border` in every state — it never transitions, the fill
  // just rises underneath it. That keeps the border opaque throughout, so it can't
  // alpha-fade against an incoming fill, and leaves the border independently themeable.
  // The fill steps are translucent, so how close the two read depends on the backdrop
  // rather than on a fixed lightness gap between them.
  'outline-primary': {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active)': neutralStep0,
      },
    },
    color: colorVars['--cl-color-primary'],
  },
  'outline-neutral': {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active)': neutralStep0,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  'outline-negative': {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active)': neutralStep0,
      },
    },
    color: colorVars['--cl-color-negative'],
  },

  'ghost-primary': {
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active)': neutralStep0,
      },
    },
    color: colorVars['--cl-color-primary'],
  },
  'ghost-neutral': {
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active)': neutralStep0,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  // negative is the one ghost that tints instead of graying, so its pressed step walks
  // its own faded fill toward the negative it carries rather than joining the gray ramp.
  'ghost-negative': {
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': `color-mix(in oklab, ${colorVars['--cl-color-negative-faded']}, ${colorVars['--cl-color-negative']} 8%)`,
      '@media (hover: hover)': {
        default: null,
        ':enabled:hover:not(:active)': colorVars['--cl-color-negative-faded'],
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
