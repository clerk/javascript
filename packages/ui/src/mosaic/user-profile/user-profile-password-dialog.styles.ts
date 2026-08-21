import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../tokens.stylex';

export const passwordDialogStyles = stylex.create({
  checkbox: {
    accentColor: colorVars['--cl-color-primary'],
    flexShrink: 0,
    height: space['4'],
    marginTop: space['0.5'],
    width: space['4'],
  },
  checkboxCopy: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  checkboxRow: {
    gap: space['2'],
    alignItems: 'flex-start',
    cursor: 'pointer',
    display: 'flex',
  },
  checkboxRowDisabled: {
    cursor: 'not-allowed',
  },
  fields: {
    gap: space['2.5'],
    display: 'flex',
    flexDirection: 'column',
  },
  field: {
    gap: space['2'],
    display: 'grid',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  footerButton: {
    flex: '1',
  },
});
