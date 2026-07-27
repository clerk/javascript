/** @jsxImportSource @emotion/react */
import { Menu } from '@clerk/ui/mosaic/components/menu';
import { iconRegistry } from '@clerk/ui/mosaic/icons/registry';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './menu.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Menu',
  source: 'packages/ui/src/mosaic/components/menu/menu.tsx',
};

const PlusIcon = iconRegistry.plus;
const LogOutIcon = iconRegistry['log-out'];

export function Default() {
  return (
    <Menu.Root>
      <Menu.Trigger />
      <Menu.Content>
        <Menu.Item
          label='Add workspace'
          icon={<PlusIcon />}
        />
        <Menu.Separator />
        <Menu.Item
          label='Sign out'
          icon={<LogOutIcon />}
        />
      </Menu.Content>
    </Menu.Root>
  );
}
