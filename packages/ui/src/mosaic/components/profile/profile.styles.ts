import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  space,
  targetVars,
  typeScaleVars,
} from '../../tokens.stylex';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';

/**
 * The compact layout, queried against the nearest container rather than the window: the root
 * itself standalone or inline, so the same surface collapses in a narrow layout slot or an inline
 * dialog alike — and over the page the dialog's viewport, since the root stops being a container
 * there (`rootInDialog`). The popup floats inside an inset, so its content is always narrower than
 * the screen; measured on its own the profile would collapse a step before the dialog filled the
 * screen, and for that stretch stand frameless inside a floating popup. Reading the same box the
 * dialog reads, the two change together. Unnamed on purpose: a name would bind it to one of them.
 * A container cannot query itself, which is why the grid lives on an inner element: the root is
 * the container, the layout inside it is what the query reshapes.
 *
 * `48rem` is the dialog's phone band too (`PHONE` in `dialog.styles.ts`); the two must agree, and
 * a literal in each is what StyleX allows — a value shared through `defineConsts` reaches an
 * at-rule prelude as a placeholder that swingset's bundler does not always resolve.
 */
const compact = '@container (width < 48rem)';

/** How far the content's clip edge — and the scrollbar with it — sits inside the frame's corners. */
const SCROLL_INSET = space['1.5'];

const NAV_WIDTH = `calc(${space['40']} + ${space['15']})`;
/** The pages' reading width — see `contentBody`. */
const CONTENT_MAX_WIDTH = '56rem';

const NAV_GAP = space['0.5'];
const HALF_GAP = `calc(-1 * ${NAV_GAP} / 2)`;

