import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  fontFamilyVars,
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

// An icon rests a step below its label and comes up to it on hover, so the label leads and the icon
// reads as supporting. Each is an opaque faded form of the cell's own text color, not an alpha of
// it: a translucent icon would pick up whatever sits behind the button and drift per surface.
//
// The achromatic foregrounds (`primary`, `neutral-foreground`) share the house faded gray. The two
// that carry hue fade toward the tint that belongs to them, and the light-on-fill pairs fade toward
// their own fill, which is the only backdrop they can ever sit on.
const iconFadedNeutral = colorVars['--cl-color-neutral-faded'];
const iconFadedNegative = `color-mix(in oklab, ${colorVars['--cl-color-negative']}, ${colorVars['--cl-color-negative-faded']} 50%)`;
const iconFadedOnPrimary = `color-mix(in oklab, ${colorVars['--cl-color-primary-foreground']}, ${colorVars['--cl-color-primary']} 40%)`;
const iconFadedOnNegative = `color-mix(in oklab, ${colorVars['--cl-color-negative-foreground']}, ${colorVars['--cl-color-negative']} 40%)`;

// Interactive states are gated on `:not([data-disabled])`: the button stays hit-testable while
// disabled so `cursor: not-allowed` renders and a wrapping tooltip still gets the pointer, which
// means the states have to be suppressed by selector. Disabled keeps its resting fill and only dims.
//
// The gate is the reflected attribute rather than `:enabled`, because `focusableWhenDisabled` drops
// the native `disabled` attribute to keep the button in the tab order. `data-disabled` is emitted
// for both, so one selector covers them.
//
// Hover also excludes `:active` explicitly — StyleX gives at-rules extra priority, so a
// `@media (hover: hover)` `:hover` would outrank a bare `:active` and win while pressing.
// Both selectors are written out per cell rather than hoisted to a const: `@stylexjs/sort-keys`
// reads a computed key as its identifier name and fails the ordering.
//
// `:active` also excludes `[data-pending]`, which `SubmitButton` sets while its action runs. That
// button drops its pointer events, which is enough for the pointer, but a focused button still
// takes `:active` from the keyboard — space and enter — and a pending button shouldn't flash a
// pressed fill for a press it ignores.
//
// `[data-open]` takes the pressed fill too, so a button acting as a disclosure trigger stays
// visibly engaged for as long as its surface is open. Disclosure primitives set it on the
// trigger (`popover-trigger.tsx` and friends); a plain button never carries it. It is excluded
// from hover for the same reason `:active` is — otherwise moving the pointer over an open
// trigger would lift it back to the lighter hover step.

