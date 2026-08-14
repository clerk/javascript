import type { RenderProps } from '@clerk/headless/utils';
import { AlertDialog, createConfirmHandle } from '@clerk/ui/mosaic/components/alert-dialog';
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Badge } from '@clerk/ui/mosaic/components/badge';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Input } from '@clerk/ui/mosaic/components/input';
import { Item } from '@clerk/ui/mosaic/components/item';
import { Menu } from '@clerk/ui/mosaic/components/menu';
import { Section } from '@clerk/ui/mosaic/components/section';
import { Text } from '@clerk/ui/mosaic/components/text';
import { colorVars, radiusVars } from '@clerk/ui/mosaic/styles';
import React from 'react';

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

/** An address on the account. `pending` is one added here and not yet verified. */
type EmailAddress = { address: string; pending?: boolean };

const INITIAL_EMAILS: EmailAddress[] = [{ address: 'preston@clerk.dev' }, { address: 'me@prestonb.xyz' }];

const manageEmailsTrigger = (props: RenderProps) => (
  <Button
    {...props}
    color='neutral'
    size='sm'
    variant='outline'
  >
    Manage emails
  </Button>
);

const inlineBadge = { alignItems: 'center', display: 'flex', gap: 4 } as const;

// The row's action sits at the top of the row rather than centring against the address list.
const topAlignedActions = { alignSelf: 'flex-start' } as const;

// `Item.Group` ships padding but no frame, so the box and the rules between rows are drawn here.
const emailList = {
  border: `1px solid ${colorVars['--cl-color-border-faded']}`,
  borderRadius: radiusVars['--cl-radius-lg'],
  overflow: 'hidden',
  padding: 0,
} as const;

const promptActions = { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' } as const;

// `Dialog.Popup` gaps its children evenly; the title and its description read as one block, so they
// sit in a wrapper of their own and keep only the space their line heights give them.
const promptHeader = { display: 'flex', flexDirection: 'column' } as const;

/**
 * A second `prompt` opened from the first, so the two stack: the list recedes and stays on screen
 * behind it.
 *
 * Composed from the parts rather than from the `Dialog` wrapper, which takes no `initialFocus` —
 * a form prompt wants the caret in its field on open, and the wrapper's default lands it on the
 * corner close button instead.
 */
function AddEmailDialog({ onAdd }: { onAdd: (email: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const add = () => {
    onAdd(value.trim());
    setValue('');
    setOpen(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        if (!next) {
          setValue('');
        }
        setOpen(next);
      }}
      closedBy='closerequest'
    >
      <Dialog.Trigger render={<Button fullWidth />}>Add email</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup initialFocus={inputRef}>
            <Dialog.CloseButton />
            <div style={promptHeader}>
              <Dialog.Title render={<Heading size='lg' />}>Add email address</Dialog.Title>
              <Dialog.Description render={<Text />}>
                We&rsquo;ll send a verification code to this address.
              </Dialog.Description>
            </div>
            <Input
              ref={inputRef}
              type='email'
              placeholder='you@example.com'
              value={value}
              onChange={event => setValue(event.target.value)}
            />
            <div style={promptActions}>
              <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
              <Button
                disabled={value.trim() === ''}
                onClick={add}
              >
                Add
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * The profile section's email row, with the addresses managed from a `prompt` dialog opened out of
 * it — `section -> prompt -> prompt` to add one, `section -> prompt -> alert` to remove one.
 * Removing asks first, through `createConfirmHandle`'s awaitable `show()` — the same confirmation
 * `useConfirmedClose` raises, here answering a decision rather than guarding a close.
 *
 * `AlertDialog.Confirm` renders inside the dialog it interrupts, which is what stacks it over that
 * dialog rather than replacing it, and what leaves the list underneath dimmed and still in place
 * while the question is on screen.
 */
export function ManageEmails() {
  const confirm = React.useMemo(() => createConfirmHandle(), []);
  const [emails, setEmails] = React.useState(INITIAL_EMAILS);
  // Primary is the first address rather than its own state, so removing it promotes the next one.
  const primary = emails[0].address;

  const removeEmail = async (address: string) => {
    const confirmed = await confirm.show({
      title: `Remove ${address}?`,
      description: 'You will no longer be able to sign in or receive notifications at this address.',
      actionLabel: 'Remove email',
      cancelLabel: 'Cancel',
      destructive: true,
    });
    if (confirmed) {
      setEmails(current => current.filter(entry => entry.address !== address));
    }
  };

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
              <Section.Description>
                {emails.map(email => (
                  <span
                    key={email.address}
                    style={{ display: 'block' }}
                  >
                    {email.address}
                  </span>
                ))}
              </Section.Description>
            </Section.Content>
            <Section.Actions style={topAlignedActions}>
              <Dialog trigger={manageEmailsTrigger}>
                <Dialog.CloseButton />
                <div style={promptHeader}>
                  <Dialog.Title render={<Heading size='lg' />}>Manage emails</Dialog.Title>
                  <Dialog.Description render={<Text />}>
                    Add or remove the email addresses in your account.
                  </Dialog.Description>
                </div>
                <Item.Group style={emailList}>
                  {emails.map((email, index) => (
                    <React.Fragment key={email.address}>
                      {index === 0 ? null : <Item.Separator />}
                      <Item.Root>
                        <Item.Content>
                          <Item.Label style={inlineBadge}>
                            {email.address}
                            {email.address === primary ? <Badge color='neutral'>Primary</Badge> : null}
                            {email.pending ? <Badge color='warning'>Pending</Badge> : null}
                          </Item.Label>
                        </Item.Content>
                        <Item.Actions>
                          <Menu.Root>
                            <Menu.Trigger aria-label={`Manage ${email.address}`} />
                            <Menu.Content>
                              {/* An unverified address can't take over as primary, and the one
                                  already primary has nothing to promote. */}
                              {email.address === primary || email.pending ? null : (
                                <Menu.Item
                                  label='Set as primary'
                                  onClick={() =>
                                    setEmails(current => [
                                      email,
                                      ...current.filter(entry => entry.address !== email.address),
                                    ])
                                  }
                                >
                                  Set as primary
                                </Menu.Item>
                              )}
                              <Menu.Item
                                label='Remove email'
                                color='negative'
                                // An account has to keep an address to sign in with.
                                disabled={emails.length === 1}
                                onClick={() => void removeEmail(email.address)}
                              >
                                Remove email
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Root>
                        </Item.Actions>
                      </Item.Root>
                    </React.Fragment>
                  ))}
                </Item.Group>
                <AddEmailDialog onAdd={address => setEmails(current => [...current, { address, pending: true }])} />

                <AlertDialog.Confirm handle={confirm} />
              </Dialog>
            </Section.Actions>
          </Section.Item>
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
