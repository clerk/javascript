import * as stylex from '@stylexjs/stylex';

import { scrollAreaRoot, scrollAreaViewport } from './components/scroll-area';
import { colorVars, fontWeightVars, radiusVars, space, targetVars, typeScaleVars } from './tokens.stylex';

/**
 * The compact layout — sidebar on top, navigation as a row — queried against the page's OWN
 * width rather than the window's. The root is the container (`cl-profile-page`), so the same
 * page collapses in a narrow layout slot, an inline dialog, or a phone alike. A container cannot
 * query itself, which is why the grid lives on an inner element: the root is the container, the
 * layout inside it is what the query reshapes.
 */
const profilePageCompact = '@container cl-profile-page (max-width: 48rem)' as const;

export const styles = stylex.create({
  /**
   * The surface, and the query container. Paints the frame (border, radius, background) so the
   * page looks the same standalone and as the popup of a `panel` dialog — that size paints
   * nothing itself, and is composed by rendering the popup AS this root.
   *
   * A column flex so the layout below can take the remaining height: standalone that is the
   * `minHeight`, in a dialog it is the popup's stretched height, and either way the content
   * column scrolls inside it rather than growing past it.
   */
  root: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    // `clip` rather than `hidden`: the page must never become a scroll container itself, or
    // focusing something in the content column would scroll the whole page instead of the column.
    overflow: 'clip',
    backgroundColor: colorVars['--cl-color-card'],
    color: colorVars['--cl-color-card-foreground'],
    containerName: 'cl-profile-page',
    containerType: 'inline-size',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '66rem',
    minHeight: '37.5rem',
    width: '100%',
  },

  /** Inside a dialog the popup decides the height, so the standalone floor would only overflow it. */
  rootInDialog: {
    minHeight: null,
  },

  layout: {
    display: 'grid',
    flexGrow: 1,
    gridTemplateColumns: {
      default: `calc(${space['40']} + ${space['15']}) minmax(0, 1fr)`,
      [profilePageCompact]: 'minmax(0, 1fr)',
    },
    // A definite row is what lets the content column scroll instead of growing: an `auto` row
    // sizes to its content and happily exceeds the container.
    gridTemplateRows: {
      default: 'minmax(0, 1fr)',
      [profilePageCompact]: 'auto minmax(0, 1fr)',
    },
    minHeight: 0,
  },
  sidebar: {
    padding: space['4'],
    borderBlockEndColor: {
      default: 'transparent',
      [profilePageCompact]: colorVars['--cl-color-border'],
    },
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: {
      default: '0px',
      [profilePageCompact]: '1px',
    },
    borderInlineEndColor: colorVars['--cl-color-border'],
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: {
      default: '1px',
      [profilePageCompact]: '0px',
    },
    display: 'flex',
    flexDirection: {
      default: 'column',
      [profilePageCompact]: 'row',
    },
    minHeight: 0,
    minWidth: 0,
  },
  navigation: {
    gap: space['1'],
    display: 'flex',
    flexDirection: {
      default: 'column',
      [profilePageCompact]: 'row',
    },
    minWidth: 0,
    overflowX: {
      default: 'visible',
      [profilePageCompact]: 'auto',
    },
  },
  navigationItem: {
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
    textAlign: 'start',
    whiteSpace: 'nowrap',
    minHeight: {
      default: null,
      '@media (pointer: coarse)': targetVars['--cl-target-coarse'],
    },
    width: {
      default: '100%',
      [profilePageCompact]: 'auto',
    },
  },
  branding: {
    gap: space['1'],
    alignItems: 'center',
    color: colorVars['--cl-color-neutral-faded'],
    display: {
      default: 'flex',
      [profilePageCompact]: 'none',
    },
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    marginBlockStart: 'auto',
  },
  brandingLink: {
    borderRadius: radiusVars['--cl-radius-sm'],
    alignItems: 'center',
    color: 'inherit',
    display: 'inline-flex',
    height: space['4'],
  },
  // The content column is the scroll region — composed from the `ScrollArea` atoms, so the
  // scrollbar and edge fade land on the column's true edge and the padding scrolls with the content.
  main: { minWidth: 0 },
  content: {
    paddingBlock: space['16'],
    paddingInline: space['16'],
  },
});

export const mainScroll = scrollAreaRoot;
export const contentScroll = scrollAreaViewport();
