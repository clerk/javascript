import { Field } from '@clerk/ui/mosaic/components/field';
import type { OtpProps } from '@clerk/ui/mosaic/components/otp';
import { Otp } from '@clerk/ui/mosaic/components/otp';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './otp.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
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

const styles = stylex.create({
  stack: {
    display: 'grid',
    gap: 8,
    justifyItems: 'start',
  },
});

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
      xstyle={styles.stack}
    >
      <Field.Label>Verification code</Field.Label>
      <Otp name='code' />
      <Field.Description>Enter the code we sent to your device.</Field.Description>
    </Field.Root>
  );
}

export function Success() {
  return (
    <Field.Root xstyle={styles.stack}>
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
      xstyle={styles.stack}
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
