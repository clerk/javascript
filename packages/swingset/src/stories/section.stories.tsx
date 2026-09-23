import { Avatar } from '@clerk/mosaic/components/avatar';
import { Badge } from '@clerk/mosaic/components/badge';
import { Button } from '@clerk/mosaic/components/button';
import { Icon, IconFrame } from '@clerk/mosaic/components/icon';
import { Section } from '@clerk/mosaic/components/section';
import { space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './section.stories?raw';

const styles = stylex.create({
  rootMax: {
    maxWidth: 560,
  },
  descriptionFlex: {
    alignItems: 'center',
    display: 'flex',
    gap: 4,
  },
});

const providerIconUrl = (provider: string) => `https://img.clerk.com/static/${provider}.svg`;

function ProviderMedia({ provider }: { provider: string }) {
  return (
    <Section.Media size='lg'>
      <IconFrame>
        <img
          alt=''
          src={providerIconUrl(provider)}
          style={{ display: 'block', height: space['5'], width: space['5'] }}
        />
      </IconFrame>
    </Section.Media>
  );
}

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Section',
  source: 'packages/mosaic/src/components/section/section.tsx',
};

export function Default() {
  return (
    <Section.Root xstyle={styles.rootMax}>
      <Section.Group>
        <Section.Title>Profile</Section.Title>
        <Section.Surface>
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
        </Section.Surface>
      </Section.Group>
    </Section.Root>
  );
}

export function ContainedGroups() {
  return (
    <Section.Root xstyle={styles.rootMax}>
      <Section.Group>
        <Section.Title>Account</Section.Title>
        <Section.Surface>
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
        </Section.Surface>
      </Section.Group>
      {[
        { label: 'Email', values: ['item1@clerk.dev', 'item2@clerk.dev'] },
        { label: 'Phone', values: ['+1 801-888-8181'] },
      ].map(({ label, values }) => (
        <Section.Group
          key={label}
          variant='contained'
          aria-label={label}
        >
          <Section.Surface>
            <Section.Row>
              <Section.Header>
                <Section.Content>
                  <Section.Label>{label}</Section.Label>
                </Section.Content>
                <Section.Actions>
                  <Button
                    aria-label={`Add ${label.toLowerCase()}`}
                    color='neutral'
                    size='sm'
                    variant='outline'
                  >
                    <Icon
                      name='plus'
                      placement='inline-start'
                      size='sm'
                    />
                    Add
                  </Button>
                </Section.Actions>
              </Section.Header>
              <Section.Items>
                {values.map((value, index) => (
                  <Section.Item key={value}>
                    <Section.Content>
                      <Section.Description xstyle={styles.descriptionFlex}>
                        {value}
                        {index === 0 ? <Badge color='neutral'>Primary</Badge> : null}
                      </Section.Description>
                    </Section.Content>
                    <Section.Actions>
                      <Button
                        aria-label={`Manage ${value}`}
                        color='neutral'
                        shape='square'
                        size='sm'
                        variant='ghost'
                      >
                        <Icon name='ellipsis-horizontal' />
                      </Button>
                    </Section.Actions>
                  </Section.Item>
                ))}
              </Section.Items>
            </Section.Row>
          </Section.Surface>
        </Section.Group>
      ))}
    </Section.Root>
  );
}

