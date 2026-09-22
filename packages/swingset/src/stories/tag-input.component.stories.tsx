import { Button } from '@clerk/mosaic/components/button';
import { Field } from '@clerk/mosaic/components/field';
import type { TagInputProps } from '@clerk/mosaic/components/tag-input';
import { TagInput } from '@clerk/mosaic/components/tag-input';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './tag-input.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'TagInput',
  label: 'Tag Input',
  source: 'packages/mosaic/src/components/tag-input/tag-input.tsx',
  styles: {
    _variants: {
      disabled: { true: {}, false: {} },
    },
    _defaultVariants: {
      disabled: false,
    },
  },
};

const styles = stylex.create({
  field: {
    maxWidth: 480,
    width: '100%',
  },
  stack: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    maxWidth: 480,
    width: '100%',
  },
});

const pasteList = 'sam@clerk.dev, bryce.kalow@clerk.dev, dan@clerk.dev, jacek.radko@clerk.dev';

function CopyPasteList() {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant='outline'
      size='sm'
      onClick={() => {
        void navigator.clipboard.writeText(pasteList).then(() => setCopied(true));
      }}
    >
      {copied ? 'Copied, now paste into the field' : 'Copy a comma-separated list'}
    </Button>
  );
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+$/.test(value);

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as TagInputProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <div {...stylex.props(styles.stack)}>
      <Field.Root xstyle={styles.field}>
        <Field.Label>Email</Field.Label>
        <TagInput
          {...knobsAsProps(props)}
          defaultValue={[
            'preston@clerk.dev',
            'nate@clerk.dev',
            'al@clerk.dev',
            'alexandra.montgomery@clerk.dev',
            'jo@clerk.dev',
            'christopher@clerk.dev',
          ]}
        />
      </Field.Root>
      <CopyPasteList />
    </div>
  );
}

export function Validation() {
  return (
    <Field.Root xstyle={styles.field}>
      <Field.Label>Email</Field.Label>
      <TagInput
        defaultValue={['preston@clerk.dev', 'nate']}
        validate={isEmail}
      />
    </Field.Root>
  );
}

export function Invalid() {
  return (
    <Field.Root
      invalid
      xstyle={styles.field}
    >
      <Field.Label>Email</Field.Label>
      <TagInput />
      <Field.Error>Add at least one email address</Field.Error>
    </Field.Root>
  );
}

export function Disabled() {
  return (
    <Field.Root
      disabled
      xstyle={styles.field}
    >
      <Field.Label>Email</Field.Label>
      <TagInput defaultValue={['preston@clerk.dev', 'nate@clerk.dev']} />
    </Field.Root>
  );
}
