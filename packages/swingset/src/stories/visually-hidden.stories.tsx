import { Button } from '@clerk/ui/mosaic/components/button';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Text } from '@clerk/ui/mosaic/components/text';
import type { VisuallyHiddenProps } from '@clerk/ui/mosaic/components/visually-hidden';
import { VisuallyHidden } from '@clerk/ui/mosaic/components/visually-hidden';
import * as React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './visually-hidden.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'VisuallyHidden',
  source: 'packages/ui/src/mosaic/components/visually-hidden/visually-hidden.tsx',
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as VisuallyHiddenProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Button shape='square'>
      <Icon name='log-out' />
      <VisuallyHidden {...knobsAsProps(props)}>Sign out</VisuallyHidden>
    </Button>
  );
}

export function LiveRegion() {
  const [copies, setCopies] = React.useState(0);

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <Button
        variant='outline'
        onClick={() => setCopies(count => count + 1)}
      >
        Copy backup code
      </Button>
      <Text color='neutral'>Copied {copies} times</Text>
      <VisuallyHidden
        render={
          <div
            role='status'
            aria-live='polite'
          />
        }
      >
        {copies > 0 ? 'Backup code copied to clipboard' : ''}
      </VisuallyHidden>
    </div>
  );
}
