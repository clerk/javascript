import * as stylex from '@stylexjs/stylex';

import { colorVars, space, typeScaleVars } from '../../tokens.stylex';

const compact = '@container (width < 40rem)' as const;

export const styles = stylex.create({
  root: {
    gap: space['4'],
    containerType: 'inline-size',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    width: '100%',
  },
  // Room to scroll the last rows clear of a bulk bar pinned to the frame — only while it is
  // showing, and not when the bar is fixed to the window instead.
  rootWithBulkBar: {
    paddingBlockEnd: space['8'],
  },
  // The sub-tabs' equivalent of `rootWithBulkBar`: a spacer at the foot of the scroll content.
  bulkSpacer: {
    flexShrink: 0,
    height: space['8'],
  },
  // Tabs and the toolbar above the table.
  header: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
  },
  member: {
    gap: space['2.5'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
  },
  // A pending-invite placeholder: a dashed ring around a muted user glyph, in place of a photo.
  invitationAvatar: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
  invitationAvatarRing: {
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  memberText: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
  nameColumn: {
    minWidth: '250px',
  },
  name: {
    overflow: 'hidden',
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  you: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
  email: {
    overflow: 'hidden',
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  // At least as wide as the "Change role" trigger, so a short role list lines the popup up with the
  // button; a longer label grows it past the button, and the centered placement keeps it balanced.
  roleMenuPopup: {
    minWidth: 'var(--cl-anchor-width)',
  },
  bulkActionBarOverlayPositioner: {
    bottom: space['5'],
  },
  // The embedded profile has no bounded frame, so the bar pins to the window — centered, like a
  // modal's floating bar — rather than tracking the content column.
  bulkActionBarViewportPositioner: {
    position: 'fixed',
    bottom: space['5'],
  },
  toolbar: {
    gap: space['3'],
    alignItems: { [compact]: 'stretch', default: 'center' },
    display: 'flex',
    flexDirection: { [compact]: 'column', default: 'row' },
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Search and the role filter, grouped together at the start of the toolbar.
  toolbarStart: {
    gap: space['2'],
    alignItems: { [compact]: 'stretch', default: 'center' },
    display: 'flex',
    flexDirection: { [compact]: 'column', default: 'row' },
    flexGrow: 1,
    flexWrap: 'wrap',
    width: { [compact]: '100%', default: 'auto' },
  },
  toolbarSearch: {
    flexBasis: { [compact]: 'auto', default: '16rem' },
    flexGrow: 1,
    maxWidth: { [compact]: 'none', default: '20rem' },
    minWidth: '12rem',
    width: { [compact]: '100%', default: 'auto' },
  },
  toolbarSearchControl: {
    minHeight: { default: space['8'], '@media (pointer: coarse)': space['8'] },
  },
  toolbarSearchInput: {
    paddingInlineStart: space['2'],
  },
  toolbarControl: {
    width: { [compact]: '100%', default: 'auto' },
  },
  toolbarActions: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    width: { [compact]: '100%', default: 'auto' },
  },
  actions: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  empty: {
    paddingBlock: space['10'],
  },
});
