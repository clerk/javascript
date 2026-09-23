import { Button } from '@clerk/mosaic/components/button';
import { EmptyState } from '@clerk/mosaic/components/empty-state';
import { Icon } from '@clerk/mosaic/components/icon';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './empty-state.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'EmptyState',
  source: 'packages/mosaic/src/components/empty-state/empty-state.tsx',
};

export function Default() {
  return (
    <EmptyState.Root>
      <EmptyState.Icon name='magnifying-glass' />
      <EmptyState.Label>No API keys</EmptyState.Label>
      <EmptyState.Description>Create a key to start making requests from your application.</EmptyState.Description>
      <EmptyState.Actions>
        <Button size='sm'>
          <Icon
            name='plus'
            placement='inline-start'
          />
          Create key
        </Button>
      </EmptyState.Actions>
    </EmptyState.Root>
  );
}

export function NoResults() {
  return (
    <EmptyState.Root>
      <EmptyState.Icon name='magnifying-glass' />
      <EmptyState.Label>No results</EmptyState.Label>
      <EmptyState.Description>No keys match your search. Try a different name.</EmptyState.Description>
    </EmptyState.Root>
  );
}

export function LabelOnly() {
  return (
    <EmptyState.Root>
      <EmptyState.Label>Nothing to show yet</EmptyState.Label>
    </EmptyState.Root>
  );
}
