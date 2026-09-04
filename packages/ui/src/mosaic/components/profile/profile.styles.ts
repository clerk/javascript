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
 * The compact layout — navigation on top, as a row — queried against the profile's OWN width
 * rather than the window's, so the same surface collapses in a narrow layout slot, an inline
 * dialog, or a phone alike. A container cannot query itself, which is why the grid lives on an
 * inner element: the root is the container, the layout inside it is what the query reshapes.
 */
const compact = '@container cl-profile (max-width: 48rem)' as const;

/** How far the content's clip edge — and the scrollbar with it — sits inside the frame's corners. */
const SCROLL_INSET = space['1.5'];

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
   * Over the page the popup decides the height: the root grows to fill it (the popup is a column
   * flex) and the frame inside follows. Not inline — an inline dialog is in flow and has no height
   * of its own to hand down, so the frame keeps its fixed one.
   */
  rootInDialog: {
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
    backgroundColor: colorVars['--cl-color-card'],
    blockSize: {
      [compact]: '100dvh',
      default: '45rem',
    },
    // In a page — standalone or inline — the frame is its border alone, the way a card sits flat in
    // content. The card's elevation belongs to the overlay; see `layoutInDialog`.
    boxShadow: 'none',
    color: colorVars['--cl-color-card-foreground'],
    display: 'grid',
    gridTemplateColumns: {
      [compact]: 'minmax(0, 1fr)',
      default: `calc(${space['40']} + ${space['15']}) minmax(0, 1fr)`,
    },
    gridTemplateRows: 'minmax(0, 1fr)',
    minHeight: 0,
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
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
  },

  /** Inside the sheet: no column edge, and the sheet's own content padding frames it. */
  navInSheet: {
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
      ':where([data-selected])': colorVars['--cl-color-border-faded'],
      ':active': colorVars['--cl-color-border-faded'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active):not([data-selected])': colorVars['--cl-color-border-faded'],
      },
    },
    color: {
      default: colorVars['--cl-color-neutral-faded'],
      ':where([data-selected])': colorVars['--cl-color-card-foreground'],
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
    maxInlineSize: '56rem',
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
  caret: {
    color: colorVars['--cl-color-neutral-faded'],
    marginInlineStart: '0.25em',
  },
});

export const contentScroll = scrollAreaRoot;
// A held gutter: switching to a page that does not scroll must not reflow the one that did.
export const contentViewportScroll = scrollAreaViewport('stable');
