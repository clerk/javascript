import { Field } from '@clerk/ui/mosaic/components/field';
import { Input } from '@clerk/ui/mosaic/components/input';
import * as stylex from '@stylexjs/stylex';

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
