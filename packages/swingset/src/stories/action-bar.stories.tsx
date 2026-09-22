import { ActionBar } from '@clerk/mosaic/components/action-bar';
import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { Menu } from '@clerk/mosaic/components/menu';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './action-bar.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'ActionBar',
  status: 'wip',
  layout: 'wide',
  source: 'packages/mosaic/src/components/action-bar/action-bar.tsx',
};

/**
 * The bar sits at the foot of its nearest positioned ancestor. The example gives that ancestor a
 * height and `position: relative` so the bar floats over its bottom; toggle the selection to see
 * it animate in and out.
 */
export function Default() {
  const [count, setCount] = useState(3);
  return (
    <div style={{ position: 'relative', minHeight: 240, width: '100%' }}>
      <Button
        variant='outline'
        size='sm'
        onClick={() => setCount(current => (current > 0 ? 0 : 3))}
      >
        {count > 0 ? 'Clear selection' : 'Select 3'}
      </Button>
      <ActionBar.Root
        open={count > 0}
        aria-label='Bulk actions'
      >
        <ActionBar.Count>{count} selected</ActionBar.Count>
        <ActionBar.Separator />
        <Menu.Root placement='top'>
          <Menu.Trigger
            render={
              <Button
                variant='ghost'
                size='md'
              />
            }
          >
            Change role
            <Icon
              name='chevron-down'
              placement='inline-end'
            />
          </Menu.Trigger>
          <Menu.Popup>
            <Menu.Item label='Admin'>
              <Menu.Label>Admin</Menu.Label>
            </Menu.Item>
            <Menu.Item label='Member'>
              <Menu.Label>Member</Menu.Label>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <ActionBar.Separator />
        <Button
          color='negative'
          variant='ghost'
          shape='square'
          size='md'
          aria-label='Remove selected'
        >
          <Icon name='trash' />
        </Button>
        <ActionBar.Separator />
        <ActionBar.Dismiss onClick={() => setCount(0)} />
      </ActionBar.Root>
    </div>
  );
}
