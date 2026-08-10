/** @jsxImportSource @emotion/react */
import { SettingsGroup } from '@clerk/ui/mosaic/block/settings-group';
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Input } from '@clerk/ui/mosaic/components/input';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './settings-group.stories?raw';

const providerIconUrl = (provider: string) => `https://img.clerk.com/static/${provider}.svg`;

function ProviderIcon({ provider }: { provider: string }) {
  return (
    <img
      alt=''
      src={providerIconUrl(provider)}
      style={{ display: 'block', height: 24, width: 24 }}
    />
  );
}

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'SettingsGroup',
  source: 'packages/ui/src/mosaic/block/settings-group.tsx',
  styleEngine: 'stylex',
};

export function Default() {
  return (
    <SettingsGroup.Root style={{ maxWidth: 560 }}>
      <SettingsGroup.Title>Account</SettingsGroup.Title>
      <SettingsGroup.List>
        <SettingsGroup.Row>
          <SettingsGroup.Label>Profile picture</SettingsGroup.Label>
          <SettingsGroup.Control>
            <Avatar.Root size='md'>
              <Avatar.Image
                alt='Preston Booth'
                src='https://avatars.githubusercontent.com/u/51144033?v=4'
              />
              <Avatar.Fallback>PB</Avatar.Fallback>
            </Avatar.Root>
          </SettingsGroup.Control>
        </SettingsGroup.Row>
        <SettingsGroup.Row field>
          <SettingsGroup.Label>Name</SettingsGroup.Label>
          <SettingsGroup.Control>
            <Input
              defaultValue='Preston Booth'
              style={{ width: 176 }}
            />
          </SettingsGroup.Control>
        </SettingsGroup.Row>
        <SettingsGroup.Row field>
          <SettingsGroup.Label>Username</SettingsGroup.Label>
          <SettingsGroup.Control>
            <Input
              defaultValue='prestonxyz'
              style={{ width: 176 }}
            />
          </SettingsGroup.Control>
        </SettingsGroup.Row>
      </SettingsGroup.List>
    </SettingsGroup.Root>
  );
}

export function ConnectedAccounts() {
  return (
    <SettingsGroup.Root style={{ maxWidth: 560 }}>
      <SettingsGroup.Title>Connected accounts</SettingsGroup.Title>
      <SettingsGroup.List>
        <SettingsGroup.Row>
          <SettingsGroup.Media>
            <ProviderIcon provider='google' />
          </SettingsGroup.Media>
          <SettingsGroup.Label description='test@google.com'>Google</SettingsGroup.Label>
          <SettingsGroup.Control>
            <Button
              aria-label='Manage Google'
              color='neutral'
              shape='square'
              size='sm'
              variant='ghost'
            >
              <Icon name='ellipsis' />
            </Button>
          </SettingsGroup.Control>
        </SettingsGroup.Row>
        <SettingsGroup.Row>
          <SettingsGroup.Media>
            <ProviderIcon provider='apple' />
          </SettingsGroup.Media>
          <SettingsGroup.Label>Apple</SettingsGroup.Label>
          <SettingsGroup.Control>
            <Button
              color='neutral'
              size='sm'
              variant='outline'
            >
              Connect
            </Button>
          </SettingsGroup.Control>
        </SettingsGroup.Row>
      </SettingsGroup.List>
    </SettingsGroup.Root>
  );
}

export function Destructive() {
  return (
    <SettingsGroup.Root style={{ maxWidth: 560 }}>
      <SettingsGroup.Title>Danger zone</SettingsGroup.Title>
      <SettingsGroup.List>
        <SettingsGroup.Row>
          <SettingsGroup.Label description='This action is permanent and irreversible.'>
            Delete account
          </SettingsGroup.Label>
          <SettingsGroup.Control>
            <Button
              color='negative'
              size='sm'
              variant='outline'
            >
              Delete account
            </Button>
          </SettingsGroup.Control>
        </SettingsGroup.Row>
      </SettingsGroup.List>
    </SettingsGroup.Root>
  );
}
