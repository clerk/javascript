import { Field } from '@clerk/ui/mosaic/components/field';
import type { OtpProps } from '@clerk/ui/mosaic/components/otp';
import { Otp } from '@clerk/ui/mosaic/components/otp';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './otp.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'OTP',
  source: 'packages/ui/src/mosaic/components/otp/otp.tsx',
  styles: {
    _variants: {
      status: { neutral: {}, success: {}, error: {} },
    },
    _defaultVariants: {
      status: 'neutral',
    },
  },
};

const stackStyles = {
  display: 'grid',
  gap: 8,
  justifyItems: 'start',
} as const;

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as OtpProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Otp
      {...knobsAsProps(props)}
      aria-label='Verification code'
    />
  );
}

export function WithField() {
  return (
    <Field.Root
      required
      style={stackStyles}
    >
      <Field.Label>Verification code</Field.Label>
      <Otp name='code' />
      <Field.Description>Enter the code we sent to your device.</Field.Description>
    </Field.Root>
  );
}

export function Success() {
  return (
    <Field.Root style={stackStyles}>
      <Otp
        status='success'
        defaultValue='123456'
        aria-label='Verification code'
      />
      <Field.Description>Success</Field.Description>
    </Field.Root>
  );
}

export function Error() {
  return (
    <Field.Root
      invalid
      style={stackStyles}
    >
      <Otp
        defaultValue='123456'
        aria-label='Verification code'
      />
      <Field.Error>Incorrect code</Field.Error>
    </Field.Root>
  );
}

export function Disabled() {
  return (
    <Otp
      disabled
      defaultValue='123'
      aria-label='Verification code'
    />
  );
}
