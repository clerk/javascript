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
        <Menu.Item
          label='Add workspace'
          icon={<Icon name='plus' />}
        />
        <Menu.Item
          label='Sign out'
          icon={<Icon name='log-out' />}
        />
        <Menu.Item
          label='Delete user'
          icon={<Icon name='close' />}
          intent='destructive'
        />
      </Menu.Content>
    </Menu.Root>
  );
}
