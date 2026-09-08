import { Field } from '@clerk/ui/mosaic/components/field';
import { Input } from '@clerk/ui/mosaic/components/input';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './field.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Field',
  source: 'packages/ui/src/mosaic/components/field/field.tsx',
};

const stackStyles = {
  display: 'grid',
  gap: 8,
  maxWidth: 384,
} as const;

export function Default() {
  return (
    <Field.Root style={stackStyles}>
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
    <Field.Root style={stackStyles}>
      <Field.Label visuallyHidden>Search members</Field.Label>
      <Input
        name='search'
        type='search'
        placeholder='Search members'
      />
    </Field.Root>
  );
}
