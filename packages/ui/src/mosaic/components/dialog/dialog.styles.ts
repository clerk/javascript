import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  // The scrim. A black wash over `transparent` rather than a percentage of a neutral
  // token: it composites over whatever the host app renders, so the same value reads
  // consistently on any page.
  //
  // A stacked dialog paints its OWN scrim rather than deferring to the one beneath it, so each
  // level reads as a step further from the page. It is lighter than the base because the two
  // COMPOSITE: alpha over alpha is `1 − (1 − a)(1 − b)`, so the nested value is solved for the
  // intended total rather than picked by eye — `1 − 0.32/0.6 = 0.4667` lands two levels on 0.68.
  // Exact for a two-deep stack, which is the shape that exists; a third level would go darker
  // still, and wants its own value rather than a third application of this one.
  // `data-nested` comes from the headless layer.
  backdrop: {
    inset: 0,
    backgroundColor: {
      default: 'color-mix(in oklab, oklch(0 0 0) 40%, transparent)',
      ':where([data-nested])': 'color-mix(in oklab, oklch(0 0 0) 46.67%, transparent)',
    },
    position: 'fixed',
  },

  // Centering track inside the headless `FloatingOverlay`, which owns the fixed
  // positioning and the scroll lock. `min-height: 100%` rather than a fixed height so
  // a popup taller than the viewport scrolls the overlay instead of being clipped.
  //
  // The gap between a dialog and the edge of the screen is a FIXED INSET, not a percentage.
  // A percentage margin is asymmetric between the axes and the asymmetry tracks the viewport's
  // aspect ratio: at 90vw/90dvh a 1920x1080 screen leaves 96px at the sides and 54px top and
  // bottom, an ultrawide closer to 172 against 72, and a phone inverts it — 20px at the sides
  // against 42px. The surround never reads as a frame and its character changes per device. One
  // inset is even on all four sides everywhere, and steps up with available room rather than
  // with aspect ratio.
  //
  // Published as a var because the panel's height derives from it (`sizes.panel`); custom
  // properties inherit, so the popup reads it without plumbing. Widths need no such math —
  // the popup is `width: 100%` inside this padding, so the inset is already subtracted.
  //
  // The two queries are deliberately NON-OVERLAPPING. Overlapping `min-width` bands would leave
  // the winner to source order, which `@stylexjs/sort-keys` reorders on autofix — and its string
  // sort would put a future `100rem` band BEFORE `48rem`, silently inverting the ladder.
  viewport: {
    '--_cl-dialog-inset': {
      default: space['4'],
      '@media (min-width: 48rem) and (max-width: 89.99rem)': space['8'],
      '@media (min-width: 90rem)': space['12'],
    },
    padding: 'var(--_cl-dialog-inset)',
    // Clips the sheet while it is outside the box. A `prompt` enters from `translate: 0 100%` —
    // a full height BELOW its resting place, so under the phone band it starts off the bottom of
    // the screen. The headless `FloatingOverlay` that wraps this is `overflow: auto`, so without
    // clipping here it treats that as scrollable content and paints a scrollbar for the duration
    // of the animation.
    //
    // `clip`, NOT `hidden`, and the difference is the whole point. `hidden` makes this a scroll
    // CONTAINER — scrollable programmatically even though no scrollbar shows — and
    // `FloatingFocusManager` focuses the popup the moment it mounts, at which point the browser
    // scrolls it into view. On the entering frame the sheet is a full height BELOW the box, so
    // that scroll jumps ~136px and drags the sheet part-way up the screen, then unwinds as the
    // translate resolves: measured as `scrollTop` 0 -> 136 -> 50 -> 8 -> 0 across the animation.
    // It reads as the sheet flying too far up and then snapping back, with the unwind adding
    // extra bounces on top of the overshoot. `clip` never becomes scrollable, so there is nothing
    // for focus to scroll.
    //
    // Safe for tall content, which is the thing this could plausibly break: this element is
    // `height: auto`, so content taller than the viewport GROWS it rather than overflowing it —
    // the overlay still scrolls, and nothing is clipped. Only a box moved outside its own bounds
    // by a transform is affected, which is exactly the sheet and nothing else. Scoped to the
    // phone band regardless, since that is the only place anything translates.
    overflow: { default: null, '@media (max-width: 47.99rem)': 'clip' },
    // `safe center` rather than plain `center` is what makes the definite height below safe.
    // Centring an item TALLER than its box overflows it equally in both directions, leaving the
    // top half unreachable by scrolling; `safe` falls back to start alignment in exactly that
    // case, so an over-tall card still scrolls from its top through the overlay.
    placeItems: 'safe center',
    display: 'grid',
    // A definite container height is NOT enough on its own: an `auto` grid row still sizes to its
    // content and happily exceeds the container, which is how a panel of rows measured 2208px
    // inside a 1251px overlay. `minmax(0, 1fr)` pins the single row to the content box, so the row
    // is what an item stretches to and what its overflow is measured against.
    gridTemplateRows: 'minmax(0, 1fr)',
    // The keyboard's share of the viewport, added to the inset on the bottom edge only. A longhand
    // beside the `padding` shorthand above is deliberate — StyleX ranks a longhand higher
    // regardless of order, so this wins without depending on argument order. Falls back to `0px`,
    // so it is inert until `acquireKeyboardInset` has something to report.
    paddingBlockEnd: 'calc(var(--_cl-dialog-inset) + var(--_cl-keyboard-inset, 0px))',
    // A DEFINITE height, taken from the overlay (`position: fixed; inset: 0`), which makes the
    // single grid row definite too. That is what lets `sizes.panel` fill the content box with
    // `align-self: stretch` alone — no `dvh` arithmetic, so nothing can disagree with the box a
    // bottom-anchored sheet aligns to. They genuinely do diverge: on an emulated iPhone the
    // overlay measures 1251px while `100dvh` reports 844.
    height: '100%',
    width: '100%',
  },

  // The dialog surface. Unlike `Popover`, this one paints: dialogs take raw content
  // rather than a `Card`, so the surface has to come from somewhere.
  popup: {
    padding: space['6'],
    borderRadius: radiusVars['--cl-radius-container'],
    gap: space['3'],
    // Cleared because `FloatingFocusManager` focuses the popup itself when it holds no
    // tabbable content, which would otherwise draw a ring around the whole surface.
    outline: 'none',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px light-dark(oklch(0.2046 0 0 / 12%), transparent),
                0 24px 24px -10px light-dark(oklch(0.2046 0 0 / 4%), transparent),
                0 0 0 1px light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))`,
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    // The containing block for `Dialog.CloseButton`.
    position: 'relative',
    width: '100%',
  },

  /**
   * Anchored to the popup's top-inline-end corner rather than placed in flow, so it never
   * participates in the column's `gap` and a consumer can render it anywhere in the children
   * without the layout moving.
   *
   * It stays put on a `panel` because the popup itself never scrolls — see `sizes.panel`. An
   * absolutely positioned child of a scroll container scrolls away with the content, so the
   * scroll region has to live in the panel's children, not on the popup.
   */
  closeButton: {
    position: 'absolute',
    zIndex: 1,
  },
});

/** Distance from the popup's corner, per surface. */
export const closeInsets = stylex.create({
  prompt: { insetBlockStart: space['4'], insetInlineEnd: space['4'] },
  card: { insetBlockStart: space['4'], insetInlineEnd: space['4'] },
  panel: { insetBlockStart: space['4.5'], insetInlineEnd: space['4.5'] },
});

/**
 * Named for what the surface IS rather than for a t-shirt step, because these are different
 * surfaces rather than one surface at three scales — the names stay honest if they later diverge
 * on padding, mobile treatment, or footer.
 *
 * `prompt` asks one thing and returns: a confirmation, or a single-field form like "add an email
 * address". `card` is the sign-in / sign-up surface, and matches the width of the legacy card
 * (`theme.sizes.$100`). `panel` is the account-profile and settings surface, which you navigate.
 *
 * `card` sets only `max-width`; the popup is `width: 100%` and its height is whatever the
 * content needs, which is right for a confirmation or a two-field form.
 *
 * `panel` decides both axes. Its content NAVIGATES — a settings surface switches sections
 * in place — and a content-driven height would resize the window on every section change,
 * in both directions at once since the viewport centres it. `94rem` is 1504px at the
 * default root size; both axes stay in `rem`/`dvh` so a consumer scaling type scales with
 * them. `dvh` rather than `vh` for mobile browser chrome.
 */
export const sizes = stylex.create({
  prompt: {
    // Under the phone band, a prompt pins to the bottom of the viewport instead of centring.
    // `align-self` on the grid item, not `align-items` on the viewport, because the viewport is
    // shared: bottom-aligning there would drag `card` down with it, and `card` stays centred.
    //
    // The cap is lifted at the same time so the sheet spans the full width the inset leaves. It
    // otherwise binds on larger phones — a 428px screen has 396px of content box against a 380px
    // cap — leaving the sheet inset further at the sides than at the bottom, which is exactly the
    // uneven frame the fixed inset exists to avoid.
    alignSelf: { default: null, '@media (max-width: 47.99rem)': 'end' },
    maxWidth: { default: '23.75rem', '@media (max-width: 47.99rem)': 'none' },
  },
  card: { maxWidth: '25rem' },
  panel: {
    // No padding, unlike `card`. A panel's regions reach the popup's edges: a scroll region sits
    // flush, so its scrollbar and edge fade land on the true edge rather than floating in a
    // margin, and a sidebar can run the full height. Padding belongs to the children, which is
    // the same trade `overflow: hidden` makes — the panel supplies the frame, the composition
    // supplies the anatomy.
    padding: space['0'],
    // The panel does NOT scroll itself, and that is the whole design. A fixed-height surface
    // needs somewhere for overflow to go, but putting the scroll on the POPUP takes everything
    // anchored to it along for the ride — the close button most obviously, and anything else a
    // consumer positions against the corner.
    //
    // So the popup clips, and the scroll region is composed INSIDE it out of `scrollAreaRoot` /
    // `scrollAreaViewport()`. That also buys the sidebar case for free: a fixed rail beside a
    // scrolling column is just a flex row, where a Header/Body/Footer anatomy would have had to
    // grow a second axis to express it. `overscroll-behavior` comes with the ScrollArea viewport,
    // so it is not restated here.
    //
    // `clip` rather than `hidden` for the same reason as the viewport: `hidden` would make the
    // panel a scroll container, and focusing anything inside it that sits outside its box would
    // scroll the panel itself. The panel must never scroll — that is the composed region's job.
    overflow: 'clip',
    // Fills the viewport's content box rather than computing a height from `dvh`. The grid row
    // already stretches to the container (`place-items` sets `align-items`, not `align-content`,
    // so the row keeps its default stretch), and that box is by definition "the viewport minus the
    // inset on every side" — so `stretch` lands the panel's edges on exactly the same lines a
    // bottom-anchored `prompt` sheet reaches with `align-self: end`.
    //
    // Deriving the height from `100dvh` let the two disagree: `dvh` is measured against the visual
    // viewport while the grid box is 100% of the overlay, and wherever those differ — mobile
    // browser chrome most obviously — the panel overhung the box and sat lower than the sheet.
    // Stretching removes the arithmetic, and with it the class of bug.
    // Fills the viewport's content box exactly, and clamps to it. Both follow from the row being
    // definite (see `styles.viewport`) — without that a grid auto-row grows to its content, and
    // `stretch` faithfully filled 2144px in an 800px viewport, so the composed scroll region never
    // engaged. With it, the panel's edges land on the same lines a bottom-anchored sheet reaches
    // and its overflow has somewhere to go.
    alignSelf: 'stretch',
    // No `vw` term: the popup is `width: 100%` inside the viewport's padding, so the inset is
    // already subtracted. This only caps how wide the panel may get — 1504px at the default root.
    maxWidth: '94rem',
  },
});

/**
 * Enter/exit motion, keyed by size, because the two surfaces want opposite things.
 *
 * `card` scales out of whatever opened it. `panel` doesn't move at all — it is most of the
 * viewport, and the larger a surface is the worse a scale reads on it: the absolute travel
 * is `(1 − scale) ×` its own dimensions, so the same 2% that is a few pixels on a card is
 * tens of pixels on a panel, and it arrives as a zoom rather than an emergence.
 *
 * Both maps are keyed by SIZE rather than by a shared "animated" cell. StyleX dedupes by
 * PROPERTY across a `stylex.props` call, so a thin "mobile only" atom declaring `transform` would
 * replace a shared cell's wholesale and take the desktop scale with it. Each cell is therefore
 * self-contained and reads straight against the design matrix.
 *
 * The backdrop's timing is bound to the popup's rather than chosen independently. The
 * headless transition watches the POPUP's animations to decide when to unmount, and the
 * whole subtree goes at once — so a backdrop that outlives its popup gets cut off
 * mid-fade. Panel is instant on both, or its scrim would be yanked away on close.
 */
export const backdropMotion = stylex.create({
  /**
   * Deliberately NOT synced to the sheet's slide. An earlier version stretched this to match, on
   * the theory that the room should darken as the sheet rises — but the scrim is the answer to the
   * tap, and making it wait for a surface that travels its own height just delays the feedback.
   * It lands first, and the sheet arrives into an already-dimmed page.
   *
   * Currently identical to `card` below. Kept as its own cell rather than shared because
   * StyleX dedupes by property across a `stylex.props` call, so a per-size override cannot be
   * layered on top of a shared cell — see `popupMotion`.
   */
  prompt: {
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: 'linear',
  },

  card: {
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    // Longer arriving than leaving, and matched to the popup's scale so the dim and the
    // surface land together. No reduced-motion gate — nothing here moves.
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: 'linear',
  },

  panel: {},
});

// The entering/exiting scale, and the radius that survives it. `transform: scale()` scales the
// RENDERED border-radius along with everything else, so a popup at 0.98 draws its corners at 98%
// of their value and the roundness drifts over the transition. Dividing the radius by the same
// factor cancels it exactly: `r/s` drawn at scale `s` renders as `r`.
//
// One same-file const feeds both, so the correction cannot drift from the scale it corrects.
// Honest about the magnitude here: at 0.98 this is a 0.24px difference on a 12px radius, which is
// invisible — it earns its place by holding at whatever scale the value is later tuned to, and by
// making the intent explicit rather than by what it fixes today.
//
// Only the endpoints are exact. Both properties interpolate on the same curve over the same
// duration, so the mid-transition error is second-order and, at this delta, far below a pixel.
// The plain CSS `ease-out` — `cubic-bezier(0, 0, 0.58, 1)` — used ONLY for the sheet's slide out.
//
// `--cl-ease-exit` (In Quad) is right for a small delta: over ~6px its slow start is imperceptible
// and the acceleration reads as dismissal. Over a sheet's full height it reads as lag instead. But
// the obvious mirror, Out Quad `(0.25, 0.46, 0.45, 0.94)`, over-corrects: it covers 65% of the
// travel in the first 35% of the time, then spends the remaining two thirds on the last third,
// which is a slow crawl on something that has already visually left. `ease-out` is at 50% by the
// same point and spreads the rest far more evenly.
//
// Not a token: it exists because this one transition moves an order of magnitude further than any
// other in Mosaic. If a second large-travel exit appears, it should graduate to one.
const SHEET_EXIT_EASE = 'ease-out';

const ENTER_SCALE = 0.98;
const popupRadius = radiusVars['--cl-radius-container'];

export const popupMotion = stylex.create({
  /**
   * A prompt scales out of whatever opened it — except under the phone band, where it slides up
   * from the bottom edge as a sheet. Written as its own cell rather than as an overlay on top of
   * `card`: StyleX dedupes by PROPERTY across a `stylex.props` call, so a thin "mobile only" atom
   * declaring `transform` would replace `card`'s wholesale and take the desktop scale with it.
   * Each cell is therefore self-contained and reads straight against the design matrix.
   */
  prompt: {
    borderRadius: {
      default: popupRadius,
      ':where([data-starting-style], [data-ending-style])': `calc(${popupRadius} / ${ENTER_SCALE})`,
      '@media (max-width: 47.99rem)': {
        default: popupRadius,
        ':where([data-starting-style], [data-ending-style])': popupRadius,
      },
      // Both branches resolve to the same value, so their order relative to each other cannot
      // matter: there is no scale to counteract in either case.
      '@media (prefers-reduced-motion: reduce)': {
        default: popupRadius,
        ':where([data-starting-style], [data-ending-style])': popupRadius,
      },
    },
    // The sheet does NOT fade, and that is what makes it read as a slide. It starts fully off
    // the bottom edge, so a fade adds nothing at the start and washes out the middle of the
    // travel — the eye reads a panel materialising rather than one arriving. Native sheets on
    // both platforms slide fully opaque and let the scrim carry the "something arrived" cue.
    //
    // Held at 1 only when motion is allowed. Under reduce the transform is pinned flat, so the
    // fade is the only signal left and has to survive; that branch is reached by falling through
    // this one's `no-preference` guard.
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
      '@media (max-width: 47.99rem) and (prefers-reduced-motion: no-preference)': {
        default: 1,
        ':where([data-starting-style], [data-ending-style])': 1,
      },
    },
    /**
     * Desktop only — a sheet does not scale, and the reason is positional rather than aesthetic.
     * `transform-origin` is the trigger (see below), which for a bottom sheet sits well outside
     * its box: measured at `184px -32px`, i.e. 32px ABOVE the popup's top edge. Scaling about a
     * point outside the element moves every other point toward it, so at 0.98 the bottom edge
     * lands `(176 + 32) × 0.02` ≈ 4px high and only releases as the scale reaches 1. That reads as
     * the sheet arriving above the inset and then correcting — and it is NOT the overshoot, which
     * belongs to the translate and resolves separately.
     *
     * Written as ONE rule with no unconditioned `default`, the same shape as `translate` below and
     * for the same reason: a media-scoped branch that has to out-rank a plain sibling on the same
     * property loses. With no sibling there is no contest — `transform` is simply unset at rest and
     * under the phone band — and the `no-preference` guard makes reduced motion a no-op for free.
     */
    transform: {
      default: null,
      '@media (min-width: 48rem) and (prefers-reduced-motion: no-preference)': {
        default: null,
        ':where([data-starting-style], [data-ending-style])': `scale(${ENTER_SCALE})`,
      },
    },
    transformOrigin: 'var(--cl-dialog-origin, center)',
    // The sheet travels its OWN HEIGHT rather than the ~6px a scale does, so it runs longer than
    // anything else here: `slow` in, `base` out, a 1.67:1 ratio in line with the rest of Mosaic.
    // The dead-frame concern that caps long durations elsewhere does not apply — the delta is
    // hundreds of pixels, so every frame moves far more than the visible threshold. Only the
    // fourth slot is live on this branch: the sheet holds its opacity, and neither `transform` nor
    // the radius counter-scale applies under the phone band. They still have to be filled, since
    // the list is positional.
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
      '@media (max-width: 47.99rem)': {
        default: `${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-slow']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-slow']}`,
        ':where([data-ending-style])': durationVars['--cl-duration-base'],
      },
    },
    transitionProperty: {
      default: 'opacity, transform, border-radius, translate',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    // Unchanged by the sheet: a translate is still something that moves, so it wants the arrival
    // curve in and the departure curve out exactly as the scale does.
    transitionTimingFunction: {
      default: `linear, ${easingVars['--cl-ease-default']}, ${easingVars['--cl-ease-default']}, ${easingVars['--cl-ease-default']}`,
      // Positional against `transitionProperty`, so the fourth slot is `translate` — the sheet's
      // slide, and the only one that departs from `--cl-ease-exit`. Set on the PLAIN
      // `[data-ending-style]` branch rather than behind a media query on purpose: `translate` is
      // unset above the phone band, so the slot is inert there, and a media-scoped branch would
      // have to out-rank a plain sibling on the same property — the fight documented on
      // `translate` below.
      ':where([data-ending-style])': `linear, ${easingVars['--cl-ease-exit']}, ${easingVars['--cl-ease-exit']}, ${SHEET_EXIT_EASE}`,
    },
    /**
     * The sheet's slide rides the independent `translate` property, NOT `transform` — and it
     * declares exactly one rule, with no unconditioned `default`.
     *
     * Both halves of that are load-bearing. A `:where()` state branch nested inside an `@media`
     * branch loses to the same property's unconditioned `default`, even at (0,3,0) against
     * (0,1,0): verified in the browser, where `default + desktop-enter` correctly yields
     * `scale(0.98)` while `default + mobile-enter` yields `scale(1)`. It is not specificity and
     * not source order — both rules sit in `priority4` and the mobile one is emitted last. So a
     * media-scoped state branch must never have to out-rank a plain sibling on the same property.
     *
     * Giving the slide its own property removes the contest entirely, and omitting the `default`
     * leaves nothing for it to lose to: at rest `translate` is simply unset. The
     * `no-preference` guard then makes reduced motion a no-op for free — no branch matches, so
     * the sheet holds flat and only the scrim fades.
     */
    translate: {
      default: null,
      '@media (max-width: 47.99rem) and (prefers-reduced-motion: no-preference)': {
        default: null,
        ':where([data-starting-style], [data-ending-style])': '0 100%',
      },
    },
  },

  /** The sign-in / sign-up surface. Stays centred and origin-scaled at every width. */
  card: {
    borderRadius: {
      default: popupRadius,
      ':where([data-starting-style], [data-ending-style])': `calc(${popupRadius} / ${ENTER_SCALE})`,
      '@media (prefers-reduced-motion: reduce)': {
        default: popupRadius,
        ':where([data-starting-style], [data-ending-style])': popupRadius,
      },
    },
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transform: {
      default: 'scale(1)',
      ':where([data-starting-style], [data-ending-style])': `scale(${ENTER_SCALE})`,
      '@media (prefers-reduced-motion: reduce)': {
        default: 'scale(1)',
        ':where([data-starting-style], [data-ending-style])': 'scale(1)',
      },
    },
    transformOrigin: 'var(--cl-dialog-origin, center)',
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, transform, border-radius',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: `linear, ${easingVars['--cl-ease-default']}, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': `linear, ${easingVars['--cl-ease-exit']}, ${easingVars['--cl-ease-exit']}`,
    },
  },

  panel: {},
});
