import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, radiusVars, scrollbarVars, scrollFadeVars, space } from '../../tokens.stylex';
import { scrollAreaVars, scrollbarThumbVars } from './scroll-area.vars.stylex';

// Same-file locals so the `var()` references read as names rather than as a wall of
// bracket lookups inside the gradient. StyleX inlines them at build; an imported helper
// would fail static evaluation.
const progressStart = scrollAreaVars['--cl-scroll-area-progress-start'];
const progressEnd = scrollAreaVars['--cl-scroll-area-progress-end'];
const fadeSize = scrollFadeVars['--cl-scroll-fade-size'];
const fadeRange = scrollFadeVars['--cl-scroll-fade-range'];
const scrollbarWidth = scrollbarVars['--cl-scrollbar-width'];
const thumbColor = scrollbarThumbVars['--_cl-scrollbar-thumb-color'];

// One animation per edge, each writing its own progress var. The end fade counts DOWN
// rather than running `animation-direction: reverse`: with `fill-mode: both` the two are
// equivalent (the backwards fill holds the `from` frame, so the fade reads 1 for the whole
// scroll and only drops across the final `fade-range`), and writing it into the keyframes
// keeps `animation-direction` off the element entirely.
// The suppressions work around a gap in StyleX's own types, not a problem with the CSS:
// `Keyframes` declares each frame as `CSSProperties`, which carries no index signature for
// `--*` keys, so a custom property the compiler accepts and emits correctly still fails to
// typecheck. It has to be suppressed rather than cast — the babel plugin requires a bare
// object literal, and wrapping the argument in an `as` expression fails the build with
// "keyframes() can only accept an object". A computed key is out for the same reason.
const revealStart = stylex.keyframes({
  // @ts-expect-error -- StyleX's `Keyframes` type omits custom properties; see above.
  from: { '--cl-scroll-area-progress-start': 0 },
  // @ts-expect-error -- StyleX's `Keyframes` type omits custom properties; see above.
  to: { '--cl-scroll-area-progress-start': 1 },
});

const revealEnd = stylex.keyframes({
  // @ts-expect-error -- StyleX's `Keyframes` type omits custom properties; see above.
  from: { '--cl-scroll-area-progress-end': 1 },
  // @ts-expect-error -- StyleX's `Keyframes` type omits custom properties; see above.
  to: { '--cl-scroll-area-progress-end': 0 },
});

// A single four-stop gradient covers both edges, because the animated quantity is a number
// the stops are computed from rather than the mask's own geometry. At progress 0 the stop
// collapses onto the edge it starts from, leaving a hard boundary that reads as fully
// opaque — so "no scroll yet" and "not scrollable at all" render identically, for free.
//
// The second layer is the scrollbar strip, held opaque so the fade never touches it. Its width
// comes from `--cl-scrollbar-width` — the lane we specify ourselves — rather than a knob of its
// own, since the two can never legitimately differ. Where we do NOT paint the scrollbar the
// layer is zero-wide and contributes nothing. Layers composite with `add` by default, so no
// `mask-composite` declaration is needed.
const maskImage = `linear-gradient(to bottom, transparent 0, #000 calc(${progressStart} * ${fadeSize}), #000 calc(100% - ${progressEnd} * ${fadeSize}), transparent 100%), linear-gradient(#000, #000)`;

