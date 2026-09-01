import { Tabs } from '@clerk/headless/tabs';
import type { RenderProps } from '@clerk/headless/utils';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Card } from '@clerk/ui/mosaic/components/card';
import type { DialogSize } from '@clerk/ui/mosaic/components/dialog';
import { createConfirmHandle, Dialog, useConfirmedClose } from '@clerk/ui/mosaic/components/dialog';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Input } from '@clerk/ui/mosaic/components/input';
import { scrollAreaRoot, scrollAreaViewport } from '@clerk/ui/mosaic/components/scroll-area';
import { Text } from '@clerk/ui/mosaic/components/text';
import { ProfilePage } from '@clerk/ui/mosaic/profile-page';
import { UserPageView } from '@clerk/ui/mosaic/user-profile/user-page.view';
import { UserProfileProfilePanelView } from '@clerk/ui/mosaic/user-profile/user-profile-profile-panel.view';
import { UserProfileSecurityPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import type { UserProfilePanelId } from '@clerk/ui/mosaic/user-profile/user-profile-sidebar';
import { UserProfileSidebar } from '@clerk/ui/mosaic/user-profile/user-profile-sidebar';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

import { useUserPageFixture } from './fixtures/user-page';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './dialog.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Dialog',
  source: 'packages/ui/src/mosaic/components/dialog/dialog.tsx',
  styles: {
    _variants: {
      size: { prompt: {}, card: {}, panel: {} },
    },
    _defaultVariants: {
      size: 'prompt',
    },
  },
};

const dialogTrigger = (props: RenderProps) => <Button {...props}>Open dialog</Button>;

