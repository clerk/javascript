import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../tokens.stylex';

export const backupCodesDialogStyles = stylex.create({
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  content: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
  },
  pending: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
  },
  codes: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: colorVars['--cl-color-card'],
    overflow: 'hidden',
  },
  codeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  rowDivider: {
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
  },
  code: {
    paddingBlock: space['3'],
    paddingInline: space['4'],
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  columnDivider: {
    borderInlineStartColor: colorVars['--cl-color-border'],
    borderInlineStartStyle: 'solid',
    borderInlineStartWidth: '1px',
  },
  footerButton: {
    flex: '1',
  },
});
