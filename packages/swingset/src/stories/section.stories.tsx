import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Badge } from '@clerk/ui/mosaic/components/badge';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Section } from '@clerk/ui/mosaic/components/section';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './section.stories?raw';

const providerIconUrl = (provider: string) => `https://img.clerk.com/static/${provider}.svg`;

const styles = stylex.create({
  providerMedia: {
    backgroundColor: 'var(--cl-color-background)',
    borderColor: 'light-dark(var(--cl-color-border-faded), var(--cl-color-background))',
    borderRadius: 'var(--cl-radius-lg)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  providerIcon: {
    display: 'block',
    height: '20px',
    width: '20px',
  },
});

function ProviderIcon({ provider }: { provider: string }) {
  return (
    <Section.Media
      size='lg'
      {...stylex.props(styles.providerMedia)}
    >
      <img
        alt=''
        src={providerIconUrl(provider)}
        {...stylex.props(styles.providerIcon)}
      />
    </Section.Media>
  );
}

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Section',
  source: 'packages/ui/src/mosaic/components/section/section.tsx',
};

export function Default() {
  return (
    <Section.Root style={{ maxWidth: 560 }}>
      <Section.Title>Profile</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Media size='lg'>
              <Avatar.Root size='fit'>
                <Avatar.Image
                  alt='Preston Booth'
                  src='https://avatars.githubusercontent.com/u/51144033?v=4'
                />
                <Avatar.Fallback>PB</Avatar.Fallback>
              </Avatar.Root>
            </Section.Media>
            <Section.Content>
              <Section.Label>Profile picture</Section.Label>
              <Section.Description>Recommend size 1:1, up to 10MB.</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Upload
              </Button>
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
                Edit name
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
                Edit username
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
            <Section.Media size='lg'>
              <Avatar.Root size='fit'>
                <Avatar.Image
                  alt='Preston Booth'
                  src='https://avatars.githubusercontent.com/u/51144033?v=4'
                />
                <Avatar.Fallback>PB</Avatar.Fallback>
              </Avatar.Root>
            </Section.Media>
            <Section.Content>
              <Section.Label>Profile picture</Section.Label>
              <Section.Description>Recommend size 1:1, up to 10MB.</Section.Description>
            </Section.Content>
            <Section.Actions>
              <Button
                color='neutral'
                size='sm'
                variant='outline'
              >
                Upload
              </Button>
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
                Edit name
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
                Edit username
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
                Add email
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
                Add phone number
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
            <ProviderIcon provider='google' />
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
            <ProviderIcon provider='apple' />
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
                <Icon
                  name='arrow-right-top'
                  placement='inline-end'
                  size='sm'
                />
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
                variant='outline'
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
