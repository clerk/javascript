import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../tokens.stylex';

export const styles = stylex.create({
  avatarControl: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    position: 'relative',
  },
  avatarEditSurface: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-full'],
    borderStyle: 'solid',
    borderWidth: '1px',
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-card'],
    boxSizing: 'border-box',
    display: 'flex',
    insetInlineStart: '-4.5px',
    justifyContent: 'center',
    position: 'absolute',
    height: '20px',
    top: '25px',
    width: '20px',
  },
  contactHeader: {
    gap: space['3'],
    paddingInline: space['4'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBlockEnd: space['2'],
    paddingBlockStart: space['4'],
  },
  contactItem: {
    paddingInline: 0,
    minHeight: space['11'],
  },
  contactList: {
    paddingBlock: 0,
    paddingInline: space['4'],
  },
  contactValue: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
  },
  resourceList: {
    padding: 0,
  },
  dangerContent: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  divider: {
    marginInline: space['4'],
    backgroundColor: colorVars['--cl-color-border'],
    height: '1px',
  },
  providerIcon: {
    flexShrink: 0,
    objectFit: 'contain',
    height: space['6'],
    width: space['6'],
  },
  root: {
    gap: space['6'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  row: {
    gap: space['4'],
    paddingBlock: space['4'],
    paddingInline: space['4'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    minHeight: space['13'],
  },
  section: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    gap: space['3'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
});
