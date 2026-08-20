import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  // TODO: Replace with `Dialog.Header` once Mosaic has one; it should own this spacing.
  header: {
    gap: space['1'],
    display: 'flex',
    flexDirection: 'column',
  },
  // TODO: Replace with `Dialog.Body` once Mosaic has one. This scroll region is not cosmetic:
  // `viewportSizes.prompt` sets `overflow: clip` under 48rem, so without it a tall form on a
  // phone loses its submit button off the bottom of the sheet.
  //
  // A non-`visible` overflow on one axis computes the other to `auto`, so this clips horizontally
  // as well as vertically — and an `Input`'s focus ring is a 3px `box-shadow` on a full-width
  // control, so it was being sliced off at both sides. The padding gives the ring room; the
  // matching negative margin takes it back out of the layout, so nothing else shifts.
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
  // TODO: Replace with `Dialog.Footer` once Mosaic has one.
  footer: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  footerSpread: {
    justifyContent: 'space-between',
  },
  form: {
    gap: space['5'],
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  // TODO: Replace with the Mosaic Alert component. Both legacy call sites hand-roll a
  // `role="alert"` box because Clerk errors carrying no `paramName` have no field to land in.
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
  fields: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
  },
  // TODO: Replace with the Mosaic OTP component, built on the headless `@clerk/headless/otp`
  // primitive. This is a plain text input styled to look like cells.
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
  codeInputVerified: {
    borderColor: colorVars['--cl-color-positive'],
  },
  // TODO: Replace with the Mosaic Select component, built on `@clerk/headless/select`.
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
  status: {
    gap: space['3'],
    paddingBlock: space['6'],
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },
  statusIconPositive: {
    color: colorVars['--cl-color-positive'],
    height: space['8'],
    width: space['8'],
  },
  statusIconNegative: {
    color: colorVars['--cl-color-negative'],
    height: space['8'],
    width: space['8'],
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
  avatarRow: {
    gap: space['4'],
    alignItems: 'center',
    display: 'flex',
  },
  footerActions: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
  },
  resendRow: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
});
