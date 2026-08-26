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
      size: { sm: {}, md: {}, lg: {} },
      status: { neutral: {}, success: {}, error: {} },
    },
    _defaultVariants: {
      size: 'md',
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
      length={6}
      aria-label='Verification code'
    />
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Otp
        length={6}
        size='sm'
        defaultValue='123'
        aria-label='Small code'
      />
      <Otp
        length={6}
        size='md'
        defaultValue='123'
        aria-label='Medium code'
      />
      <Otp
        length={6}
        size='lg'
        defaultValue='123'
        aria-label='Large code'
      />
    </div>
  );
}

export function Success() {
  return (
    <Field.Root style={stackStyles}>
      <Otp
        length={6}
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
        length={6}
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
      length={6}
      disabled
      defaultValue='123'
      aria-label='Verification code'
    />
  );
}