export function Default(args: Record<string, unknown>) {
  const { size } = args as { size?: DialogSize };
  return (
    <Dialog.Root>
      <Dialog.Trigger render={dialogTrigger} />
      <Dialog.Popup size={size}>
        <Dialog.CloseButton />
        <Dialog.Title>Confirm action</Dialog.Title>
        <Dialog.Description>Are you sure you want to proceed? This action cannot be undone.</Dialog.Description>
        <Dialog.Close render={<Button color='negative' />}>Cancel</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

const deleteTrigger = (props: RenderProps) => (
  <Button
    {...props}
    color='negative'
  >
    Delete organization
  </Button>
);

/**
 * `role='alertdialog'` is the whole difference: it announces as an interruption, an outside press
 * cannot dismiss it, and it is always a `prompt`. `Dialog.Actions` holds the answer, cancel first.
 */
export function Alert() {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={setOpen}
    >
      <Dialog.Trigger render={deleteTrigger} />
      <Dialog.Popup>
        <Dialog.Title render={<Heading size='sm' />}>Delete Acme Inc?</Dialog.Title>
        <Dialog.Description render={<Text />}>
          The organization and everything in it will be permanently removed. This cannot be undone.
        </Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
          {/* Not a `Dialog.Close`: the action is where the work happens, so the caller closes
              once it resolves rather than the button closing on press. */}
          <Button
            color='negative'
            onClick={() => setOpen(false)}
          >
            Delete organization
          </Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

const addEmailTrigger = (props: RenderProps) => <Button {...props}>Add email address</Button>;

// `useConfirmedClose` wraps the dialog's own `onOpenChange`, so every close it owns — Escape, the
// corner X, `Dialog.Close` — is guarded by one hook and a veto is just the absence of a commit.
// `Dialog.Confirm` renders INSIDE the dialog it guards so the two share a floating tree, which
// escape ordering, the stacking styles and the refcounted scroll lock all depend on. `finalFocus` is
// optional but wanted here: a confirmation raised by a close request has no trigger to return to.
export function DiscardChanges() {
  const confirm = React.useMemo(() => createConfirmHandle(), []);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Adding is the one close that must not be questioned. A ref rather than clearing `value`,
  // because `when` runs before React has re-rendered and would still read the old state.
  const bypassGuardRef = React.useRef(false);

  const onOpenChange = useConfirmedClose({
    handle: confirm,
    when: () => !bypassGuardRef.current && value.trim() !== '',
    onOpenChange: next => {
      setOpen(next);
      if (!next) {
        bypassGuardRef.current = false;
        setValue('');
      }
    },
    confirm: {
      title: 'Discard changes?',
      description: 'You have not finished adding this address. It will not be saved.',
      actionLabel: 'Discard',
      cancelLabel: 'Keep editing',
      destructive: true,
    },
  });

  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Trigger render={addEmailTrigger} />
      <Dialog.Popup>
        <Dialog.CloseButton />
        <Dialog.Title render={<Heading size='sm' />}>Add email address</Dialog.Title>
        <Dialog.Description render={<Text />}>
          You will need to verify this address before it can be used.
        </Dialog.Description>
        <Input
          ref={inputRef}
          placeholder='name@example.com'
          value={value}
          onChange={event => setValue(event.target.value)}
        />
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
          <Button
            onClick={() => {
              bypassGuardRef.current = true;
              onOpenChange(false, { trigger: null, triggerId: null, event: undefined });
            }}
          >
            Add
          </Button>
        </Dialog.Actions>

        <Dialog.Confirm
          handle={confirm}
          finalFocus={inputRef}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

const accountTrigger = (props: RenderProps) => <Button {...props}>Open account</Button>;

/**
 * The "add email address" prompt the account panel opens, driven by `open` rather than a trigger.
 * Closing it with a value typed asks first — `panel -> prompt -> prompt`.
 */
function AddEmailDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (value: string) => void;
}) {
  const confirm = React.useMemo(() => createConfirmHandle(), []);
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const guardedOpenChange = useConfirmedClose({
    handle: confirm,
    when: () => value.trim() !== '',
    onOpenChange: next => {
      onOpenChange(next);
      if (!next) {
        setValue('');
      }
    },
    confirm: {
      title: 'Discard changes?',
      description: 'You have not finished adding this address. It will not be saved.',
      actionLabel: 'Discard',
      cancelLabel: 'Keep editing',
      destructive: true,
    },
  });

  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={guardedOpenChange}
    >
      <Dialog.Popup>
        <Dialog.CloseButton />
        <Dialog.Title render={<Heading size='sm' />}>Add email address</Dialog.Title>
        <Dialog.Description render={<Text />}>A verification code will be sent to this address.</Dialog.Description>
        <Input
          ref={inputRef}
          type='email'
          placeholder='you@example.com'
          value={value}
          onChange={event => setValue(event.target.value)}
        />
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
          {/* Straight to the parent's setter: adding is the one close that must not be questioned. */}
          <Button
            disabled={value.trim() === ''}
            onClick={() => {
              onAdd(value.trim());
              setValue('');
              onOpenChange(false);
            }}
          >
            Add email
          </Button>
        </Dialog.Actions>
        <Dialog.Confirm
          handle={confirm}
          finalFocus={inputRef}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/**
 * The real user page — sidebar plus the account and security panels — as the content of a `panel`
 * dialog. The popup supplies the frame, so the page's own border is dropped; the popup clips, so
 * the page scrolls inside it. Adding an email opens a `prompt` over the panel, and the danger
 * zone's delete confirmation is the page's own.
 */
function AccountPage() {
  const [addEmailOpen, setAddEmailOpen] = React.useState(false);
  const { activePanel, setActivePanel, panels, addEmail } = useUserPageFixture({
    onAddEmail: () => setAddEmailOpen(true),
  });
  return (
    <>
      <div
        {...stylex.props(scrollAreaRoot)}
        style={{ flex: 1, minHeight: 0 }}
      >
        <div {...stylex.props(...scrollAreaViewport())}>
          <UserPageView
            activePanel={activePanel}
            panels={panels}
            onPanelChange={setActivePanel}
            style={{ border: 0, borderRadius: 0, maxWidth: 'none', minHeight: '100%' }}
          />
        </div>
      </div>
      <AddEmailDialog
        open={addEmailOpen}
        onOpenChange={setAddEmailOpen}
        onAdd={addEmail}
      />
    </>
  );
}

/** The user page in a `panel`, with `prompt` dialogs opened from inside it. */
export function Nested() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={accountTrigger} />
      <Dialog.Popup
        size='panel'
        aria-label='Account'
      >
        <Dialog.CloseButton />
        <AccountPage />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/**
 * The same page presented `inline`: it is the page's content rather than a surface over it, so
 * there is no portal, scrim, scroll lock or focus trap, and nothing dismisses it. The prompts it
 * opens are still modal over the whole page.
 *
 * The host is resizable. The dialog's width bands are container queries against its own viewport
 * element, so dragging the host below `48rem` gives the panel its phone-band inset without the
 * browser window moving — the same rule that makes a modal dialog respond to the window.
 */
export function Inline() {
  return (
    <div
      style={{
        border: '1px dashed var(--cl-color-border)',
        borderRadius: '0.5rem',
        height: '36rem',
        maxWidth: '100%',
        overflow: 'auto',
        padding: '1rem',
        resize: 'horizontal',
        width: '52rem',
      }}
    >
      <Dialog.Root inline>
        <Dialog.Popup
          size='panel'
          aria-label='Account'
        >
          <AccountPage />
        </Dialog.Popup>
      </Dialog.Root>
    </div>
  );
}

const settingsTrigger = (props: RenderProps) => <Button {...props}>Open settings</Button>;

const editProfileTrigger = (props: RenderProps) => <Button {...props}>Edit profile</Button>;

/**
 * A prompt stacked on a prompt — the shape a close confirmation takes. Edit the name and press
 * Cancel: the second prompt paints no scrim of its own, and the one beneath it recedes instead.
 */
export function StackedPrompts() {
  const confirm = React.useMemo(() => createConfirmHandle(), []);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('Ada Lovelace');
  const nameRef = React.useRef<HTMLInputElement>(null);

  const onOpenChange = useConfirmedClose({
    handle: confirm,
    when: () => name !== 'Ada Lovelace',
    onOpenChange: next => {
      setOpen(next);
      if (!next) {
        setName('Ada Lovelace');
      }
    },
    confirm: {
      title: 'Discard changes?',
      description: 'Your edits will be lost.',
      actionLabel: 'Discard',
      cancelLabel: 'Keep editing',
      destructive: true,
    },
  });

  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Trigger render={editProfileTrigger} />
      <Dialog.Popup>
        <Dialog.CloseButton />
        <Dialog.Title render={<Heading size='sm' />}>Update profile</Dialog.Title>
        <Dialog.Description render={<Text />}>Change the name people see on your account.</Dialog.Description>
        <Input
          ref={nameRef}
          placeholder='Your name'
          value={name}
          onChange={event => setName(event.target.value)}
        />
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
          <Button onClick={() => setOpen(false)}>Save</Button>
        </Dialog.Actions>
        <Dialog.Confirm
          handle={confirm}
          finalFocus={nameRef}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

const PANELS: readonly UserProfilePanelId[] = ['account', 'security'];

/** The panel clips rather than scrolling, so the scroll region is composed inside it. */
export function PanelSidebar() {
  const { activePanel, setActivePanel, panels } = useUserPageFixture();
  return (
    <Dialog.Root>
      <Dialog.Trigger render={settingsTrigger} />
      <Dialog.Popup
        size='panel'
        aria-label='Account'
      >
        <Dialog.CloseButton />
        {/* The sidebar's tabs and the panels share this context; `ProfilePage.Root` would supply
            it too, but its grid gives the content column no height to scroll within. */}
        <Tabs.Root
          value={activePanel}
          onValueChange={value => setActivePanel(value as UserProfilePanelId)}
          orientation='vertical'
        >
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* The rail has nowhere to go on a phone. Queried against the dialog's own `cl-dialog`
                container rather than the window, so it follows the surface it sits in — `@3xl` is
                Tailwind's 48rem, the dialog's phone band. On a wrapper, because the sidebar's own
                StyleX `display` outranks a Tailwind utility. */}
            <div
              className='@3xl/cl-dialog:flex hidden'
              style={{ flex: 'none', width: '14rem' }}
            >
              <UserProfileSidebar
                panels={PANELS}
                style={{ flex: 1 }}
              />
            </div>

            {/* Flush with the popup edge, so the scrollbar and edge fade land on the true edge. */}
            <div
              {...stylex.props(scrollAreaRoot)}
              style={{ flex: 1, minWidth: 0 }}
            >
              <div {...stylex.props(...scrollAreaViewport())}>
                <div style={{ padding: '2.5rem' }}>
                  <ProfilePage.Panel value='account'>
                    <UserProfileProfilePanelView {...panels.account} />
                  </ProfilePage.Panel>
                  <ProfilePage.Panel value='security'>
                    <UserProfileSecurityPanelView {...panels.security} />
                  </ProfilePage.Panel>
                </div>
              </div>
            </div>
          </div>
        </Tabs.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/**
 * A handle at module scope: the trigger and the root only share it, not a JSX ancestor.
 * The same handle also has imperative `open()` / `close()` for opens with no trigger at all.
 */
const notificationsDialog = Dialog.createHandle();

export function DetachedTrigger() {
  return (
    <>
      <Dialog.Trigger
        handle={notificationsDialog}
        render={props => <Button {...props}>View notifications</Button>}
      />
      <Dialog.Root handle={notificationsDialog}>
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Dialog.Title render={<Heading size='sm' />}>Notifications</Dialog.Title>
          <Dialog.Description render={<Text />}>You are all caught up. Good job!</Dialog.Description>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  );
}

const memberDialog = Dialog.createHandle<{ name: string; role: string }>();

const MEMBERS = [
  { name: 'Ada Lovelace', role: 'Admin' },
  { name: 'Grace Hopper', role: 'Member' },
  { name: 'Annie Easley', role: 'Member' },
];

/** One dialog, three triggers: each carries a payload the dialog's children render from. */
export function MultipleTriggers() {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {MEMBERS.map(member => (
          <Dialog.Trigger
            key={member.name}
            handle={memberDialog}
            id={member.name}
            payload={member}
            render={props => (
              <Button
                {...props}
                variant='outline'
              >
                {member.name}
              </Button>
            )}
          />
        ))}
      </div>
      <Dialog.Root handle={memberDialog}>
        {({ payload }) => (
          <Dialog.Popup>
            <Dialog.CloseButton />
            <Dialog.Title render={<Heading size='sm' />}>{payload?.name}</Dialog.Title>
            <Dialog.Description render={<Text />}>
              {payload ? `${payload.role} of this organization.` : null}
            </Dialog.Description>
          </Dialog.Popup>
        )}
      </Dialog.Root>
    </>
  );
}

/** `size='card'` paints nothing itself — the popup renders AS a `Card`, which supplies the surface. */
export function CardSurface() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={props => <Button {...props}>Sign in</Button>} />
      <Dialog.Popup
        size='card'
        render={<Card.Root elevation='overlay' />}
      >
        <Card.Header>
          <Card.Title>Sign in</Card.Title>
          <Card.Description>Continue to your account.</Card.Description>
        </Card.Header>
        <Card.Content>
          <Input placeholder='you@example.com' />
        </Card.Content>
        <Card.Footer>
          <Dialog.Close
            render={props => (
              <Button
                {...props}
                variant='outline'
                fullWidth
              >
                Cancel
              </Button>
            )}
          />
          <Button fullWidth>Continue</Button>
        </Card.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

// Long enough to outgrow a laptop screen, or the example demonstrates nothing.
const TERMS_CLAUSES = Array.from({ length: 12 }, (_, index) => ({
  heading: `${index + 1}. ${['Acceptance', 'Your account', 'Acceptable use', 'Content', 'Payment', 'Termination'][index % 6]}`,
  body:
    'You agree to use the service in accordance with these terms and with all applicable laws. ' +
    'We may update this document from time to time, and continued use after an update means you accept it.',
}));

/** A tall `card` outgrows the screen, so the whole dialog scrolls inside the viewport. */
export function OutsideScroll() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={props => <Button {...props}>Review terms</Button>} />
      <Dialog.Popup
        size='card'
        render={<Card.Root elevation='overlay' />}
      >
        <Card.Header>
          <Dialog.Title render={<Heading size='sm' />}>Terms of service</Dialog.Title>
          <Dialog.Description render={<Text />}>
            Nothing here scrolls on its own — the card grows past the screen and the viewport takes the scroll.
          </Dialog.Description>
        </Card.Header>
        <Card.Content>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {TERMS_CLAUSES.map(clause => (
              <div key={clause.heading}>
                <Heading size='xs'>{clause.heading}</Heading>
                <Text>{clause.body}</Text>
              </div>
            ))}
          </div>
        </Card.Content>
        <Card.Footer>
          <Dialog.Close
            render={props => (
              <Button
                {...props}
                variant='outline'
              >
                Decline
              </Button>
            )}
          />
          <Button>Accept</Button>
        </Card.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/** `initialFocus` skips past the close button and the name field; `finalFocus` is left default. */
export function CustomFocus() {
  const feedbackRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <Dialog.Root>
      <Dialog.Trigger render={props => <Button {...props}>Give feedback</Button>} />
      <Dialog.Popup initialFocus={feedbackRef}>
        <Dialog.CloseButton />
        <Dialog.Title render={<Heading size='sm' />}>Feedback</Dialog.Title>
        <Dialog.Description render={<Text />}>
          The feedback field takes focus on open — past the close button and the name field.
        </Dialog.Description>
        <Input placeholder='Name' />
        <Input
          ref={feedbackRef}
          placeholder='Feedback'
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}