export const styles = stylex.create({
  base: {
    // Handed to `Icon`, which needs its own copy: transitions don't inherit, so without this
    // the icon would still be catching up 0.1s after the button itself has landed.
    '--_cl-icon-duration': {
      default: durationVars['--cl-duration-base'],
      ':not([data-disabled]):active': durationVars['--cl-duration-instant'],
      ':not([data-disabled]):hover': durationVars['--cl-duration-instant'],
    },
    borderColor: 'transparent',
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    alignItems: 'center',
    // Strips UA control styling so what's below is the whole appearance, not an override.
    appearance: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    // A button is sized by its own axis, not by whatever row it lands in.
    flexShrink: 0,
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    justifyContent: 'center',
    // The duration a state carries governs the transition INTO it, so one declaration per
    // state gives an instant arrival and a 0.15s settle out. Instant because a hover or a
    // press confirms something the user just did, and confirmation cannot lag; see `motion.md`.
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      ':not([data-disabled]):active': durationVars['--cl-duration-instant'],
      ':not([data-disabled]):hover': durationVars['--cl-duration-instant'],
    },
    transitionProperty: 'background-color, border-color, color, opacity, text-decoration-color',
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
    borderRadius: radiusVars['--cl-radius-md'],
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
//
// `--_cl-icon-color` lives per cell rather than once in `base`: StyleX resolves a property to the
// last style that declares it, so a cell setting it would drop `base`'s hover branch wholesale
// rather than merge with it. `Icon` reads the var (`icon.styles.ts`) — StyleX can't emit a
// descendant rule, so the value crosses the element boundary as a custom property.
export const variants = stylex.create({
  // The pressed state stays outside the hover media query so no-hover devices still get one.
  'filled-primary': {
    '--_cl-icon-color': {
      default: iconFadedOnPrimary,
      ':not([data-disabled])[data-open]': colorVars['--cl-color-primary-foreground'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-primary-foreground'],
      },
    },
    backgroundColor: {
      default: colorVars['--cl-color-primary'],
      ':not([data-disabled]):not([data-pending]):active': primaryActive,
      ':not([data-disabled])[data-open]': primaryActive,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active):not([data-open])': primaryHover,
      },
    },
    color: colorVars['--cl-color-primary-foreground'],
  },
  'filled-neutral': {
    '--_cl-icon-color': {
      default: iconFadedNeutral,
      ':not([data-disabled])[data-open]': colorVars['--cl-color-neutral-foreground'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-neutral-foreground'],
      },
    },
    backgroundColor: {
      default: neutralStep0,
      ':not([data-disabled]):not([data-pending]):active': neutralStep2,
      ':not([data-disabled])[data-open]': neutralStep2,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active):not([data-open])': neutralStep1,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  'filled-negative': {
    '--_cl-icon-color': {
      default: iconFadedOnNegative,
      ':not([data-disabled])[data-open]': colorVars['--cl-color-negative-foreground'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-negative-foreground'],
      },
    },
    backgroundColor: {
      default: colorVars['--cl-color-negative'],
      ':not([data-disabled]):not([data-pending]):active': negativeActive,
      ':not([data-disabled])[data-open]': negativeActive,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active):not([data-open])': negativeHover,
      },
    },
    color: colorVars['--cl-color-negative-foreground'],
  },

  // The border is `--cl-color-border` in every state — it never transitions, the fill just
  // rises underneath it. Keeps the border opaque so it can't alpha-fade against an incoming
  // fill, and leaves it independently themeable.
  'outline-primary': {
    '--_cl-icon-color': {
      default: iconFadedNeutral,
      ':not([data-disabled])[data-open]': colorVars['--cl-color-primary'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-primary'],
      },
    },
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':not([data-disabled]):not([data-pending]):active': neutralStep1,
      ':not([data-disabled])[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-primary'],
  },
  'outline-neutral': {
    '--_cl-icon-color': {
      default: iconFadedNeutral,
      ':not([data-disabled])[data-open]': colorVars['--cl-color-neutral-foreground'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-neutral-foreground'],
      },
    },
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':not([data-disabled]):not([data-pending]):active': neutralStep1,
      ':not([data-disabled])[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  'outline-negative': {
    '--_cl-icon-color': {
      default: iconFadedNegative,
      ':not([data-disabled])[data-open]': colorVars['--cl-color-negative'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-negative'],
      },
    },
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: {
      default: 'transparent',
      ':not([data-disabled]):not([data-pending]):active': neutralStep1,
      ':not([data-disabled])[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-negative'],
  },

  'ghost-primary': {
    '--_cl-icon-color': {
      default: iconFadedNeutral,
      ':not([data-disabled])[data-open]': colorVars['--cl-color-primary'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-primary'],
      },
    },
    backgroundColor: {
      default: 'transparent',
      ':not([data-disabled]):not([data-pending]):active': neutralStep1,
      ':not([data-disabled])[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-primary'],
  },
  'ghost-neutral': {
    '--_cl-icon-color': {
      default: iconFadedNeutral,
      ':not([data-disabled])[data-open]': colorVars['--cl-color-neutral-foreground'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-neutral-foreground'],
      },
    },
    backgroundColor: {
      default: 'transparent',
      ':not([data-disabled]):not([data-pending]):active': neutralStep1,
      ':not([data-disabled])[data-open]': neutralStep1,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active):not([data-open])': neutralStep0,
      },
    },
    color: colorVars['--cl-color-neutral-foreground'],
  },
  // The one ghost that tints instead of graying, so its pressed step walks its own faded
  // fill toward the negative it carries rather than joining the gray ramp.
  'ghost-negative': {
    '--_cl-icon-color': {
      default: iconFadedNegative,
      ':not([data-disabled])[data-open]': colorVars['--cl-color-negative'],
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-negative'],
      },
    },
    backgroundColor: {
      default: 'transparent',
      ':not([data-disabled]):not([data-pending]):active': `color-mix(in oklab, ${colorVars['--cl-color-negative-faded']}, ${colorVars['--cl-color-negative']} 8%)`,
      ':not([data-disabled])[data-open]': `color-mix(in oklab, ${colorVars['--cl-color-negative-faded']}, ${colorVars['--cl-color-negative']} 8%)`,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover:not(:active):not([data-open])': colorVars['--cl-color-negative-faded'],
      },
    },
    color: colorVars['--cl-color-negative'],
  },

  // link opts out of the box the size axis sets — it reads as text, not a control. Per-side
  // zeros for the same reason `shapeSquare` uses them.
  //
  // The underline is always drawn and only its color moves: `text-decoration-line` is a keyword,
  // so toggling it cannot tween and the exit would snap where every other property fades. A
  // transparent decoration paints nothing and never participates in layout.
  'link-primary': {
    '--_cl-icon-color': {
      default: iconFadedNeutral,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-primary'],
      },
    },
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-primary'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
    textDecorationColor: { default: 'transparent', ':not([data-disabled]):hover': 'currentColor' },
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
    height: 'auto',
  },
  'link-neutral': {
    '--_cl-icon-color': {
      default: iconFadedNeutral,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-neutral-foreground'],
      },
    },
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-neutral-foreground'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
    textDecorationColor: { default: 'transparent', ':not([data-disabled]):hover': 'currentColor' },
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
    height: 'auto',
  },
  'link-negative': {
    '--_cl-icon-color': {
      default: iconFadedNegative,
      '@media (hover: hover)': {
        default: null,
        ':not([data-disabled]):hover': colorVars['--cl-color-negative'],
      },
    },
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-negative'],
    paddingInlineEnd: 0,
    paddingInlineStart: 0,
    textDecorationColor: { default: 'transparent', ':not([data-disabled]):hover': 'currentColor' },
    textDecorationLine: 'underline',
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
