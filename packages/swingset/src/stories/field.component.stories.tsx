import { Button } from '@clerk/ui/mosaic/components/button';
import { Field } from '@clerk/ui/mosaic/components/field';
import { Input } from '@clerk/ui/mosaic/components/input';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './field.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Field',
  source: 'packages/ui/src/mosaic/components/field/field.tsx',
};

const styles = stylex.create({
  stack: {
    display: 'grid',
    gap: 8,
    maxWidth: 384,
  },
  errorStack: {
    display: 'grid',
    gap: 8,
    maxWidth: 384,
    width: '100%',
  },
});

export function Default() {
  return (
    <Field.Root xstyle={styles.stack}>
      <Field.Label>Email address</Field.Label>
      <Input
        name='email'
        type='email'
        placeholder='you@example.com'
      />
      <Field.Description>Used for account notifications.</Field.Description>
    </Field.Root>
  );
}

export function VisuallyHiddenLabel() {
  return (
    <Field.Root xstyle={styles.stack}>
      <Field.Label visuallyHidden>Search members</Field.Label>
      <Input
        name='search'
        type='search'
        placeholder='Search members'
      />
    </Field.Root>
  );
}

const errorMessages = [
  'Enter a valid email address.',
  'This email address is already in use. Sign in instead, or use a different address to create a new account.',
];

export function WithError() {
  const [error, setError] = React.useState<string | null>(null);
  return (
    <div {...stylex.props(styles.errorStack)}>
      <Field.Root invalid={error !== null}>
        <Field.Label>Email address</Field.Label>
        <Input
          name='email'
          type='email'
          placeholder='you@example.com'
        />
        <Field.Description>Used for account notifications.</Field.Description>
        <Field.Message>
          <Field.Error>{error}</Field.Error>
        </Field.Message>
      </Field.Root>
      <Button
        variant='outline'
        onClick={() => setError(current => (current === null ? errorMessages[0] : null))}
      >
        Toggle short error
      </Button>
      <Button
        variant='outline'
        onClick={() => setError(current => (current === null ? errorMessages[1] : null))}
      >
        Toggle long error
      </Button>
    </div>
  );
}

export function WithFeedback() {
  const [feedback, setFeedback] = React.useState<'error' | 'success' | null>(null);
  return (
    <div {...stylex.props(styles.errorStack)}>
      <Field.Root invalid={feedback === 'error'}>
        <Field.Label>Current password</Field.Label>
        <Input
          name='currentPassword'
          type='password'
        />
        <Field.Message>
          <Field.Error>
            {feedback === 'error'
              ? 'The password you entered is incorrect. Check for typos and try again, or reset your password if you have forgotten it.'
              : null}
          </Field.Error>
          <Field.Success>{feedback === 'success' ? 'Password verified.' : null}</Field.Success>
        </Field.Message>
      </Field.Root>
      <Button
        variant='outline'
        onClick={() => setFeedback('error')}
      >
        Show error
      </Button>
      <Button
        variant='outline'
        onClick={() => setFeedback('success')}
      >
        Show success
      </Button>
      <Button
        variant='outline'
        onClick={() => setFeedback(null)}
      >
        Clear
      </Button>
    </div>
  );
}
