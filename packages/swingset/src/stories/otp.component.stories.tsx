import { Field } from '@clerk/mosaic/components/field';
import type { OtpProps } from '@clerk/mosaic/components/otp';
import { Otp } from '@clerk/mosaic/components/otp';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './otp.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'OTP',
  source: 'packages/mosaic/src/components/otp/otp.tsx',
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

const CORRECT_CODE = '123456';

export function Interactive() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'neutral' | 'success' | 'error'>('neutral');

  return (
    <Field.Root
      invalid={status === 'error'}
      xstyle={styles.stack}
    >
      <Field.Label>Verification code</Field.Label>
      <Otp
        name='code'
        value={value}
        status={status}
        onValueChange={next => {
          setValue(next);
          if (next.length > 0 && status === 'error') {
            setStatus('neutral');
          }
        }}
        onComplete={code => {
          if (code === CORRECT_CODE) {
            setStatus('success');
            return;
          }
          setStatus('error');
        }}
      />
      {status === 'error' ? (
        <Field.Error>Incorrect code. Try again.</Field.Error>
      ) : (
        <Field.Description>
          {status === 'success' ? 'Code verified' : `Try ${CORRECT_CODE}, or anything else for the error.`}
        </Field.Description>
      )}
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