export const styles = stylex.create({
  /**
   * The query container, and the flex column the frame fills. It paints NOTHING and carries no
   * band of its own — an element is never its own query container, so every compact rule lives on
   * `layout`, one level inside. It is also the containing block for the dismiss the root carries
   * inside a dialog. `maxWidth` here so the frame inside is what the width clamps.
   */
  root: {
    // Centred where the host is wider — a `profile` dialog's popup spans the viewport. The frame
    // runs wide; the content inside is held to a reading width of its own, see `contentBody`.
    marginInline: 'auto',
    containerName: 'cl-profile',
    containerType: 'inline-size',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    maxWidth: '94.625rem',
    width: '100%',
  },

  /**
   * The compact query's answer, for `Profile.Root` to read: `1px` wide, `2px` once the query
   * matches. Inside the root because an element is never its own query container; out of flow,
   * unpainted and untouchable, so it costs the layout nothing.
   */
  sentinel: {
    blockSize: '1px',
    inlineSize: {
      [compact]: '2px',
      default: '1px',
    },
    pointerEvents: 'none',
    position: 'absolute',
    visibility: 'hidden',
  },

  /**
   * Over the page the popup decides the height: the root grows to fill it (the popup is a column
   * flex) and the frame inside follows. Not inline — an inline dialog is in flow and has no height
   * of its own to hand down, so the frame keeps its fixed one.
   */
  rootInDialog: {
    // Not a container over the page: the compact query then reaches the dialog's viewport, and the
    // profile collapses exactly when the dialog fills the screen — see `compact`.
    containerType: 'normal',
    flexGrow: 1,
    minHeight: 0,
  },

  /**
   * The frame: border, radius and background, so the profile looks the same standalone and as the
   * content of a `profile` dialog — that size paints nothing itself. Compact, the frame goes: the
   * profile is the page there, flush with whatever holds it — a full-screen popup or an inline host.
   *
   * The height is FIXED, not content-driven: switching pages must never resize the surface or shift
   * the page around it. Standalone and inline it is `45rem` — compact, the viewport's height —
   * and a host with a definite slot overrides it with one rule. Over the page the popup decides
   * instead; see `layoutInDialog`.
   *
   * The grid inside: a definite row is what lets the content column scroll instead of growing — an
   * `auto` row sizes to its content and happily exceeds the container.
   */
  layout: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: {
      [compact]: 0,
      default: radiusVars['--cl-radius-xl'],
    },
    borderStyle: 'solid',
    borderWidth: {
      [compact]: '0px',
      default: '1px',
    },
    // `clip` rather than `hidden`: the surface must never become a scroll container itself, or
    // focusing something in the content column would scroll the whole surface instead of the column.
    overflow: 'clip',
    backgroundColor: colorVars['--cl-color-background'],
    blockSize: {
      [compact]: '100dvh',
      default: '45rem',
    },
    // In a page — standalone or inline — the frame is its border alone, the way a card sits flat in
    // content. The card's elevation belongs to the overlay; see `layoutInDialog`.
    boxShadow: 'none',
    color: colorVars['--cl-color-foreground'],
    display: 'grid',
    gridTemplateColumns: {
      [compact]: 'minmax(0, 1fr)',
      default: `${NAV_WIDTH} minmax(0, 1fr)`,
    },
    gridTemplateRows: 'minmax(0, 1fr)',
    minHeight: 0,
  },

  /**
   * Inline, the profile is the page's own content: no frame, no background, no fixed height, and
   * no scroll region of its own — the page scrolls. Flush with whatever holds it.
   */
  layoutInline: {
    borderRadius: 0,
    borderWidth: '0px',
    marginInline: 'auto',
    overflow: 'visible',
    backgroundColor: 'transparent',
    blockSize: 'auto',
    boxShadow: 'none',
    // No frame to inset from, so neither column carries padding; a gap holds them apart.
    columnGap: space['10'],
    gridTemplateRows: 'auto',
    // As wide as the navigation, the gap and the pages' reading column, centred in the host. The
    // explicit width matters: auto margins on a column-flex item otherwise shrink it to its content.
    inlineSize: '100%',
    maxWidth: `calc(${NAV_WIDTH} + ${space['10']} + ${CONTENT_MAX_WIDTH})`,
  },

  layoutInDialog: {
    blockSize: 'auto',
    // Lifted off the page like a card in a dialog: the card's elevation, none compact, where the
    // popup is the screen and there is nothing to lift off.
    boxShadow: {
      [compact]: 'none',
      default: shadowVars['--cl-shadow-card'],
    },
    flexGrow: 1,
    minHeight: 0,
  },

  nav: {
    padding: space['4'],
    borderInlineEndColor: colorVars['--cl-color-border'],
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: '1px',
    // Until measured — before hydration, or the first observer callback — the column renders in
    // place at any width, so compact CSS hides it rather than stack a tablist over the page. The
    // sheet's copy is portalled out of the container and never matches.
    display: {
      [compact]: 'none',
      default: 'flex',
    },
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
  },

  /**
   * Nothing to inset from and no pages beside it to edge: inline there is no frame, and in the
   * sheet the sheet's own content padding frames it.
   */
  navFlush: {
    padding: 0,
    borderInlineEndWidth: '0px',
  },

  navList: {
    gap: NAV_GAP,
    display: 'flex',
    flexDirection: 'column',
    // Positioned, and a stacking context of its own, so a consumer can hang marks off it — an
    // anchor-positioned highlight as `::before` / `::after` at `z-index: -1` lands under the items'
    // text and above this surface's background. See the Profile docs' customisation example.
    isolation: 'isolate',
    position: 'relative',
    minWidth: 0,
  },

  navItem: {
    borderColor: 'transparent',
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '0px',
    gap: space['2'],
    paddingBlock: space['2'],
    paddingInline: space['2.5'],
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':where([data-selected])': colorVars['--cl-color-border-subtle'],
      ':active': colorVars['--cl-color-border-subtle'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active):not([data-selected])': colorVars['--cl-color-border-subtle'],
      },
    },
    color: {
      default: colorVars['--cl-color-foreground-secondary'],
      ':where([data-selected])': colorVars['--cl-color-foreground'],
    },
    cursor: 'pointer',
    display: 'flex',
    flexShrink: 0,
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    // The containing block for the hit target below, and for nothing else.
    position: 'relative',
    textAlign: 'start',
    whiteSpace: 'nowrap',
    minHeight: {
      default: null,
      '@media (pointer: coarse)': targetVars['--cl-target-coarse'],
    },
    width: '100%',
    // Spans half the gap to each neighbour, so the pointer never falls between destinations. The
    // ends stay flush with the list.
    '::before': {
      insetInline: 0,
      content: '""',
      insetBlockEnd: {
        default: HALF_GAP,
        ':last-of-type': 0,
      },
      insetBlockStart: {
        default: HALF_GAP,
        ':first-of-type': 0,
      },
      position: 'absolute',
    },
  },

  navItemIcon: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
  },

  branding: {
    display: 'block',
    marginBlockStart: 'auto',
  },

  // The content column is the scroll region — composed from the `ScrollArea` atoms, so the
  // scrollbar and edge fade land on the column's edge and the padding scrolls with the content.
  //
  // The column, not the scroller, carries a little of the block padding: a scroll container clips
  // at its padding edge, so padding on the scroller would not keep content out of the frame's
  // rounded corners. Here the clip edge sits inside them, and the scroller gives the same amount
  // back so the page's own padding reads unchanged.
  content: {
    paddingBlock: {
      [compact]: 0,
      default: SCROLL_INSET,
    },
    minWidth: 0,
  },
  /** Inline the column is not a scroll region, so it carries no inset for a clip edge. */
  contentInline: {
    paddingBlock: 0,
  },

  /** Inline the pages carry no padding of their own: the headline starts level with the first destination. */
  contentViewportInline: {
    paddingBlock: 0,
    paddingInline: 0,
  },

  /** Inline, the branding closes out the pages' column instead of the navigation's. */
  contentBranding: {
    marginBlockStart: space['8'],
  },

  contentViewport: {
    paddingBlock: {
      [compact]: space['6'],
      default: `calc(${space['16']} - ${SCROLL_INSET})`,
    },
    paddingInline: {
      [compact]: space['6'],
      default: space['16'],
    },
  },

  /** The pages' column: held to a reading width and centred, however wide the frame runs. */
  contentBody: {
    marginInline: 'auto',
    maxInlineSize: CONTENT_MAX_WIDTH,
  },

  /** The headline row. */
  pageTitle: {
    display: 'block',
  },

  /**
   * The headline as a button: the heading's own type, inline so the caret can align to its
   * x-height, with a little room around it for the focus ring.
   */
  navTrigger: {
    font: 'inherit',
    borderRadius: radiusVars['--cl-radius-md'],
    marginInline: `calc(-1 * ${space['1']})`,
    paddingInline: space['1'],
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline',
    textAlign: 'start',
  },
  /**
   * Beside the title, `vertical-align: middle`: the caret's midpoint on the baseline plus half the
   * x-height, which centres it on the lowercase letters rather than the line box. Sized in `em`
   * through the icon's `inherit` size, so it scales with the heading; coloured through the icon's
   * own variable rather than `color`, which the icon sets itself.
   */
  caret: {
    '--_cl-icon-color': colorVars['--cl-color-foreground-secondary'],
    fontSize: '0.6em',
    marginInlineStart: '0.25em',
    verticalAlign: 'middle',
  },
});

export const contentScroll = scrollAreaRoot;
// A held gutter: switching to a page that does not scroll must not reflow the one that did.
export const contentViewportScroll = scrollAreaViewport('stable');
