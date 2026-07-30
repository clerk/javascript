/** @jsxImportSource @emotion/react */
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Menu } from '@clerk/ui/mosaic/components/menu';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './menu.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Menu',
  source: 'packages/ui/src/mosaic/components/menu/menu.tsx',
};

export function Default() {
  return (
    <Menu.Root>
      <Menu.Trigger />
      <Menu.Content>
        <Menu.Item label='Add workspace'>
          <Icon name='plus' />
          Add workspace
        </Menu.Item>
        <Menu.Item label='Sign out'>
          <Icon name='log-out' />
          Sign out
        </Menu.Item>
        <Menu.Item
          label='Delete user'
          color='negative'
        >
          <Icon name='close' />
          Delete user
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}
