import * as stylex from '@stylexjs/stylex';

import { colorVars, scrollbarVars, scrollFadeVars, space } from '../../tokens.stylex';
import { scrollAreaVars } from './scroll-area.vars.stylex';

// Same-file locals so the `var()` references read as names rather than as a wall of
// bracket lookups inside the gradient. StyleX inlines them at build; an imported helper
// would fail static evaluation.
const progressStart = scrollAreaVars['--cl-scroll-area-progress-start'];
const progressEnd = scrollAreaVars['--cl-scroll-area-progress-end'];
const fadeSize = scrollFadeVars['--cl-scroll-fade-size'];
const fadeRange = scrollFadeVars['--cl-scroll-fade-range'];
const fadeInset = scrollFadeVars['--cl-scroll-fade-inset'];

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
// The second layer is the scrollbar strip, held opaque so the fade never touches it. At the
// default `0px` inset it is zero-wide and contributes nothing. Layers composite with `add`
// by default, so no `mask-composite` declaration is needed.
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
    scrollbarColor: {
      default: `${colorVars['--cl-color-neutral-faded']} transparent`,
      // Forced-colors users get the system scrollbar; a themed one loses its contrast
      // guarantee against a palette we no longer control.
      '@media (forced-colors: active)': 'auto',
    },
    scrollbarWidth: scrollbarVars['--cl-scrollbar-width'],
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  /** Paint-only, so it can never shift the content the way a sticky shadow element does. */
  mask: {
    maskImage,
    maskPosition: 'left top, right top',
    maskRepeat: 'no-repeat',
    maskSize: `calc(100% - ${fadeInset}) 100%, ${fadeInset} 100%`,
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
  return [styles.viewport, styles.mask, styles.indicators, styles.focusRing, gutters[gutter]] as const;
}

/**
 * The positioned ancestor. Only needed when something has to anchor against the scroll box —
 * an overlay replacing the default mask, or a future scrollbar. A scroll surface whose parent
 * is already positioned doesn't need it.
 */
export const scrollAreaRoot = styles.root;
