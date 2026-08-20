import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const securityDialogStyles = stylex.create({
  header: {
    gap: space['1'],
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    margin: '-0.25rem',
    padding: '0.25rem',
    flex: '1',
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflowY: 'auto',
  },
  footer: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  form: {
    gap: space['5'],
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  alert: {
    borderColor: colorVars['--cl-color-negative'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: space['2'],
    paddingInline: space['3'],
    backgroundColor: colorVars['--cl-color-negative-faded'],
    color: colorVars['--cl-color-negative'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
  },
  codeInput: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: space['3'],
    paddingInline: space['4'],
    backgroundColor: colorVars['--cl-color-input'],
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: typeScaleVars['--cl-text-xl-size'],
    letterSpacing: '0.5em',
    textAlign: 'center',
    width: '100%',
  },
  codeInputInvalid: {
    borderColor: colorVars['--cl-color-negative'],
  },
  countrySelect: {
    borderColor: colorVars['--cl-color-border'],
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: space['2'],
    paddingInline: space['2'],
    backgroundColor: colorVars['--cl-color-input'],
    borderEndEndRadius: 0,
    borderEndStartRadius: radiusVars['--cl-radius-md'],
    borderStartEndRadius: 0,
    borderStartStartRadius: radiusVars['--cl-radius-md'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
  },
  phoneRow: {
    display: 'flex',
    width: '100%',
  },
  phoneInput: {
    flex: '1',
    borderEndStartRadius: 0,
    borderStartStartRadius: 0,
    marginInlineStart: '-1px',
  },
  muted: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
  },
  identifier: {
    color: colorVars['--cl-color-neutral'],
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
  resendRow: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
});
