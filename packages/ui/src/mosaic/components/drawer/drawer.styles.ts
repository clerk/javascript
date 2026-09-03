import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, radiusVars, space } from '../../tokens.stylex';

// The dialog's scrim, and the nested value a dialog paints over a `profile` or a `card` — see
// `dialog.styles.ts` for the composite arithmetic. A sheet opening from inside a profile dialog is
// the same relationship as a prompt opening there, and takes the same scrim.
const BASE_SCRIM = 'color-mix(in oklab, oklch(0 0 0) 40%, transparent)';
const NESTED_SCRIM = 'color-mix(in oklab, oklch(0 0 0) 46.67%, transparent)';

/** The live drag delta and the resting snap offset the headless layer writes; the sheet rides both. */
const SWIPE = 'var(--cl-drawer-swipe-movement-y, 0px)';
const SNAP = 'var(--cl-drawer-snap-point-offset, 0px)';
/** 0..1 dismiss progress of a drag; the scrim thins with it. */
const PROGRESS = 'var(--cl-drawer-swipe-progress, 0)';
/** 0.1..1 from release velocity; a flick leaves faster than a slow drag. */
const STRENGTH = 'var(--cl-drawer-swipe-strength, 1)';
/**
 * How far the sheet extends below the screen. A drag past the open position rubber-bands the sheet
 * upward, and without this the scrim would show beneath its bottom edge. The extra is padding,
 * pulled back off-screen by the matching negative margin, so the content still ends its usual
 * distance above the visible edge.
 */
const BLEED = space['24'];

export const styles = stylex.create({
  backdrop: {
    inset: 0,
    backgroundColor: BASE_SCRIM,
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
      ':where([data-swiping])': `calc(1 - ${PROGRESS})`,
    },
    position: 'fixed',
    // The scrim answers the tap: it lands first, and the sheet arrives into a dimmed page. While a
    // drag is in progress it follows the finger instead, with no easing in the way.
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      ':where([data-swiping])': '0s',
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: 'linear',
  },

  backdropNested: {
    backgroundColor: NESTED_SCRIM,
  },

  /**
   * The fixed box the sheet is aligned in: bottom edge, full width. The headless viewport is the
   * `FloatingOverlay` that owns the scroll lock; this only lays the popup out inside it.
   */
  viewport: {
    inset: 0,
    // The sheet bleeds below the box and enters from below it; neither may make the box scroll.
    overflow: 'clip',
    alignItems: 'end',
    display: 'grid',
    justifyItems: 'stretch',
    position: 'fixed',
  },

  /**
   * The sheet. The prompt's surface — same background, shadow ring and padding — flush with the
   * sides and the bottom, rounded at the top only, and never wider than the screen.
   *
   * It moves on `translate`, composed from what the headless layer writes: the resting snap offset
   * plus the live drag delta. Closed, it sits a full height below the box — completely out of view
   * — and slides up on open. During a drag the transition is off so it follows the finger 1:1; on
   * release the exit is scaled by the flick's strength, so a decisive swipe leaves faster than a
   * slow drag past the threshold.
   */
  popup: {
    borderColor: { default: null, '@media (forced-colors: active)': 'CanvasText' },
    borderStyle: { default: null, '@media (forced-colors: active)': 'solid' },
    borderWidth: { default: null, '@media (forced-colors: active)': '1px' },
    outline: 'none',
    overscrollBehavior: 'contain',
    backgroundColor: colorVars['--cl-color-card'],
    borderStartEndRadius: radiusVars['--cl-radius-2xl'],
    borderStartStartRadius: radiusVars['--cl-radius-2xl'],
    // No drop shadow — the sheet sits on the screen edge, so there is nothing for it to float over.
    // The hairline ring stays: a faint dark edge in light, and the light edge that separates a dark
    // sheet from a dark page.
    boxShadow: `0 0 0 1px light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))`,
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    marginBlockEnd: `calc(-1 * ${BLEED})`,
    // Tall content scrolls inside the sheet; the drag engine yields to inner scroll away from the
    // top, so the two do not fight over the same gesture.
    maxBlockSize: `calc(100% - ${space['12']} + ${BLEED})`,
    overflowWrap: 'anywhere',
    // The bottom keeps clear of the home indicator, and carries the bleed. Inline padding belongs to
    // `content`, so the grip can span the sheet's own width.
    paddingBlockEnd: `calc(env(safe-area-inset-bottom, 0px) + ${BLEED})`,
    transitionDuration: {
      default: durationVars['--cl-duration-slow'],
      ':where([data-ending-style])': `calc(${durationVars['--cl-duration-base']} * ${STRENGTH})`,
      ':where([data-swiping])': '0s',
    },
    transitionProperty: {
      default: 'translate',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    // A surface this size should land rather than settle on the way in; on the way out the plain
    // `ease-out` the prompt's sheet uses, for the same reason — over a full height, the exit
    // curve's slow start reads as lag.
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': 'ease-out',
    },
    // Never above the bleed: whatever the drag engine hands over, the scrim cannot show beneath.
    translate: {
      default: `0 max(calc(${SNAP} + ${SWIPE}), calc(-1 * ${BLEED}))`,
      ':where([data-starting-style], [data-ending-style])': '0 100%',
    },
    // A mouse drag that crosses text would otherwise select it, and the engine will not start a
    // drag while a selection stands inside the sheet — every pull after that would feel dead until
    // a click cleared it. `data-swiping` lands on pointerdown, before the first move.
    userSelect: {
      default: null,
      ':where([data-swiping])': 'none',
    },
    overflowY: 'auto',
  },

  /** The drag affordance: a short pill, centred, with a hit area taller than it looks. */
  handle: {
    placeItems: 'center',
    display: 'grid',
    flexShrink: 0,
    paddingBlockEnd: space['2.5'],
    paddingBlockStart: space['3'],
    userSelect: 'none',
  },
  grip: {
    borderRadius: radiusVars['--cl-radius-full'],
    backgroundColor: colorVars['--cl-color-border'],
    blockSize: space['1.5'],
    inlineSize: space['11.5'],
  },

  /** The sheet's content, under the grip. */
  content: {
    padding: space['4'],
    gap: space['3'],
    display: 'flex',
    flexDirection: 'column',
  },
});
