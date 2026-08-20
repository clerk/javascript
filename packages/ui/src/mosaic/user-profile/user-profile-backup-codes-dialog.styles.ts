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
    padding: space['4'],
    borderRadius: radiusVars['--cl-radius-md'],
    gap: space['2'],
    backgroundColor: colorVars['--cl-color-neutral-faded'],
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  actions: {
    gap: space['2'],
    display: 'flex',
    flexWrap: 'wrap',
  },
  footerButton: {
    flex: '1',
  },
});
