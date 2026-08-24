import { Avatar } from '@clerk/ui/mosaic/components/avatar';
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
          <Menu.Media>
            <Icon name='plus' />
          </Menu.Media>
          <Menu.Label>Add workspace</Menu.Label>
        </Menu.Item>
        <Menu.Item label='Sign out'>
          <Menu.Media>
            <Icon name='log-out' />
          </Menu.Media>
          <Menu.Label>Sign out</Menu.Label>
        </Menu.Item>
        <Menu.Item
          label='Delete user'
          color='negative'
        >
          <Menu.Media>
            <Icon name='close' />
          </Menu.Media>
          <Menu.Label>Delete user</Menu.Label>
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

const accounts = [
  { active: true, identifier: 'colin@clerk.dev', initial: 'C' },
  { active: false, identifier: 'braden.wiggins@a-very-long-domain.example', initial: 'B' },
];

export function Accounts() {
  return (
    <Menu.Root>
      <Menu.Trigger>Switch account</Menu.Trigger>
      <Menu.Content>
        {accounts.map(account => (
          <Menu.Item
            key={account.identifier}
            label={account.identifier}
          >
            <Menu.Media>
              <Avatar.Root
                shape='circle'
                size='fit'
              >
                <Avatar.Fallback>{account.initial}</Avatar.Fallback>
              </Avatar.Root>
            </Menu.Media>
            <Menu.Label>{account.identifier}</Menu.Label>
            {account.active ? (
              <Icon
                name='check'
                size='sm'
              />
            ) : null}
          </Menu.Item>
        ))}
      </Menu.Content>
    </Menu.Root>
  );
}
