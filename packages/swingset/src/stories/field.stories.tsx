import { Field } from '@clerk/ui/mosaic/components/field';
import { Input } from '@clerk/ui/mosaic/components/input';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './field.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Field',
  source: 'packages/ui/src/mosaic/components/field/field.tsx',
  styleEngine: 'stylex',
};

const stackStyles = {
  display: 'grid',
  gap: 8,
  maxWidth: 384,
} as const;

export function Default() {
  return (
    <Field.Root style={stackStyles}>
      <Field.Label htmlFor='email'>Email address</Field.Label>
      <Input
        id='email'
        name='email'
        type='email'
        placeholder='you@example.com'
        aria-describedby='email-description'
      />
      <Field.Description id='email-description'>Used for account notifications.</Field.Description>
    </Field.Root>
  );
}
