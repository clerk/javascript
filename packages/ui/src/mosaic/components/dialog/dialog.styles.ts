import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  // The scrim. A black wash over `transparent` rather than a percentage of a neutral
  // token: it composites over whatever the host app renders, so the same value reads
  // consistently on any page.
  //
  // Black in both schemes. A grey veil was tried for dark mode — lightening a dark page rather
  // than darkening it — and it read as haze over the page rather than as a surface lifting off it.
  //
  // ONE scrim for the whole stack: a stacked dialog paints none, and the root-level dialog's
  // survives underneath it. The stack reads as depth through the surface beneath receding
  // (`popupMotion.prompt`), not through the page going darker.
  //
  // The alternative — each level painting a lighter scrim solved so the composite lands on an
  // intended total — was here first, and worked only for the two-deep case it was solved for.
  // Alpha over alpha is `1 − (1 − a)(1 − b)`, so every level compounds: a third took the same
  // three-deep stack this feature exists for from an intended 0.68 to 0.83, and "how dark is the
  // page" became a function of stack depth.
  //
  // Keyed on `data-stacked`, NOT `data-nested`: the latter reports any floating ancestor, so a
  // dialog opened from a menu item would drop the only scrim it has. Both come from the headless
  // layer.
  backdrop: {
    inset: 0,
    backgroundColor: {
      default: 'color-mix(in oklab, oklch(0 0 0) 40%, transparent)',
      ':where([data-stacked])': 'transparent',
    },
    position: 'fixed',
  },

  // Centering track inside the headless `FloatingOverlay`, which owns the fixed positioning and
  // the scroll lock. Whether this box is a fixed height or grows with its content is the whole
  // outside-scroll question, and it differs per size — see `viewportSizes` below.
  //
  // The gap between a dialog and the edge of the screen is a FIXED INSET, not a percentage.
  // A percentage margin is asymmetric between the axes and the asymmetry tracks the viewport's
  // aspect ratio: at 90vw/90dvh a 1920x1080 screen leaves 96px at the sides and 54px top and
  // bottom, an ultrawide closer to 172 against 72, and a phone inverts it — 20px at the sides
  // against 42px. The surround never reads as a frame and its character changes per device. One
  // inset is even on all four sides everywhere, and steps up with available room rather than
  // with aspect ratio.
  //
  // Published as a var so the two edges can be driven from one ladder and so anything inside can
  // read it without plumbing — custom properties inherit. The popup needs no width math of its
  // own: it is `width: 100%` inside this padding, so the inset is already subtracted.
  //
  // Square everywhere except the phone band, where the sides come in to `1rem` and the block edges
  // stay at `1.25rem`. On a phone the horizontal inset is the expensive one — it is subtracted from
  // a content box only ~380px wide, so every pixel there costs line length in a way the same pixel
  // costs nothing vertically. The vertical edges are doing the opposite job: separating the surface
  // from the browser's own chrome, which is closer on a phone than on any desktop.
  //
  // The two queries are deliberately NON-OVERLAPPING. Overlapping `min-width` bands would leave
  // the winner to source order, which `@stylexjs/sort-keys` reorders on autofix — and its string
  // sort would put a future `100rem` band BEFORE `48rem`, silently inverting the ladder.
  viewport: {
    '--_cl-dialog-inset': {
      default: space['5'],
      '@media (min-width: 48rem) and (max-width: 89.99rem)': space['8'],
      '@media (min-width: 90rem)': space['12'],
    },
    padding: 'var(--_cl-dialog-inset)',
    // Narrower sides under the phone band only. A longhand beside the `padding` shorthand above is
    // safe in either order — StyleX ranks a longhand higher regardless — which is the same reason
    // `paddingBlockEnd` below works. Above the phone band this resolves back to the ladder, so
    // there is exactly one place to retune each band.
    paddingInline: { default: space['4'], '@media (min-width: 48rem)': 'var(--_cl-dialog-inset)' },
    // `safe center` rather than plain `center`, and it is what makes an over-tall popup reachable.
    // Centring an item TALLER than its box overflows it equally in both directions, leaving the
    // top half above the scroll origin and unreachable; `safe` falls back to start alignment in
    // exactly that case, so the popup overflows downward only and scrolls from its top.
    placeItems: 'safe center',
    display: 'grid',
    // The keyboard's share of the viewport, added to the inset on the bottom edge only. A longhand
    // beside the `padding` shorthand above is deliberate — StyleX ranks a longhand higher
    // regardless of order, so this wins without depending on argument order. Falls back to `0px`,
    // so it is inert until `acquireKeyboardInset` has something to report.
    paddingBlockEnd: 'calc(var(--_cl-dialog-inset) + var(--_cl-keyboard-inset, 0px))',
    width: '100%',
  },

  // The dialog surface. Unlike `Popover`, this one paints, because a `prompt` and a `panel` take
  // raw content rather than a `Card` and the surface has to come from somewhere. `sizes.card`
  // nulls the painting properties back out — see the note there.
  popup: {
    padding: space['6'],
    // Forced-colors mode discards `box-shadow` outright, and the ring above is the only thing
    // separating the surface from the page — so in HCM the dialog would float edgeless over its
    // own scrim (which is also discarded). A real border is the one edge the mode keeps. Set only
    // inside the query so it costs nothing elsewhere, and `box-sizing: border-box` from `reset`
    // means adding it moves nothing.
    //
    // Not an `outline`: the popup clears its outline on purpose (`FloatingFocusManager` focuses
    // the popup itself when it holds no tabbable content), and reintroducing one here would put
    // the edge and the focus ring on the same property.
    borderColor: { default: null, '@media (forced-colors: active)': 'CanvasText' },
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: { default: null, '@media (forced-colors: active)': 'solid' },
    borderWidth: { default: null, '@media (forced-colors: active)': '1px' },
    gap: space['3'],
    // Cleared because `FloatingFocusManager` focuses the popup itself when it holds no
    // tabbable content, which would otherwise draw a ring around the whole surface.
    outline: 'none',
    backgroundColor: colorVars['--cl-color-card'],
    // Matches `Menu`. The two schemes are different treatments, not one at two strengths: light
    // gets the two drop layers and a dark hairline, dark drops them to `transparent` and separates
    // with a light hairline instead — a shadow reads as depth against a light page and as nothing
    // against a dark one.
    //
    // Branched per COLOUR via `light-dark()`, which is the only shape available: `light-dark()`
    // resolves to a colour and cannot carry an offset or a blur, so the geometry has to be shared.
    // `@media (prefers-color-scheme: dark)` is not the escape hatch it looks like — that tracks the
    // OS preference while `light-dark()` tracks the `color-scheme` in scope, so an app forcing a
    // scheme (swingset's own toggle does, via next-themes) would take its colours from one and its
    // geometry from the other.
    boxShadow: `0 12px 12px -7px light-dark(oklch(0.2046 0 0 / 12%), transparent),
                0 24px 24px -10px light-dark(oklch(0.2046 0 0 / 4%), transparent),
                0 0 0 1px light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))`,
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    // A dialog holds prose it did not author — an email address, an org slug, an API key — and a
    // long unbroken string would otherwise push past the size's width clamp. Same reasoning as
    // `Popover`, which is narrower and hit it first.
    overflowWrap: 'anywhere',
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
   *
   * Carried by a wrapper rather than by the button itself: `Button`'s touch target sets
   * `position` inside a media query, which compiles to a class the button's own `stylex.props`
   * call would have to dedupe against — unreachable from out here.
   */
  closeButton: {
    display: 'flex',
    position: 'absolute',
    zIndex: 1,
  },
});