export function FlatContainedGroups() {
  return (
    <>
      <style>{`
        @scope {
          .cl-section-group[data-variant='contained'] {
            margin-block-start: 1.25rem !important;
          }
          .cl-section-group[data-variant='contained'] > .cl-section-surface {
            border: 0 !important;
            border-radius: 0 !important;
            background: none !important;
            overflow: visible !important;
          }
          .cl-section-group[data-variant='contained'] .cl-section-row {
            margin-inline: 0 !important;
            padding-block: 0 !important;
          }
          .cl-section-group[data-variant='contained'] .cl-section-header .cl-button {
            padding: 0 !important;
            border: 0 !important;
            background: none !important;
            box-shadow: none !important;
          }
          .cl-section-group[data-variant='contained'] .cl-section-header .cl-section-label {
            font-size: var(--cl-text-base-size) !important;
            line-height: var(--cl-text-base-leading) !important;
          }
          .cl-section-group[data-variant='contained'] .cl-section-items {
            padding-inline: 1rem !important;
            border: 1px solid var(--cl-color-border) !important;
            border-radius: var(--cl-radius-xl) !important;
            background-color: var(--cl-color-background) !important;
          }
          .cl-section-group[data-variant='contained'] .cl-section-item[data-nested] {
            min-height: calc(4.625rem + 1px) !important;
          }
          .cl-section-group[data-variant='contained'] .cl-section-item[data-nested]:first-child {
            border-block-start-width: 0 !important;
          }
        }
      `}</style>
      <Section.Root xstyle={styles.rootMax}>
        <Section.Group>
          <Section.Title>Account</Section.Title>
          <Section.Surface>
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
          </Section.Surface>
        </Section.Group>
        {[
          { label: 'Email', values: ['item1@clerk.dev', 'item2@clerk.dev'] },
          { label: 'Phone', values: ['+1 801-888-8181'] },
        ].map(({ label, values }) => (
          <Section.Group
            key={label}
            variant='contained'
            aria-label={label}
          >
            <Section.Surface>
              <Section.Row>
                <Section.Header>
                  <Section.Content>
                    <Section.Label>{label}</Section.Label>
                  </Section.Content>
                  <Section.Actions>
                    <Button
                      aria-label={`Add ${label.toLowerCase()}`}
                      color='neutral'
                      size='sm'
                      variant='outline'
                    >
                      <Icon
                        name='plus'
                        placement='inline-start'
                        size='sm'
                      />
                      Add
                    </Button>
                  </Section.Actions>
                </Section.Header>
                <Section.Items>
                  {values.map((value, index) => (
                    <Section.Item key={value}>
                      <Section.Content>
                        <Section.Description xstyle={styles.descriptionFlex}>
                          {value}
                          {index === 0 ? <Badge color='neutral'>Primary</Badge> : null}
                        </Section.Description>
                      </Section.Content>
                      <Section.Actions>
                        <Button
                          aria-label={`Manage ${value}`}
                          color='neutral'
                          shape='square'
                          size='sm'
                          variant='ghost'
                        >
                          <Icon name='ellipsis-horizontal' />
                        </Button>
                      </Section.Actions>
                    </Section.Item>
                  ))}
                </Section.Items>
              </Section.Row>
            </Section.Surface>
          </Section.Group>
        ))}
      </Section.Root>
    </>
  );
}

export function ConnectedAccounts() {
  return (
    <Section.Root xstyle={styles.rootMax}>
      <Section.Group>
        <Section.Title>Connected accounts</Section.Title>
        <Section.Surface>
          <Section.Row>
            <Section.Item>
              <ProviderMedia provider='google' />
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
                  <Icon name='ellipsis-horizontal' />
                </Button>
              </Section.Actions>
            </Section.Item>
          </Section.Row>
          <Section.Row>
            <Section.Item>
              <ProviderMedia provider='apple' />
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
                    name='arrow-up-right'
                    placement='inline-end'
                    size='sm'
                  />
                </Button>
              </Section.Actions>
            </Section.Item>
          </Section.Row>
        </Section.Surface>
      </Section.Group>
    </Section.Root>
  );
}

export function IconFrameMedia() {
  return (
    <Section.Root xstyle={styles.rootMax}>
      <Section.Group>
        <Section.Title>Team</Section.Title>
        <Section.Surface>
          <Section.Row>
            <Section.Item>
              <Section.Media size='lg'>
                <IconFrame>
                  <Icon
                    name='users'
                    size='lg'
                  />
                </IconFrame>
              </Section.Media>
              <Section.Content>
                <Section.Label>Engineering</Section.Label>
                <Section.Description>12 members</Section.Description>
              </Section.Content>
            </Section.Item>
          </Section.Row>
        </Section.Surface>
      </Section.Group>
    </Section.Root>
  );
}

export function Destructive() {
  return (
    <Section.Root>
      <Section.Group>
        <Section.Title>Danger zone</Section.Title>
        <Section.Surface>
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
        </Section.Surface>
      </Section.Group>
    </Section.Root>
  );
}
