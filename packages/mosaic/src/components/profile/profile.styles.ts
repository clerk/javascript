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

// Unnamed so over the page it queries the dialog's viewport; must match `PHONE` in `dialog.styles.ts`.
// A literal: `defineConsts` in an at-rule prelude breaks the swingset build.
const compact = '@container (width < 48rem)';
const phone = '@media (width < 40rem)';

const SCROLL_INSET = space['1.5'];

const NAV_WIDTH = `calc(${space['40']} + ${space['15']})`;
const CONTENT_MAX_WIDTH = '56rem';

const NAV_GAP = space['0.5'];
const HALF_GAP = `calc(-1 * ${NAV_GAP} / 2)`;

export const styles = stylex.create({
  // A fixed width so a content-sized `profile` dialog popup still takes the full width.
  root: {
    marginInline: 'auto',
    containerName: 'cl-profile',
    containerType: 'inline-size',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    maxWidth: '100%',
    width: '94.625rem',
  },

  sentinel: {
    blockSize: '1px',
    inlineSize: {
      [compact]: {
        default: '2px',
        [phone]: '3px',
      },
      default: '1px',
    },
    pointerEvents: 'none',
    position: 'absolute',
    visibility: 'hidden',
  },

  rootInDialog: {
    // Not a container here, so `compact` reaches the dialog's viewport.
    containerType: 'normal',
    flexGrow: 1,
    minHeight: 0,
  },

  // A fixed height so switching pages never resizes the surface.
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
    // `clip`, not `hidden`: a scroll container here would scroll the surface instead of the column.
    overflow: 'clip',
    backgroundColor: colorVars['--cl-color-background'],
    blockSize: {
      [compact]: '100dvh',
      default: '45rem',
    },
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

  layoutInline: {
    borderRadius: 0,
    borderWidth: '0px',
    marginInline: 'auto',
    overflow: 'visible',
    backgroundColor: 'transparent',
    blockSize: 'auto',
    boxShadow: 'none',
    columnGap: space['10'],
    gridTemplateRows: 'auto',
    // Explicit width: auto margins otherwise shrink a column-flex item to its content.
    inlineSize: '100%',
    maxWidth: `calc(${NAV_WIDTH} + ${space['10']} + ${CONTENT_MAX_WIDTH})`,
  },

  layoutInDialog: {
    borderWidth: '0px',
    blockSize: 'auto',
    boxShadow: {
      [compact]: 'none',
      default: shadowVars['--cl-shadow-lg'],
    },
    flexGrow: 1,
    minHeight: 0,
  },

  nav: {
    padding: space['4'],
    borderInlineEndColor: colorVars['--cl-color-border'],
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: '1px',
    // Hidden in CSS too, so the column never shows on a phone before measuring.
    display: {
      [compact]: 'none',
      default: 'flex',
    },
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
  },

  navFlush: {
    padding: 0,
    borderInlineEndWidth: '0px',
  },

  navPopup: {
    minWidth: 'max(12.5rem, var(--cl-anchor-width, 0px))',
  },

  navSheet: {
    minBlockSize: 0,
  },

  pageTitle: {
    marginBlockEnd: space['6'],
  },

  // Inline so the caret can align to the title's x-height.
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

  // `vertical-align: middle` centers the caret on the title's x-height rather than the line box.
  caret: {
    '--_cl-icon-color': colorVars['--cl-color-foreground-secondary'],
    marginInlineStart: space['1'],
    verticalAlign: 'middle',
  },

  navList: {
    gap: NAV_GAP,
    display: 'flex',
    flexDirection: 'column',
    // Positioned and isolated as hooks for consumer highlight marks at `z-index: -1`.
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
      ':focus-visible': colorVars['--cl-color-border-subtle'],
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
    position: 'relative',
    textAlign: 'start',
    whiteSpace: 'nowrap',
    // Above the neighbors, so the selected item's fill cannot cover the ring.
    zIndex: { default: null, ':focus-visible': 1 },
    minHeight: {
      default: null,
      '@media (pointer: coarse)': targetVars['--cl-target-coarse'],
    },
    width: '100%',
    // Spans half the gap each side so the pointer never falls between items.
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

  navItemBadge: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    marginInlineStart: 'auto',
  },

  branding: {
    display: 'block',
    marginBlockStart: 'auto',
  },

  // The clip edge sits inside the frame's corners; the scroller gives the padding back.
  content: {
    paddingBlock: {
      [compact]: 0,
      default: SCROLL_INSET,
    },
    minWidth: 0,
  },
  contentInline: {
    paddingBlock: 0,
  },

  contentViewportInline: {
    paddingBlock: 0,
    paddingInline: 0,
  },

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

  contentBody: {
    marginInline: 'auto',
    maxInlineSize: CONTENT_MAX_WIDTH,
  },
});

export const contentScroll = scrollAreaRoot;
// A stable gutter so a page that does not scroll does not reflow the one that did.
export const contentViewportScroll = scrollAreaViewport('stable');