/**
 * Positions the ICON the surface's inset from the corner, not the button box: the `sm` circle
 * carries `(space[7] - space[4]) / 2` = `space[1.5]` of its own padding around the glyph, so each
 * inset runs that much shy of the distance the eye should read (`4` for prompt/card, `4.5` for
 * panel). The hit target hangs past the icon toward the corner, which only helps.
 */
export const closeInsets = stylex.create({
  prompt: { insetBlockStart: space['2.5'], insetInlineEnd: space['2.5'] },
  card: { insetBlockStart: space['2.5'], insetInlineEnd: space['2.5'] },
  panel: { insetBlockStart: space['3'], insetInlineEnd: space['3'] },
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
/**
 * How the viewport behaves when the popup is taller than the screen — the "inside scroll" vs
 * "outside scroll" split, decided by size rather than by a prop because it follows from what each
 * surface already is.
 *
 * A `panel` is a fixed-height window you navigate inside, so it scrolls INSIDE: the viewport stays
 * pinned to the overlay and the consumer composes a scroll region out of `scrollAreaRoot` /
 * `scrollAreaViewport()`. A `prompt` and a `card` take their height from their content and have no
 * obvious region to scroll, so they scroll OUTSIDE: the whole dialog moves within the overlay.
 *
 * The mechanism is one property. Pinned at `height: 100%` the viewport cannot grow, so an over-tall
 * popup spills past its padding box — the scrollable overflow reaches the overlay, but the
 * viewport's own `padding-block-end` stays behind at the fold, and the popup runs flush into the
 * bottom edge with none of the inset that surrounds it everywhere else. `min-height: 100%` lets the
 * box grow instead: the padding travels with the content, and short dialogs still fill the overlay
 * so `place-items: center` has something to centre against.
 */
export const viewportSizes = stylex.create({
  prompt: {
    // Clips the sheet while it is outside the box, and ONLY for the size that translates. A
    // `prompt` enters from `translate: 0 100%` — a full height BELOW its resting place — and the
    // `FloatingOverlay` wrapping this is `overflow: auto`, so without clipping it treats that as
    // scrollable content and paints a scrollbar for the length of the animation.
    //
    // `clip`, NOT `hidden`, and the difference is the whole point. `hidden` makes this a scroll
    // CONTAINER — scrollable programmatically even with no scrollbar — and `FloatingFocusManager`
    // focuses the popup the moment it mounts, at which point the browser scrolls it into view. On
    // the entering frame the sheet sits a full height below the box, so that scroll jumped ~136px
    // and dragged the sheet part-way up the screen, then unwound as the translate resolved:
    // measured as `scrollTop` 0 -> 136 -> 50 -> 8 -> 0. It read as the sheet flying too far up and
    // snapping back, the unwind stacking extra bounces on the real overshoot. `clip` never becomes
    // scrollable, so focus has nothing to scroll.
    //
    // The cost is real and accepted: a `prompt` taller than a phone screen is clipped rather than
    // scrolled, because the same rule that contains the slide also contains the overflow. A prompt
    // asks one thing, so it should not reach that height; a tall surface on a phone wants `card`,
    // which does not translate and therefore is not clipped here.
    overflow: { default: null, '@media (max-width: 47.99rem)': 'clip' },
    minHeight: '100%',
  },
  card: { minHeight: '100%' },
  panel: {
    // A definite container height is NOT enough on its own: an `auto` grid row still sizes to its
    // content and happily exceeds the container, which is how a panel of rows measured 2208px
    // inside a 1251px overlay. `minmax(0, 1fr)` pins the single row to the content box, so the row
    // is what an item stretches to and what its overflow is measured against.
    //
    // Deliberately NOT applied to the scrolling sizes: it would clamp the row there too, which is
    // exactly what has to stop happening for the popup to grow past the fold.
    gridTemplateRows: 'minmax(0, 1fr)',
    // A DEFINITE height, taken from the overlay (`position: fixed; inset: 0`), which makes the
    // single grid row definite too. That is what lets `sizes.panel` fill the content box with
    // `align-self: stretch` alone — no `dvh` arithmetic, so nothing can disagree with the box a
    // bottom-anchored sheet aligns to. They genuinely do diverge: on an emulated iPhone the
    // overlay measures 1251px while `100dvh` reports 844.
    height: '100%',
  },
});

export const sizes = stylex.create({
  prompt: {
    // Tighter than the popup's default 1.5rem. A prompt asks one thing, so its content box is
    // small and a 1.5rem surround reads as a disproportionate frame around two lines of text.
    // Overrides `styles.popup` by position — `sizes[size]` is spread after it in the same
    // `stylex.props` call, so StyleX dedupes the property to this value.
    padding: space['4'],
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
  // The one size that does NOT paint itself. A `card` is the sign-in / sign-up surface, which is
  // a `Card` — so the surface comes from `Card`'s own `elevations.overlay` rather than from here,
  // and the popup contributes only geometry and motion. Compose it by rendering the popup AS the
  // card, not by nesting one inside the other:
  //
  //   <Dialog.Popup render={<Card.Root elevation='overlay' />}>
  //
  // One element then both paints and animates, which is what keeps the radius counter-scale in
  // `popupMotion.card` landing on the corners you actually see. Nested, the popup would scale a
  // transparent box while the `Card` inside it took the scale on its painted corners with no
  // correction. `borderRadius` stays here for that reason; `Card` declares the same token, so the
  // two agree at rest and the counter-scale wins during the transition on specificity.
  //
  // These are `null` rather than `transparent` / `none` / `0`. Within one `stylex.props` call a
  // later `null` REMOVES the earlier atom, so the popup emits no class for these properties at
  // all — leaving `Card`'s to apply unopposed. Competing values would instead put two atoms on the
  // element for the same property, and StyleX cannot dedupe across separate `stylex.props` calls,
  // so the winner would fall to stylesheet order.
  //
  // Consequence worth knowing: `size="card"` with no `Card` inside renders an unpainted box.
  card: {
    padding: null,
    gap: null,
    backgroundColor: null,
    boxShadow: null,
    maxWidth: '25rem',
  },
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
 * `card` scales from its centre. `panel` fades without scaling — it is most of the
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
 * mid-fade. Every size therefore fades its scrim over the same duration its popup runs for,
 * `panel` included — which is why `popupMotion.panel` fades rather than being left inert.
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
      default: durationVars['--cl-duration-fast'],
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
    // One step below the popup's own entrance, so the dim lands first and the surface arrives
    // into an already-darkened page rather than alongside the darkening. Symmetric in and out:
    // the scrim is only ever the answer to the gesture, so there is nothing for a longer
    // entrance to sell. No reduced-motion gate — nothing here moves.
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: 'linear',
  },

  /** Identical to `card` — the popup it accompanies fades on the same clock, it just does not scale. */
  panel: {
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: 'linear',
  },
});

// The entering/exiting scale, and the radius that survives it. `transform: scale()` scales the
// RENDERED border-radius along with everything else, so a popup at 0.94 draws its corners at 94%
// of their value and the roundness drifts over the transition. Dividing the radius by the same
// factor cancels it exactly: `r/s` drawn at scale `s` renders as `r`.
//
// One same-file const feeds both, so the correction cannot drift from the scale it corrects. At
// 0.94 it is worth about 0.77px on a 12px radius — well above the threshold it sat at when the
// scale was 0.98 (0.24px), so this is now load-bearing rather than merely principled.
//
// Only the endpoints are exact. Both properties interpolate on the same curve over the same
// duration, so the mid-transition error is second-order and stays well under a pixel.
// The plain CSS `ease-out` — `cubic-bezier(0, 0, 0.58, 1)` — used ONLY for the sheet's slide out.
//
// `--cl-ease-exit` (In Quad) is right for a small delta: over ~11px its slow start is imperceptible
// and the acceleration reads as dismissal. Over a sheet's full height it reads as lag instead. But
// the obvious mirror, Out Quad `(0.25, 0.46, 0.45, 0.94)`, over-corrects: it covers 65% of the
// travel in the first 35% of the time, then spends the remaining two thirds on the last third,
// which is a slow crawl on something that has already visually left. `ease-out` is at 50% by the
// same point and spreads the rest far more evenly.
//
// Not a token: it exists because this one transition moves an order of magnitude further than any
// other in Mosaic. If a second large-travel exit appears, it should graduate to one.
const SHEET_EXIT_EASE = 'ease-out';

const ENTER_SCALE = 0.94;

// How far a prompt recedes while another prompt is stacked on it, and the radius that survives
// that scale — the same `r/s` correction `ENTER_SCALE` documents above, for the same reason.
//
// Shallower than the entrance scale on purpose: the entrance is a surface arriving from nowhere,
// while this is a surface that stays legible the whole time and only has to read as further back.
// The lift is what separates it from the entrance rather than the depth of the scale — a surface
// that only shrinks reads as being pushed away, one that shrinks and rises reads as being layered
// over, which is the relationship this actually is.
//
// A single step rather than a `--cl-stack-index` formula: the headless layer counts DIRECT
// children, so a third level would report the same 1 as the second and every level below the top
// would recede identically anyway. The formula and the cumulative count belong in the same change,
// whenever a stack deep enough to need them turns up.
const STACK_SCALE = 0.96;
const STACK_LIFT = '-0.5rem';

const popupRadius = radiusVars['--cl-radius-xl'];

export const popupMotion = stylex.create({
  /**
   * A prompt scales from its centre — except under the phone band, where it slides up
   * from the bottom edge as a sheet. Written as its own cell rather than as an overlay on top of
   * `card`: StyleX dedupes by PROPERTY across a `stylex.props` call, so a thin "mobile only" atom
   * declaring `transform` would replace `card`'s wholesale and take the desktop scale with it.
   * Each cell is therefore self-contained and reads straight against the design matrix.
   */
  prompt: {
    borderRadius: {
      default: popupRadius,
      // The recede is the one scale that survives the phone band, so unlike the entrance its
      // radius correction is NOT pinned flat there — see `transform` below.
      ':where([data-stack-base])': `calc(${popupRadius} / ${STACK_SCALE})`,
      ':where([data-starting-style], [data-ending-style])': `calc(${popupRadius} / ${ENTER_SCALE})`,
      '@media (max-width: 47.99rem)': {
        default: popupRadius,
        ':where([data-stack-base])': `calc(${popupRadius} / ${STACK_SCALE})`,
        ':where([data-starting-style], [data-ending-style])': popupRadius,
      },
      // Both entrance branches resolve to the same value, so their order relative to each other
      // cannot matter: there is no scale to counteract in either case. The stack branch is here
      // for the same reason it is on `transform` — under `reduce` nothing scales, so there is
      // nothing to correct.
      '@media (prefers-reduced-motion: reduce)': {
        default: popupRadius,
        ':where([data-stack-base])': popupRadius,
        ':where([data-starting-style], [data-ending-style])': popupRadius,
      },
    },
    // One fade at every width, including the sheet. An earlier version pinned the sheet at
    // opacity 1 on the theory that a pure slide reads more like a native sheet — compared
    // side by side it did not; the fade gives the travel somewhere to resolve into rather than
    // washing it out, provided it runs the length of the slide rather than finishing early.
    // That is why the duration below is `slow` and not `fast`: a fade that lands while the
    // surface is still moving reads as a flash, which is what the original objection was
    // actually describing.
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    /**
     * Structurally identical to `card` below, and that is load-bearing rather than tidiness.
     *
     * This was once written as a single media-scoped rule with no unconditioned `default`, on the
     * theory that leaving `transform` unset at rest removed any cascade contest. It emitted
     * correctly — the rule is there, at HIGHER specificity than `card`'s — and yet no scale ever
     * ran, while `card`'s did. The only difference between the two was the resting declaration, so
     * the resting value is what a transition needs: an endpoint of `none` is not one the scale
     * interpolates from here, whereas `scale(1)` is.
     *
     * Do NOT re-collapse this into the no-`default` shape. `translate` below keeps that shape and
     * genuinely works, which makes the asymmetry easy to talk yourself back into.
     *
     * The phone band then pins the scale flat, because a sheet slides rather than scales — stacking
     * a shrink on top of a full-height travel makes the surface arrive slightly small and settle,
     * which reads as a correction rather than as one movement. Both media branches resolve to
     * `scale(1)`, so their order relative to each other cannot matter and `@stylexjs/sort-keys` is
     * free to reorder them.
     */
    transform: {
      default: 'scale(1)',
      /**
       * The recede: what a prompt does while another prompt is stacked on it. There is no second
       * scrim, so this and the stacked surface's own shadow are the entire depth cue.
       *
       * Kept ON the phone band, where the entrance scale is pinned flat. Those are different
       * gestures and the reasoning does not carry over: the entrance pin exists because stacking a
       * shrink on top of a full-height slide makes the sheet arrive small and settle. A sheet
       * receding under another sheet is the familiar one — it is what vaul does — and on a phone,
       * where a stacked sheet covers most of what is beneath it, dropping the recede would leave
       * the level below with no depth cue at all.
       *
       * `@stylexjs/sort-keys` puts this branch before the entrance one, so an exit that somehow
       * begins while a child is still open renders the exit scale rather than the recede. Nothing
       * ordinary reaches that state — floating-ui blocks the parent's own dismissal while a child
       * is open — and the exit scale is the better of the two to see if anything ever does.
       */
      ':where([data-stack-base])': `scale(${STACK_SCALE}) translateY(${STACK_LIFT})`,
      ':where([data-starting-style], [data-ending-style])': `scale(${ENTER_SCALE})`,
      '@media (max-width: 47.99rem)': {
        default: 'scale(1)',
        ':where([data-stack-base])': `scale(${STACK_SCALE}) translateY(${STACK_LIFT})`,
        ':where([data-starting-style], [data-ending-style])': 'scale(1)',
      },
      '@media (prefers-reduced-motion: reduce)': {
        default: 'scale(1)',
        // Reduced motion drops the recede entirely rather than snapping to it: the level below
        // holds still and the stacked surface simply appears over it.
        ':where([data-stack-base])': 'scale(1)',
        ':where([data-starting-style], [data-ending-style])': 'scale(1)',
      },
    },
    // The sheet travels its OWN HEIGHT rather than the ~11px a scale does, so it runs longer than
    // anything else here: `slow` in, `base` out, a 1.67:1 ratio in line with the rest of Mosaic.
    // The dead-frame concern that caps long durations elsewhere does not apply — the delta is
    // hundreds of pixels, so every frame moves far more than the visible threshold.
    //
    // The FIRST slot tracks the fourth on the phone branch rather than staying at `fast`: opacity
    // and the slide are one gesture there, and a fade that finishes while the surface is still
    // travelling reads as a flash rather than as an arrival. Above the phone band the fade keeps
    // `fast` and lands with the scrim, since the scale it accompanies barely moves. The third slot
    // is inert under the phone band (no scale, so no radius counter-scale) but still has to be
    // filled — the list is positional.
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
      '@media (max-width: 47.99rem)': {
        default: `${durationVars['--cl-duration-slow']}, ${durationVars['--cl-duration-slow']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-slow']}`,
        ':where([data-ending-style])': durationVars['--cl-duration-base'],
      },
    },
    transitionProperty: {
      default: 'opacity, transform, border-radius, translate',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    // Unchanged by the sheet: a translate is still something that moves, so it wants the arrival
    // curve in and the departure curve out exactly as the scale does. `--cl-ease-enter` rather than
    // `--cl-ease-default` because a surface this size should land rather than settle — Swift Out's
    // ~2% overshoot reads as the sheet arriving past its inset and correcting.
    transitionTimingFunction: {
      default: `linear, ${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-enter']}`,
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

  /** The sign-in / sign-up surface. Stays centred and centre-scaled at every width. */
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
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, transform, border-radius',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: `linear, ${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-enter']}`,
      ':where([data-ending-style])': `linear, ${easingVars['--cl-ease-exit']}, ${easingVars['--cl-ease-exit']}`,
    },
  },

  /**
   * Fade only, no scale — see the note above this map for why a surface this size should not
   * scale. The fade is not optional the way an inert cell would be: the headless transition
   * watches the POPUP to decide when to unmount, so with nothing running here the whole subtree,
   * scrim included, is pulled on close before `backdropMotion.panel` can fade.
   *
   * No reduced-motion branch, matching `card` — under `reduce` the two shed their transform and
   * are left with exactly this, so there is nothing here to drop.
   */
  panel: {
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: 'linear',
  },
});
