import type { ComponentDoc } from '../../docs-schema';
import type { OtpInputProps } from './otp-input';
import type { OtpProps } from './otp-root';

export default {
  name: 'Otp',
  description:
    'Headless, unstyled one-time-code input, one `input` per character over a single string value. Typing advances focus, `Backspace` walks back, and a paste or SMS autofill fills every slot. `Otp.useOtp()` reads the value and the slot list inside the root.',
  useFor: [
    'entering a verification code sent by SMS or email',
    'an authenticator (TOTP) code field',
    'a fixed-length PIN split into one box per character',
  ],
  keywords: ['otp', 'one-time code', 'verification code', 'pin', 'totp', 'sms code', '2fa'],
  practices: [
    {
      do: true,
      text: 'Render one `Otp.Input` per entry in `Otp.useOtp().slots`, keyed and indexed by `slot.index`.',
    },
    {
      do: true,
      text: 'Name the field with `aria-label` or `aria-labelledby` on `Otp.Root`, or a `<label>` for its `id`.',
    },
    { do: true, text: 'Pass `name` to submit the code from a plain `<form>`.' },
    {
      do: false,
      text: 'Use it directly in a feature. Use the styled `Otp` in `src/components/otp/`, or `VerificationCode` in `src/blocks/verification/` for a code step.',
    },
    { do: false, text: 'Pass `id` or `aria-label` to the first `Otp.Input`. It takes both from the root.' },
  ],
  parts: {
    'Otp.Root': {
      description:
        'Owns the value and focus, and renders a `div` with `role="group"`. Carries `data-empty`, `data-complete` and `data-disabled`.',
      props: {
        length: { type: 'number', doc: 'The number of slots.' },
        value: { type: 'string', doc: 'The code, when controlled.' },
        defaultValue: { type: 'string', doc: 'The code on mount, when uncontrolled.', default: "''" },
        onValueChange: { type: '(value: string) => void', doc: 'Called with the full value on every change.' },
        onComplete: { type: '(value: string) => void', doc: 'Called once when the last slot fills.' },
        pattern: {
          type: 'OtpPattern',
          doc: 'The allowed characters. Others and whitespace are stripped.',
          default: "'numeric'",
        },
        mask: { type: 'boolean', doc: 'Renders slots as password inputs.', default: 'false' },
        name: { type: 'string', doc: 'Submits the value through a hidden input under this name.' },
        disabled: { type: 'boolean', doc: 'Disables every slot.', default: 'false' },
        focusableWhenDisabled: {
          type: 'boolean',
          doc: 'Keeps disabled slots focusable as read-only and `aria-disabled`.',
          default: 'false',
        },
        required: {
          type: 'boolean',
          doc: 'Marks every slot required, so a partial code fails form validation.',
          default: 'false',
        },
        id: {
          type: 'string',
          doc: 'Lands on the first slot, so a `<label>` can target it. Later slots take `${id}-2` and on.',
        },
      },
    },
    'Otp.Input': {
      description:
        'One character slot, as an `input` with a roving tab index. Carries `data-active`, `data-filled` and `data-disabled`. Focus snaps back to the first empty slot.',
      props: { index: { type: 'number', doc: 'The slot position, from `slot.index`.' } },
    },
  },
  examples: [
    {
      title: 'Six-digit code',
      code: `
<Otp.Root length={6} aria-label='Verification code' onComplete={submit}>
  <Slots />
</Otp.Root>

function Slots() {
  const { slots } = Otp.useOtp();
  return slots.map(slot => <Otp.Input key={slot.index} index={slot.index} />);
}
`,
    },
  ],
  related: ['VerificationCode'],
} satisfies ComponentDoc<{
  'Otp.Root': OtpProps;
  'Otp.Input': OtpInputProps;
}>;
