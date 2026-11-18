'use client';

import { Field } from '@clerk/mosaic/components/field';
import type { PasswordInputProps } from '@clerk/mosaic/components/password-input';
import { PasswordInput } from '@clerk/mosaic/components/password-input';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './password-input.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'PasswordInput',
  source: 'packages/mosaic/src/components/password-input/password-input.tsx',
  styles: {
    _variants: {
      size: { sm: {}, md: {}, lg: {} },
    },
    _defaultVariants: {
      size: 'md',
    },
  },
};

const styles = stylex.create({
  stack: {
    display: 'grid',
    gap: 8,
    width: 320,
  },
});

const labels = {
  showPasswordLabel: 'Show password',
  hidePasswordLabel: 'Hide password',
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as PasswordInputProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Field.Root xstyle={styles.stack}>
      <Field.Label>Password</Field.Label>
      <PasswordInput
        {...labels}
        {...knobsAsProps(props)}
        name='password'
        autoComplete='current-password'
        placeholder='Enter your password'
      />
    </Field.Root>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <PasswordInput
        {...labels}
        size='sm'
        aria-label='Small password'
        placeholder='Small'
      />
      <PasswordInput
        {...labels}
        size='md'
        aria-label='Medium password'
        placeholder='Medium'
      />
      <PasswordInput
        {...labels}
        size='lg'
        aria-label='Large password'
        placeholder='Large'
      />
    </div>
  );
}

export function Disabled() {
  return (
    <Field.Root
      disabled
      xstyle={styles.stack}
    >
      <Field.Label>Password</Field.Label>
      <PasswordInput
        {...labels}
        defaultValue='hunter2'
      />
    </Field.Root>
  );
}

export function Invalid() {
  return (
    <Field.Root
      invalid
      xstyle={styles.stack}
    >
      <Field.Label>Password</Field.Label>
      <PasswordInput
        {...labels}
        defaultValue='short'
      />
      <Field.Error>Your password must contain 8 or more characters.</Field.Error>
    </Field.Root>
  );
}
