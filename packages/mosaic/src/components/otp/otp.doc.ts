import type { ComponentDoc } from '../../docs-schema';
import type { OtpProps } from './otp';

export default {
  name: 'Otp',
  description:
    'A fixed-length verification code field: one box per character. Focus moves on as the user types, and a pasted code fills every box. The ref points at the first box.',
  useFor: ['a one-time code input', 'an email or SMS verification code', 'a TOTP code from an authenticator app'],
  keywords: ['otp', 'one-time code', 'verification code', 'pin', '2fa', 'mfa', 'code input'],
  practices: [
    { do: true, text: 'Render it inside `Field.Root` so the label targets the first box and errors mark it invalid.' },
    { do: true, text: 'Pass `name` when it sits in a plain `<form>`. A hidden input submits the whole code.' },
    {
      do: false,
      text: 'Build a verification step from it by hand. Use the steps in `src/blocks/verification/`, such as `VerificationCode`.',
    },
  ],
  parts: {
    Otp: {
      description:
        'A `role="group"` of inputs. Carries `data-status` and `data-disabled`; each box is a `cl-otp-slot`.',
      slot: 'cl-otp',
      props: {
        length: { type: 'number', doc: 'The number of boxes.', default: '6' },
        value: { type: 'string', doc: 'The code, when controlled.' },
        defaultValue: { type: 'string', doc: 'The code on mount, when uncontrolled.', default: "''" },
        onValueChange: { type: '(value: string) => void', doc: 'Called with the whole code on every change.' },
        onComplete: { type: '(value: string) => void', doc: 'Called with the code once every box is filled.' },
        pattern: {
          type: "'numeric' | 'alpha' | 'alphanumeric'",
          doc: '`numeric`, `alpha` or `alphanumeric`. Other characters are dropped.',
          default: "'numeric'",
        },
        mask: { type: 'boolean', doc: 'Masks each box like a password.', default: 'false' },
        status: {
          type: 'OtpStatus',
          doc: 'Colors every box for the outcome: `neutral`, `success` or `error`.',
          default: '`error` when the enclosing `Field` is invalid, else `neutral`',
        },
        name: { type: 'string', doc: 'Submits the code under this name through a hidden input.' },
      },
    },
  },
  examples: [
    {
      title: 'A code field',
      code: `
<Field.Root>
  <Field.Label>Verification code</Field.Label>
  <Otp onComplete={onSubmitCode} />
</Field.Root>
`,
    },
  ],
  related: ['VerificationCode', 'Field'],
} satisfies ComponentDoc<{ Otp: OtpProps }>;
