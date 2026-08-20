import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../tokens.stylex';

export const deviceDialogStyles = stylex.create({
  popup: {
    maxWidth: '30rem',
  },
  content: {
    paddingBlockEnd: space['4'],
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailRow: {
    gap: space['4'],
    paddingBlock: space['2.5'],
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    borderTopColor: colorVars['--cl-color-border-faded'],
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    minHeight: space['10'],
  },
  detailValue: {
    gap: space['1.5'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    overflowWrap: 'anywhere',
    textAlign: 'end',
  },
  muted: {
    color: colorVars['--cl-color-neutral-faded'],
  },
  error: {
    marginTop: space['3'],
  },
  footer: {
    justifyContent: 'flex-end',
  },
});
