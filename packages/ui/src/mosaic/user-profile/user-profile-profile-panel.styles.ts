import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../tokens.stylex';

export const styles = stylex.create({
  avatarControl: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    position: 'relative',
  },
  avatarButton: {
    borderWidth: 0,
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
  card: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-container'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    rowGap: 0,
  },
  contactHeader: {
    gap: space['3'],
    paddingInline: space['4'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBlockStart: space['4'],
  },
  contactList: {
    paddingBlock: space['2'],
    paddingInline: space['2'],
  },
  contactValue: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
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
  fieldLabel: {
    color: colorVars['--cl-color-neutral-foreground'],
    fontWeight: 510,
  },
  input: {
    flexShrink: 0,
    maxWidth: '50%',
    width: '10.9375rem',
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
});
