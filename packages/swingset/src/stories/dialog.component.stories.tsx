import type { RenderProps } from '@clerk/headless/utils';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Card } from '@clerk/ui/mosaic/components/card';
import type { DialogSize } from '@clerk/ui/mosaic/components/dialog';
import { createConfirmHandle, Dialog, useConfirmedClose } from '@clerk/ui/mosaic/components/dialog';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Input } from '@clerk/ui/mosaic/components/input';
import { Text } from '@clerk/ui/mosaic/components/text';
import { UserPageView } from '@clerk/ui/mosaic/user-profile/user-page.view';
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
        {/* A form, so Enter in the field is the primary action; Tab stays in visual order. */}
        <form
          style={{ display: 'contents' }}
          onSubmit={event => {
            event.preventDefault();
            bypassGuardRef.current = true;
            onOpenChange(false, { trigger: null, triggerId: null, event: undefined });
          }}
        >
          <Input
            ref={inputRef}
            type='email'
            placeholder='name@example.com'
            value={value}
            onChange={event => setValue(event.target.value)}
          />
          <Dialog.Actions>
            <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
            <Button type='submit'>Add</Button>
          </Dialog.Actions>
        </form>

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
        {/* Straight to the parent's setter on submit: adding is the one close that must not be
            questioned. A form, so Enter in the field adds. */}
        <form
          style={{ display: 'contents' }}
          onSubmit={event => {
            event.preventDefault();
            onAdd(value.trim());
            setValue('');
            onOpenChange(false);
          }}
        >
          <Input
            ref={inputRef}
            type='email'
            required
            placeholder='you@example.com'
            value={value}
            onChange={event => setValue(event.target.value)}
          />
          <Dialog.Actions>
            <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
            <Button type='submit'>Add email</Button>
          </Dialog.Actions>
        </form>
        <Dialog.Confirm
          handle={confirm}
          finalFocus={inputRef}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/**
 * The real user page as the popup of a `panel` dialog. The dialog positions it and the page
 * paints itself — the same composition as a `card` rendering as a `Card` — so the page scrolls
 * its own content column, collapses its own sidebar, and carries the dismiss. Prompts it opens
 * go in as children: adding an email opens one over the panel, and the danger zone's delete
 * confirmation is the page's own.
 */
export function Nested() {
  const [addEmailOpen, setAddEmailOpen] = React.useState(false);
  const { activePanel, setActivePanel, panels, addEmail } = useUserPageFixture({
    onAddEmail: () => setAddEmailOpen(true),
  });
  return (
    <Dialog.Root>
      <Dialog.Trigger render={accountTrigger} />
      <Dialog.Popup
        size='panel'
        aria-label='Account'
        render={
          <UserPageView
            activePanel={activePanel}
            panels={panels}
            onPanelChange={setActivePanel}
          />
        }
      >
        <AddEmailDialog
          open={addEmailOpen}
          onOpenChange={setAddEmailOpen}
          onAdd={addEmail}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/**
 * The same page presented `inline`: it is the page's content rather than a surface over it, so
 * there is no trigger, portal, scrim, scroll lock or focus trap, and nothing dismisses it. The
 * prompts it opens are still modal over the whole page.
 *
 * The host is resizable. The page's compact layout is a container query against the page itself,
 * and the dialog's inset is one against its viewport, so dragging the host below `48rem`
 * collapses the sidebar without the browser window moving.
 */
export function Inline() {
  const [addEmailOpen, setAddEmailOpen] = React.useState(false);
  const { activePanel, setActivePanel, panels, addEmail } = useUserPageFixture({
    onAddEmail: () => setAddEmailOpen(true),
  });
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
          render={
            <UserPageView
              activePanel={activePanel}
              panels={panels}
              onPanelChange={setActivePanel}
            />
          }
        >
          <AddEmailDialog
            open={addEmailOpen}
            onOpenChange={setAddEmailOpen}
            onAdd={addEmail}
          />
        </Dialog.Popup>
      </Dialog.Root>
    </div>
  );
}

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
        {/* Saving goes straight to `setOpen`, past the guard. A form, so Enter in the field saves. */}
        <form
          style={{ display: 'contents' }}
          onSubmit={event => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <Input
            ref={nameRef}
            placeholder='Your name'
            value={name}
            onChange={event => setName(event.target.value)}
          />
          <Dialog.Actions>
            <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
            <Button type='submit'>Save</Button>
          </Dialog.Actions>
        </form>
        <Dialog.Confirm
          handle={confirm}
          finalFocus={nameRef}
        />
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
          <Card.Title>Terms of service</Card.Title>
          <Card.Description>
            Nothing here scrolls on its own — the card grows past the screen and the viewport takes the scroll.
          </Card.Description>
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
