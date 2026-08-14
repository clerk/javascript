/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Badge } from '@clerk/ui/mosaic/components/badge';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Section } from '@clerk/ui/mosaic/components/section';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './section.stories?raw';

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
  title: 'Section',
  source: 'packages/ui/src/mosaic/components/section/section.tsx',
  styleEngine: 'stylex',
};

export function Default() {
  return (
    <Section.Root style={{ maxWidth: 560 }}>
      <Section.Title>Profile</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Profile picture</Section.Label>
              <Section.Description>PNG or JPEG, Recommended size 1:1, up to 10MB.</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Avatar.Root size='lg'>
                <Avatar.Image
                  alt='Preston Booth'
                  src='https://avatars.githubusercontent.com/u/51144033?v=4'
                />
                <Avatar.Fallback>PB</Avatar.Fallback>
              </Avatar.Root>
            </Section.Actions>
          </Section.Item>
        </Section.Row>

        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Name</Section.Label>
              <Section.Description>Preston Booth</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update name
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>

        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Username</Section.Label>
              <Section.Description>Prestonb.xyz</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update username
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>

        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Email</Section.Label>
              <Section.Description>item1@clerk.dev</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update email
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}

export function MultipleEmailAndPhoneNumbers() {
  return (
    <Section.Root style={{ maxWidth: 560 }}>
      <Section.Title>Profile</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Profile picture</Section.Label>
              <Section.Description>PNG or JPEG, Recommended size 1:1, up to 10MB.</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Avatar.Root size='lg'>
                <Avatar.Image
                  alt='Preston Booth'
                  src='https://avatars.githubusercontent.com/u/51144033?v=4'
                />
                <Avatar.Fallback>PB</Avatar.Fallback>
              </Avatar.Root>
            </Section.Actions>
          </Section.Item>
        </Section.Row>

        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Name</Section.Label>
              <Section.Description>Preston Booth</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update name
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>

        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Username</Section.Label>
              <Section.Description>Prestonb.xyz</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Update username
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>

        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Email</Section.Label>
            </Section.Content>
            <Section.Actions>
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
            </Section.Actions>
          </Section.Item>
          <Section.Items>
            <Section.Item>
              <Section.Content>
                <Section.Description style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
                  item1@clerk.dev
                  <Badge color='neutral'>Primary</Badge>
                </Section.Description>
              </Section.Content>
              <Section.Actions>
                <Button
                  aria-label='Manage item1@clerk.dev'
                  color='neutral'
                  shape='square'
                  size='sm'
                  variant='ghost'
                >
                  <Icon name='ellipsis' />
                </Button>
              </Section.Actions>
            </Section.Item>
            <Section.Item>
              <Section.Content>
                <Section.Description>item2@clerk.dev</Section.Description>
              </Section.Content>
              <Section.Actions>
                <Button
                  aria-label='Manage item2@clerk.dev'
                  color='neutral'
                  shape='square'
                  size='sm'
                  variant='ghost'
                >
                  <Icon name='ellipsis' />
                </Button>
              </Section.Actions>
            </Section.Item>
          </Section.Items>
        </Section.Row>

        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Phone</Section.Label>
            </Section.Content>
            <Section.Actions>
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
            </Section.Actions>
          </Section.Item>
          <Section.Items>
            <Section.Item>
              <Section.Content>
                <Section.Description style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
                  +1 801-888-8181
                  <Badge color='neutral'>Primary</Badge>
                </Section.Description>
              </Section.Content>
              <Section.Actions>
                <Button
                  aria-label='Manage +1 801-888-8181'
                  color='neutral'
                  shape='square'
                  size='sm'
                  variant='ghost'
                >
                  <Icon name='ellipsis' />
                </Button>
              </Section.Actions>
            </Section.Item>
          </Section.Items>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}

export function ConnectedAccounts() {
  return (
    <Section.Root style={{ maxWidth: 560 }}>
      <Section.Title>Connected accounts</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Media>
              <ProviderIcon provider='google' />
            </Section.Media>
            <Section.Content>
              <Section.Label>Google</Section.Label>
              <Section.Description>test@google.com</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                aria-label='Manage Google'
                color='neutral'
                shape='square'
                size='sm'
                variant='ghost'
              >
                <Icon name='ellipsis' />
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>
        <Section.Row>
          <Section.Item>
            <Section.Media>
              <ProviderIcon provider='apple' />
            </Section.Media>
            <Section.Content>
              <Section.Label>Apple</Section.Label>
            </Section.Content>
            <Section.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Connect
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}

export function Destructive() {
  return (
    <Section.Root>
      <Section.Title>Danger zone</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Delete account</Section.Label>
              <Section.Description>
                Permanently delete this profile and all its data. This cannot be undone.
              </Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='negative'
                size='sm'
                variant='ghost'
              >
                Delete account
              </Button>
            </Section.Actions>
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}