// Split by concern rather than one object per slot: the sort-keys rule reorders within an
// object, so a large one ends up interleaving unrelated properties and stranding the comments
// that explain them. `scrollAreaViewport()` recomposes them, so callers spread one thing.
const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    // Only load-bearing for a future scrollbar part; the viewport needs no positioning.
    position: 'relative',
    // A scroll container nested in a column flex parent overflows its track without this.
    minHeight: 0,
  },

  /** The scroll container itself. */
  viewport: {
    overscrollBehavior: 'contain',
    flexBasis: 'auto',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  /**
   * The thumb's colour, produced on the SCROLLER rather than on the pseudo-element that paints
   * it. A `::-webkit-scrollbar-thumb` cannot transition anything of its own, so the animating
   * value is declared here and inherited down into it, which only ever reads it.
   *
   * Every scrollbar declaration from here down repeats `{ default: null, '@media (pointer:
   * fine)': … }`. A touch platform draws an overlay bar there is no width or colour to apply to,
   * and — the reason the gate has to reach the SHAPE properties too, not just the visible ones —
   * Blink switches an element to a custom scrollbar the moment ANY `::-webkit-scrollbar*` rule
   * matches it, which would trade that overlay bar for a permanent one. `null` emits no
   * declaration at all, so under a coarse pointer the pseudo-elements carry no rules and the
   * platform keeps its own. Written out each time rather than wrapped in a local helper: the
   * compiler evaluates a helper fine, but `@stylexjs/valid-styles` can't see through the call and
   * rejects every value it wraps, trading this repetition for a wall of suppressions.
   *
   * Deliberately no `scrollbar-color` / `scrollbar-width` alongside: a non-`auto` value for
   * either makes a UA ignore the `::-webkit-scrollbar*` family entirely, so keeping them would
   * leave every rule in `scrollbar` below as dead code in exactly the engines that implement it.
   * Firefox implements the pseudo-elements not at all and keeps its platform scrollbar. That is
   * the whole cost of the trade, and it buys per-state thumb colours and a real pixel width,
   * neither of which the standard properties can express.
   */
  thumbColor: {
    '--_cl-scrollbar-thumb-color': {
      default: null,
      '@media (pointer: fine)': {
        default: scrollbarVars['--cl-scrollbar-thumb'],
        // Reaching the region at all is what lifts the thumb out of its rest state. This is the
        // step the browser's own derivation gets BACKWARDS from a specified `scrollbar-color` —
        // it lightens the thumb on hover — and correcting it is most of why this path exists.
        ':is(:hover, :focus-within)': scrollbarVars['--cl-scrollbar-thumb-hover'],
      },
    },
    // Longer leaving than arriving, per the duration tokens: hover is direct pointer feedback,
    // its decay is not. `linear` because this is a colour — an ease on top of an already
    // perceptually non-uniform interpolation only makes the midpoint drag.
    transitionDuration: {
      default: null,
      '@media (pointer: fine)': {
        default: durationVars['--cl-duration-base'],
        ':is(:hover, :focus-within)': durationVars['--cl-duration-fast'],
      },
    },
    transitionProperty: { default: null, '@media (pointer: fine)': '--_cl-scrollbar-thumb-color' },
    transitionTimingFunction: { default: null, '@media (pointer: fine)': 'linear' },
  },

  /**
   * The scrollbar's own paint. Only the lane's size and the thumb are styled — the track is left
   * alone, so the thumb reads as floating over the content rather than riding in a rail.
   *
   * The thumb's two states are COMBINED keys rather than a `:hover` nested inside the
   * `::-webkit-scrollbar-thumb` block: StyleX emits a nested pseudo-class BEFORE the
   * pseudo-element (`:hover::-webkit-scrollbar-thumb`), which asks whether the scroller is
   * hovered — a question already answered on `thumbColor` above. These are the thumb's own
   * states, and a combined key is the only way to reach them. Their source order is set by the
   * sort-keys rule and doesn't matter: StyleX prices `:active` above `:hover` either way.
   *
   * Both snap rather than transition, by design and in common with Polaris: `transition` is not
   * inherited, so the declaration on the scroller doesn't reach the pseudo-element. A pointer
   * already on the thumb wants the response to feel like contact anyway.
   */
  scrollbar: {
    '::-webkit-scrollbar': {
      width: { default: null, '@media (pointer: fine)': scrollbarWidth },
    },
    '::-webkit-scrollbar-thumb': {
      // A transparent border clipped away is how you inset a pill thumb: the lane keeps its full
      // width for hit-testing while the paint shrinks to the middle of it. Both Polaris and
      // `references/stylex-ui` arrive at this independently — a scrollbar pseudo-element has no
      // padding to do it with. (Key order here is the sort-keys rule's, not ours.)
      borderColor: { default: null, '@media (pointer: fine)': 'transparent' },
      borderRadius: { default: null, '@media (pointer: fine)': radiusVars['--cl-radius-full'] },
      borderStyle: { default: null, '@media (pointer: fine)': 'solid' },
      borderWidth: { default: null, '@media (pointer: fine)': scrollbarVars['--cl-scrollbar-thumb-inset'] },
      backgroundClip: { default: null, '@media (pointer: fine)': 'content-box' },
      backgroundColor: {
        default: null,
        '@media (pointer: fine)': {
          // The pseudo-element only reads; the animating value is produced on `thumbColor` above.
          // eslint-disable-next-line @stylexjs/valid-styles -- valid-styles doesn't resolve a `stylex.types.color()` var to a colour; the compiler does.
          default: thumbColor,
          // No `scrollbar-color: auto` lever survives on this path, so forced colors need their
          // own answer: pin the thumb to a system colour rather than let a themed one lose its
          // contrast guarantee against a palette we no longer control. Declared on
          // `background-color` rather than on the var so it holds across all four states at once.
          '@media (forced-colors: active)': 'ButtonBorder',
        },
      },
    },
    // eslint-disable-next-line @stylexjs/valid-styles -- StyleX's pseudo-element allowlist holds the bare selectors only; it compiles the combined form correctly. See the note above.
    '::-webkit-scrollbar-thumb:active': {
      '--_cl-scrollbar-thumb-color': {
        default: null,
        '@media (pointer: fine)': scrollbarVars['--cl-scrollbar-thumb-active'],
      },
    },
    // eslint-disable-next-line @stylexjs/valid-styles -- see above.
    '::-webkit-scrollbar-thumb:hover': {
      '--_cl-scrollbar-thumb-color': {
        default: null,
        '@media (pointer: fine)': scrollbarVars['--cl-scrollbar-thumb-hover'],
      },
    },
  },

  /** Paint-only, so it can never shift the content the way a sticky shadow element does. */
  mask: {
    maskImage,
    maskPosition: 'left top, right top',
    maskRepeat: 'no-repeat',
    // Held back from the scrollbar only where we actually paint one, which is the same pair of
    // conditions the rules above run under: a fine pointer, and an engine that implements
    // `::-webkit-scrollbar`. This is not a fallback branch for the scrollbar styling — there
    // isn't one — it is the mask asking whether there is a lane to keep clear. Firefox answers
    // no and gets the fade edge to edge rather than an unfaded strip beside a bar we never
    // styled.
    maskSize: {
      default: '100% 100%, 0px 100%',
      '@media (pointer: fine)': {
        '@supports selector(::-webkit-scrollbar)': `calc(100% - ${scrollbarWidth}) 100%, ${scrollbarWidth} 100%`,
      },
    },
  },

  // Only the name is gated on timeline support. A browser that ignores `animation-timeline`
  // would otherwise run these on the document timeline at the default `0s` duration, land
  // on the end frame immediately, and paint both fades permanently. With no name the
  // remaining animation properties are inert, the vars hold at their registered
  // `initial-value: 0`, and the mask resolves to fully opaque — so an unsupported browser
  // gets a plain scroll area rather than a broken one.
  indicators: {
    // eslint-disable-next-line @stylexjs/valid-styles -- `animation-range` postdates StyleX's property allowlist; it compiles and emits correctly.
    animationRange: `0px ${fadeRange}, calc(100% - ${fadeRange}) 100%`,
    animationFillMode: 'both',
    animationName: {
      default: null,
      '@supports (animation-timeline: scroll())': `${revealStart}, ${revealEnd}`,
    },
    animationTimeline: 'scroll(self block), scroll(self block)',
    animationTimingFunction: 'linear',
  },

  // Not focusable by default — see the `tabIndex` note on the component. Styled anyway so it
  // looks right the moment a consumer opts in.
  focusRing: {
    outline: { default: null, ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}` },
    outlineOffset: { default: null, ':focus-visible': space['0.5'] },
  },
});

// Gutter only — the scrollbar's own size is a theme token (`--cl-scrollbar-width`), since
// Mosaic has no reason to size scrollbars differently between components. What varies per
// instance is whether the space is held open, which is a layout decision about the
// surrounding content rather than an appearance one.
const gutters = stylex.create({
  // The default, and CSS's own. Nothing is reserved until a scrollbar actually appears, which
  // is right whenever the content can't change height while mounted — no shift is possible,
  // so holding space open would only cost width.
  auto: {
    scrollbarGutter: 'auto',
  },
  // Opt in where the content CAN change height in place — a filterable or paginated
  // collection — so crossing the overflow threshold doesn't shift the rows sideways.
  stable: {
    scrollbarGutter: 'stable',
  },
});

export type ScrollAreaGutter = keyof typeof gutters;

/**
 * The scroll surface, as StyleX atoms to spread onto an element you already render.
 *
 * There is no `<ScrollArea>` component: everything here is CSS, so a component would only add
 * a DOM node and an API to version. Put these on whatever already scrolls — an `Item.Group`,
 * a list, a panel body — and it keeps its own slot class, which stays the hook a theme
 * targets.
 *
 * ```tsx
 * <div {...stylex.props(scrollAreaRoot)}>
 *   <Item.Group {...stylex.props(...scrollAreaViewport())}>{rows}</Item.Group>
 * </div>
 * ```
 *
 * @param gutter - Whether the scrollbar's space is held open. `auto` (the default, and CSS's
 * own) takes it only while the content overflows. `stable` reserves it either way, which is
 * worth it when the content can change height **in place** — a filterable or paginated
 * collection — so crossing the overflow threshold doesn't shift the rows sideways. Neither
 * does anything on platforms that overlay their scrollbars.
 */
export function scrollAreaViewport(gutter: ScrollAreaGutter = 'auto') {
  return [
    styles.viewport,
    styles.thumbColor,
    styles.scrollbar,
    styles.mask,
    styles.indicators,
    styles.focusRing,
    gutters[gutter],
  ] as const;
}

/**
 * The positioned ancestor. Only needed when something has to anchor against the scroll box —
 * an overlay replacing the default mask, or a future scrollbar. A scroll surface whose parent
 * is already positioned doesn't need it.
 */
export const scrollAreaRoot = styles.root;
