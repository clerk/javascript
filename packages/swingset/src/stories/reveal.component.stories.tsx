import { Button } from '@clerk/mosaic/components/button';
import { Reveal } from '@clerk/mosaic/components/reveal';
import { Text } from '@clerk/mosaic/components/text';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './reveal.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Reveal',
  source: 'packages/mosaic/src/components/reveal/reveal.tsx',
};

export function Default() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '20rem' }}>
      <Button
        variant='outline'
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        {open ? 'Hide details' : 'Show details'}
      </Button>
      <Reveal open={open}>
        <div style={{ paddingBlockStart: '0.75rem' }}>
          <Text>Revealed content animates its height open and closed, and is removed once it has closed.</Text>
        </div>
      </Reveal>
    </div>
  );
}
