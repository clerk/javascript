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
};

export function Default() {
  return (
    <Popover.Root>
      <Popover.Trigger render={props => <Button {...props}>Open popover</Button>} />
      <Popover.Popup aria-label='Account'>
        <Card.Root>
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
        </Card.Root>
      </Popover.Popup>
    </Popover.Root>
  );
}

// Each placement demo shares the same trigger and panel so the example reads as the
// placement it sets. The wrapper reserves vertical room — without it the `flip`
// middleware bounces a `top` popover back to the bottom inside a short preview.
const labelledTrigger = (label: string) => <Button variant='outline'>{label}</Button>;

const panel = (label: string) => (
  <Card.Root>
    <Card.Content style={{ paddingBlock: '1rem' }}>
      <Text>{label}</Text>
    </Card.Content>
  </Card.Root>
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
      <Popover.Root placement='top'>
        <Popover.Trigger render={labelledTrigger('Top')} />
        <Popover.Popup
          size='sm'
          aria-label='Top placement'
        >
          {panel('Placed above the trigger.')}
        </Popover.Popup>
      </Popover.Root>
      <Popover.Root placement='bottom'>
        <Popover.Trigger render={labelledTrigger('Bottom')} />
        <Popover.Popup
          size='sm'
          aria-label='Bottom placement'
        >
          {panel('Placed below the trigger.')}
        </Popover.Popup>
      </Popover.Root>
      <Popover.Root placement='left'>
        <Popover.Trigger render={labelledTrigger('Left')} />
        <Popover.Popup
          size='sm'
          aria-label='Left placement'
        >
          {panel('Placed to the inline start.')}
        </Popover.Popup>
      </Popover.Root>
      <Popover.Root placement='right'>
        <Popover.Trigger render={labelledTrigger('Right')} />
        <Popover.Popup
          size='sm'
          aria-label='Right placement'
        >
          {panel('Placed to the inline end.')}
        </Popover.Popup>
      </Popover.Root>
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
      <Popover.Root placement='bottom-start'>
        <Popover.Trigger render={labelledTrigger('bottom-start')} />
        <Popover.Popup
          size='sm'
          aria-label='Bottom start'
        >
          {panel('Aligned to the trigger’s start edge.')}
        </Popover.Popup>
      </Popover.Root>
      <Popover.Root placement='bottom'>
        <Popover.Trigger render={labelledTrigger('bottom')} />
        <Popover.Popup
          size='sm'
          aria-label='Bottom'
        >
          {panel('Centered on the trigger.')}
        </Popover.Popup>
      </Popover.Root>
      <Popover.Root placement='bottom-end'>
        <Popover.Trigger render={labelledTrigger('bottom-end')} />
        <Popover.Popup
          size='sm'
          aria-label='Bottom end'
        >
          {panel('Aligned to the trigger’s end edge.')}
        </Popover.Popup>
      </Popover.Root>
    </div>
  );
}
