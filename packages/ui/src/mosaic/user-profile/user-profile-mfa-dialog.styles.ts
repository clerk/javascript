import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

export const mfaDialogStyles = stylex.create({
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
  field: {
    width: '100%',
  },
  footerButton: {
    flex: '1',
  },
  setup: {
    gap: space['3'],
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  pending: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
  },
  phoneOptions: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  phoneOption: {
    justifyContent: 'flex-start',
    width: '100%',
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
  backupActions: {
    gap: space['2'],
    display: 'flex',
    flexWrap: 'wrap',
  },
  qrPlaceholder: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    alignItems: 'center',
    aspectRatio: '1',
    backgroundColor: colorVars['--cl-color-card'],
    color: colorVars['--cl-color-neutral'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    justifyContent: 'center',
    width: '10rem',
  },
  secret: {
    padding: space['3'],
    borderRadius: radiusVars['--cl-radius-md'],
    backgroundColor: colorVars['--cl-color-neutral-faded'],
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    overflowWrap: 'anywhere',
    width: '100%',
  },
  resend: {
    gap: space['1'],
    alignItems: 'center',
    display: 'flex',
  },
});
