/** @jsxImportSource @emotion/react */
import { Button } from '@clerk/ui/mosaic/components/button';
import { Card } from '@clerk/ui/mosaic/components/card';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Popover } from '@clerk/ui/mosaic/components/popover';
import { Text } from '@clerk/ui/mosaic/components/text';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './popover.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Popover',
  source: 'packages/ui/src/mosaic/components/popover/popover.tsx',
  styleEngine: 'stylex',
};

const popoverTrigger = (props: Omit<React.HTMLAttributes<HTMLElement>, 'color'>) => (
  <Button {...props}>Open popover</Button>
);

export function Default() {
  return (
    <Popover
      aria-label='Account'
      trigger={popoverTrigger}
    >
      <Card>
        <Card.Header>
          <Heading size='sm'>Ada Lovelace</Heading>
          <Text>ada@example.com</Text>
        </Card.Header>
        <Card.Footer>
          <Button
            color='negative'
            fullWidth
          >
            Sign out of all accounts
          </Button>
        </Card.Footer>
      </Card>
    </Popover>
  );
}

// Each placement demo shares the same trigger and panel so the example reads as the
// placement it sets. The wrapper reserves vertical room — without it the `flip`
// middleware bounces a `top` popover back to the bottom inside a short preview.
const labelledTrigger = (label: string) => (props: Omit<React.HTMLAttributes<HTMLElement>, 'color'>) => (
  <Button
    variant='outline'
    {...props}
  >
    {label}
  </Button>
);

const panel = (label: string) => (
  <Card>
    <Card.Content style={{ paddingBlock: '1rem' }}>
      <Text>{label}</Text>
    </Card.Content>
  </Card>
);

export function Placement() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        gridTemplateColumns: 'repeat(2, max-content)',
        justifyContent: 'center',
        paddingBlock: '7rem',
      }}
    >
      <Popover
        placement='top'
        size='sm'
        aria-label='Top placement'
        trigger={labelledTrigger('Top')}
      >
        {panel('Placed above the trigger.')}
      </Popover>
      <Popover
        placement='bottom'
        size='sm'
        aria-label='Bottom placement'
        trigger={labelledTrigger('Bottom')}
      >
        {panel('Placed below the trigger.')}
      </Popover>
      <Popover
        placement='left'
        size='sm'
        aria-label='Left placement'
        trigger={labelledTrigger('Left')}
      >
        {panel('Placed to the inline start.')}
      </Popover>
      <Popover
        placement='right'
        size='sm'
        aria-label='Right placement'
        trigger={labelledTrigger('Right')}
      >
        {panel('Placed to the inline end.')}
      </Popover>
    </div>
  );
}

export function Alignment() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        paddingBlockEnd: '7rem',
      }}
    >
      <Popover
        placement='bottom-start'
        size='sm'
        aria-label='Bottom start'
        trigger={labelledTrigger('bottom-start')}
      >
        {panel('Aligned to the trigger’s start edge.')}
      </Popover>
      <Popover
        placement='bottom'
        size='sm'
        aria-label='Bottom'
        trigger={labelledTrigger('bottom')}
      >
        {panel('Centered on the trigger.')}
      </Popover>
      <Popover
        placement='bottom-end'
        size='sm'
        aria-label='Bottom end'
        trigger={labelledTrigger('bottom-end')}
      >
        {panel('Aligned to the trigger’s end edge.')}
      </Popover>
    </div>
  );
}
