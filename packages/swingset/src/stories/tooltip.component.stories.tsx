import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { Tooltip } from '@clerk/mosaic/components/tooltip';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './tooltip.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Tooltip',
  source: 'packages/mosaic/src/components/tooltip/tooltip.tsx',
};

export function Default() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', paddingBlock: '3rem' }}>
      <Tooltip.Root>
        <Tooltip.Trigger render={props => <Button {...props}>Hover me</Button>} />
        <Tooltip.Popup>
          Tooltip
          <Icon
            name='check'
            size='sm'
          />
        </Tooltip.Popup>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={props => (
            <Button
              variant='outline'
              {...props}
            >
              Long label
            </Button>
          )}
        />
        <Tooltip.Popup>The quick brown fox jumps over the lazy dog</Tooltip.Popup>
      </Tooltip.Root>
    </div>
  );
}

const labelledTrigger = (label: string) => <Button variant='outline'>{label}</Button>;

export function Placement() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        gridTemplateColumns: 'repeat(2, max-content)',
        justifyContent: 'center',
        paddingBlock: '4rem',
      }}
    >
      <Tooltip.Root placement='top'>
        <Tooltip.Trigger render={labelledTrigger('Top')} />
        <Tooltip.Popup>Placed above the trigger.</Tooltip.Popup>
      </Tooltip.Root>
      <Tooltip.Root placement='bottom'>
        <Tooltip.Trigger render={labelledTrigger('Bottom')} />
        <Tooltip.Popup>Placed below the trigger.</Tooltip.Popup>
      </Tooltip.Root>
      <Tooltip.Root placement='left'>
        <Tooltip.Trigger render={labelledTrigger('Left')} />
        <Tooltip.Popup>Placed to the inline start.</Tooltip.Popup>
      </Tooltip.Root>
      <Tooltip.Root placement='right'>
        <Tooltip.Trigger render={labelledTrigger('Right')} />
        <Tooltip.Popup>Placed to the inline end.</Tooltip.Popup>
      </Tooltip.Root>
    </div>
  );
}

export function Group() {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', paddingBlock: '3rem' }}>
      <Tooltip.Group>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={props => (
              <Button
                variant='outline'
                shape='square'
                aria-label='Edit'
                {...props}
              >
                <Icon name='pen' />
              </Button>
            )}
          />
          <Tooltip.Popup>Edit</Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={props => (
              <Button
                variant='outline'
                shape='square'
                aria-label='Search'
                {...props}
              >
                <Icon name='search' />
              </Button>
            )}
          />
          <Tooltip.Popup>Search</Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={props => (
              <Button
                variant='outline'
                shape='square'
                aria-label='Settings'
                {...props}
              >
                <Icon name='cog' />
              </Button>
            )}
          />
          <Tooltip.Popup>Settings</Tooltip.Popup>
        </Tooltip.Root>
      </Tooltip.Group>
    </div>
  );
}
