import { Avatar } from '@clerk/mosaic/components/avatar';
import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { Menu } from '@clerk/mosaic/components/menu';
import { Popover } from '@clerk/mosaic/components/popover';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './menu.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Menu',
  source: 'packages/mosaic/src/components/menu/menu.tsx',
};

export function Default() {
  return (
    <Menu.Root>
      <Menu.Trigger />
      <Menu.Popup>
        <Menu.Item label='Add organization'>
          <Menu.Media>
            <Icon name='plus' />
          </Menu.Media>
          <Menu.Label>Add organization</Menu.Label>
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
            <Icon name='x' />
          </Menu.Media>
          <Menu.Label>Delete user</Menu.Label>
        </Menu.Item>
      </Menu.Popup>
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
      <Menu.Popup>
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
                name='checkmark'
                size='sm'
              />
            ) : null}
          </Menu.Item>
        ))}
      </Menu.Popup>
    </Menu.Root>
  );
}

const organizations = [
  'Ashgrove',
  'Bramblewood',
  'Cedar Hollow',
  'Dunmore Flats',
  'Elderbrook',
  'Fernwick',
  'Glasswater',
  'Hallowfield',
  'Ironvale',
  'Juniper Reach',
  'Kestrel Point',
  'Larkspur Mill',
  'Marrowden',
  'Northgate',
  'Oakenshire',
  'Pinecrest',
  'Quarryfield',
  'Redhollow',
  'Stonebridge',
  'Thornbury',
  'Underhill',
  'Vellamere',
  'Westmarch',
  'Yarrowdale',
  'Alderwick',
  'Blackthorn',
  'Coldspring',
  'Dovecote',
  'Eastfen',
  'Foxglove',
  'Greyholt',
  'Harrowgate',
  'Inglewood',
  'Jessamine',
  'Kirkstall',
  'Lindenfell',
  'Mossbank',
  'Nettlefold',
  'Oxbow Landing',
  'Peartree Row',
  'Quillhaven',
  'Ravensmoor',
  'Saltmarsh',
  'Tanglewood',
  'Ullswater',
  'Vinequarter',
  'Wrenfield',
  'Yewbarrow',
  'Amberlyn',
  'Brookhaven',
  'Chalkhill',
  'Dryden Cross',
  'Ellerby',
  'Fallowmere',
  'Gorsecliff',
  'Hazelmoor',
  'Ivybridge',
  'Jackdaw Lane',
  'Kilnwood',
  'Longmeadow',
];

/**
 * More rows than the popup can show. The popup caps at the available height and the rows scroll
 * inside it, so this is the story where the ScrollArea treatment is visible: the fade at whichever
 * edge still has content past it, and the thumb that lifts as the pointer enters.
 */
export function Overflowing() {
  return (
    <Menu.Root>
      <Menu.Trigger>Switch organization</Menu.Trigger>
      <Menu.Popup>
        {organizations.map(organization => (
          <Menu.Item
            key={organization}
            label={organization}
          >
            <Menu.Media>
              <Avatar.Root
                shape='square'
                size='fit'
              >
                <Avatar.Fallback>{organization[0]}</Avatar.Fallback>
              </Avatar.Root>
            </Menu.Media>
            <Menu.Label>{organization}</Menu.Label>
          </Menu.Item>
        ))}
      </Menu.Popup>
    </Menu.Root>
  );
}

export function OpenOnHover() {
  return (
    <Menu.Root openOnHover>
      <Menu.Trigger>Settings</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item label='Manage profile'>
          <Menu.Media>
            <Icon name='user-circle' />
          </Menu.Media>
          <Menu.Label>Manage profile</Menu.Label>
        </Menu.Item>
        <Menu.Item label='Manage organization'>
          <Menu.Media>
            <Icon name='building' />
          </Menu.Media>
          <Menu.Label>Manage organization</Menu.Label>
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}

export function OpenOnHoverInPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger render={props => <Button {...props}>Open popover</Button>} />
      <Popover.Popup aria-label='Account'>
        <Menu.Root
          openOnHover
          placement='right-start'
          sideOffset={{ x: 12, y: 8 }}
          fallbackPlacements={['left-start', 'top-start', 'bottom-start']}
        >
          <Menu.Trigger>Settings</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item label='Manage profile'>
              <Menu.Media>
                <Icon name='user-circle' />
              </Menu.Media>
              <Menu.Label>Manage profile</Menu.Label>
            </Menu.Item>
            <Menu.Item label='Manage organization'>
              <Menu.Media>
                <Icon name='building' />
              </Menu.Media>
              <Menu.Label>Manage organization</Menu.Label>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      </Popover.Popup>
    </Popover.Root>
  );
}
