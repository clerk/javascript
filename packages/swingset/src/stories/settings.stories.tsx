/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Badge } from '@clerk/ui/mosaic/components/badge';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Settings } from '@clerk/ui/mosaic/components/settings';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './settings.stories?raw';

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
  group: 'Components',
  title: 'Settings',
  source: 'packages/ui/src/mosaic/components/settings/settings.tsx',
  styleEngine: 'stylex',
};

export function Default() {
  return (
    <Settings.Root style={{ maxWidth: 560 }}>
      <Settings.Title>Profile</Settings.Title>
      <Settings.Group>
        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Profile picture</Settings.Label>
              <Settings.Description>PNG or JPEG, Recommended size 1:1, up to 10MB.</Settings.Description>
            </Settings.Content>
            <Settings.Actions>
              <Avatar.Root size='lg'>
                <Avatar.Image
                  alt='Preston Booth'
                  src='https://avatars.githubusercontent.com/u/51144033?v=4'
                />
                <Avatar.Fallback>PB</Avatar.Fallback>
              </Avatar.Root>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>

        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Name</Settings.Label>
              <Settings.Description>Preston Booth</Settings.Description>
            </Settings.Content>
            <Settings.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update name
              </Button>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>

        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Username</Settings.Label>
              <Settings.Description>Prestonb.xyz</Settings.Description>
            </Settings.Content>
            <Settings.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update username
              </Button>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>

        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Email</Settings.Label>
              <Settings.Description>item1@clerk.dev</Settings.Description>
            </Settings.Content>
            <Settings.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update email
              </Button>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>
      </Settings.Group>
    </Settings.Root>
  );
}

export function MultipleEmailAndPhoneNumbers() {
  return (
    <Settings.Root style={{ maxWidth: 560 }}>
      <Settings.Title>Profile</Settings.Title>
      <Settings.Group>
        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Profile picture</Settings.Label>
              <Settings.Description>PNG or JPEG, Recommended size 1:1, up to 10MB.</Settings.Description>
            </Settings.Content>
            <Settings.Actions>
              <Avatar.Root size='lg'>
                <Avatar.Image
                  alt='Preston Booth'
                  src='https://avatars.githubusercontent.com/u/51144033?v=4'
                />
                <Avatar.Fallback>PB</Avatar.Fallback>
              </Avatar.Root>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>

        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Name</Settings.Label>
              <Settings.Description>Preston Booth</Settings.Description>
            </Settings.Content>
            <Settings.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update name
              </Button>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>

        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Username</Settings.Label>
              <Settings.Description>Prestonb.xyz</Settings.Description>
            </Settings.Content>
            <Settings.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update username
              </Button>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>

        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Email</Settings.Label>
            </Settings.Content>
            <Settings.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Add
                <Icon
                  name='plus'
                  placement='inline-end'
                  size='sm'
                />
              </Button>
            </Settings.Actions>
          </Settings.Item>
          <Settings.Items>
            <Settings.Item>
              <Settings.Content>
                <Settings.Description style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
                  item1@clerk.dev
                  <Badge color='neutral'>Primary</Badge>
                </Settings.Description>
              </Settings.Content>
              <Settings.Actions>
                <Button
                  aria-label='Manage item1@clerk.dev'
                  color='neutral'
                  shape='square'
                  size='sm'
                  variant='ghost'
                >
                  <Icon name='ellipsis' />
                </Button>
              </Settings.Actions>
            </Settings.Item>
            <Settings.Item>
              <Settings.Content>
                <Settings.Description>item2@clerk.dev</Settings.Description>
              </Settings.Content>
              <Settings.Actions>
                <Button
                  aria-label='Manage item2@clerk.dev'
                  color='neutral'
                  shape='square'
                  size='sm'
                  variant='ghost'
                >
                  <Icon name='ellipsis' />
                </Button>
              </Settings.Actions>
            </Settings.Item>
          </Settings.Items>
        </Settings.Row>

        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Phone</Settings.Label>
            </Settings.Content>
            <Settings.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Add
                <Icon
                  name='plus'
                  placement='inline-end'
                  size='sm'
                />
              </Button>
            </Settings.Actions>
          </Settings.Item>
          <Settings.Items>
            <Settings.Item>
              <Settings.Content>
                <Settings.Description style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
                  +1 801-888-8181
                  <Badge color='neutral'>Primary</Badge>
                </Settings.Description>
              </Settings.Content>
              <Settings.Actions>
                <Button
                  aria-label='Manage +1 801-888-8181'
                  color='neutral'
                  shape='square'
                  size='sm'
                  variant='ghost'
                >
                  <Icon name='ellipsis' />
                </Button>
              </Settings.Actions>
            </Settings.Item>
          </Settings.Items>
        </Settings.Row>
      </Settings.Group>
    </Settings.Root>
  );
}

export function ConnectedAccounts() {
  return (
    <Settings.Root style={{ maxWidth: 560 }}>
      <Settings.Title>Connected accounts</Settings.Title>
      <Settings.Group>
        <Settings.Row>
          <Settings.Item>
            <Settings.Media>
              <ProviderIcon provider='google' />
            </Settings.Media>
            <Settings.Content>
              <Settings.Label>Google</Settings.Label>
              <Settings.Description>test@google.com</Settings.Description>
            </Settings.Content>
            <Settings.Actions>
              <Button
                aria-label='Manage Google'
                color='neutral'
                shape='square'
                size='sm'
                variant='ghost'
              >
                <Icon name='ellipsis' />
              </Button>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>
        <Settings.Row>
          <Settings.Item>
            <Settings.Media>
              <ProviderIcon provider='apple' />
            </Settings.Media>
            <Settings.Content>
              <Settings.Label>Apple</Settings.Label>
            </Settings.Content>
            <Settings.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Connect
              </Button>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>
      </Settings.Group>
    </Settings.Root>
  );
}

export function Destructive() {
  return (
    <Settings.Root>
      <Settings.Title>Danger zone</Settings.Title>
      <Settings.Group>
        <Settings.Row>
          <Settings.Item>
            <Settings.Content>
              <Settings.Label>Delete account</Settings.Label>
              <Settings.Description>
                Permanently delete this profile and all its data. This cannot be undone.
              </Settings.Description>
            </Settings.Content>
            <Settings.Actions>
              <Button
                color='negative'
                size='sm'
                variant='ghost'
              >
                Delete account
              </Button>
            </Settings.Actions>
          </Settings.Item>
        </Settings.Row>
      </Settings.Group>
    </Settings.Root>
  );
}
