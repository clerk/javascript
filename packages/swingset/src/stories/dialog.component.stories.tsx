import type { RenderProps } from '@clerk/headless/utils';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Card } from '@clerk/ui/mosaic/components/card';
import type { DialogSize } from '@clerk/ui/mosaic/components/dialog';
import { createConfirmHandle, Dialog, useConfirmedClose } from '@clerk/ui/mosaic/components/dialog';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Input } from '@clerk/ui/mosaic/components/input';
import { Item } from '@clerk/ui/mosaic/components/item';
import { scrollAreaRoot, scrollAreaViewport } from '@clerk/ui/mosaic/components/scroll-area';
import { Text } from '@clerk/ui/mosaic/components/text';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

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
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
          <Button
            onClick={() => {
              bypassGuardRef.current = true;
              onOpenChange(false, { trigger: null, triggerId: null, event: undefined });
            }}
          >
            Add
          </Button>
        </div>

        <Dialog.Confirm
          handle={confirm}
          finalFocus={inputRef}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

const accountTrigger = (props: RenderProps) => <Button {...props}>Open account</Button>;

const addTrigger = (label: string) => (props: RenderProps) => (
  <Button
    {...props}
    variant='outline'
    size='sm'
  >
    <Icon
      name='plus'
      placement='inline-start'
    />
    {label}
  </Button>
);

const addEmailRowTrigger = addTrigger('Add email address');
const addPhoneTrigger = addTrigger('Add phone number');
const deleteAccountTrigger = (props: RenderProps) => (
  <Button
    {...props}
    color='negative'
    variant='outline'
    size='sm'
  >
    Delete account
  </Button>
);

// A `panel` has no padding of its own, so a body of ordinary content supplies it.
const panelBody = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: '0.75rem',
  minHeight: 0,
  overflowY: 'auto',
  padding: '1.5rem',
} as const;

const sectionHeader = {
  alignItems: 'center',
  display: 'flex',
  gap: '1rem',
  justifyContent: 'space-between',
} as const;

/**
 * A `prompt` dialog opened from inside the `panel` — the shape the account profile uses.
 *
 * With `confirmDiscard`, closing it while the field holds anything opens a confirmation stacked on
 * top rather than closing: `panel -> prompt -> prompt`, and the veto is nothing more than a
 * controlled `open` whose `onOpenChange` declines to commit. Hand-rolled here on purpose, to show
 * that a veto needs no machinery; `useConfirmedClose` is the same thing packaged, and
 * [Confirming a discard](#confirming-a-discard) has the composed version.
 */
function AddValueDialog({
  trigger,
  title,
  description,
  placeholder,
  confirmLabel = 'Continue',
  confirmColor,
  confirmDiscard = false,
}: {
  trigger: (props: RenderProps) => React.ReactElement;
  title: string;
  description: string;
  placeholder: string;
  confirmLabel?: string;
  confirmColor?: 'negative';
  confirmDiscard?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const dismiss = () => {
    setValue('');
    setOpen(false);
  };

  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={next => {
        // The veto. Every close request lands here — Escape, the corner X, `Dialog.Close` — so
        // declining to commit covers all of them at once. A footer button wired to a bare
        // `setOpen(false)` would go around it, which is the argument for `Dialog.Close`.
        if (!next && confirmDiscard && value.trim() !== '') {
          setDiscardOpen(true);
          return;
        }
        if (!next) {
          setValue('');
        }
        setOpen(next);
      }}
    >
      <Dialog.Trigger render={trigger} />
      <Dialog.Popup>
        <Dialog.CloseButton />
        <Dialog.Title render={<Heading size='sm' />}>{title}</Dialog.Title>
        <Dialog.Description render={<Text />}>{description}</Dialog.Description>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={event => setValue(event.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
          <Button
            color={confirmColor}
            onClick={dismiss}
          >
            {confirmLabel}
          </Button>
        </div>
        {confirmDiscard ? (
          <Dialog.Root
            role='alertdialog'
            open={discardOpen}
            onOpenChange={setDiscardOpen}
          >
            <Dialog.Popup>
              <Dialog.Title render={<Heading size='sm' />}>Discard changes?</Dialog.Title>
              <Dialog.Description render={<Text />}>
                You have not finished adding this address. It will not be saved.
              </Dialog.Description>
              <Dialog.Actions>
                <Dialog.Close render={<Button variant='outline' />}>Keep editing</Dialog.Close>
                <Button
                  color='negative'
                  onClick={() => {
                    setDiscardOpen(false);
                    dismiss();
                  }}
                >
                  Discard
                </Button>
              </Dialog.Actions>
            </Dialog.Popup>
          </Dialog.Root>
        ) : null}
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/** The account surface, shared by the modal `panel` and the inline one below. */
function AccountPanelBody() {
  return (
    <div style={panelBody}>
      <Dialog.Title render={<Heading size='lg' />}>Account</Dialog.Title>
      <Dialog.Description render={<Text />}>Manage the addresses people can reach you at.</Dialog.Description>

      <div style={sectionHeader}>
        <Heading size='sm'>Email addresses</Heading>
        <AddValueDialog
          trigger={addEmailRowTrigger}
          title='Add email address'
          description="We'll send a verification code to this address."
          placeholder='you@example.com'
          confirmDiscard
        />
      </div>
      <Item.Group>
        <Item.Root>
          <Item.Content>
            <Item.Label>ada@example.com</Item.Label>
            <Item.Description>Primary</Item.Description>
          </Item.Content>
        </Item.Root>
        <Item.Root>
          <Item.Content>
            <Item.Label>ada.lovelace@work.example.com</Item.Label>
          </Item.Content>
        </Item.Root>
      </Item.Group>

      <div style={sectionHeader}>
        <Heading size='sm'>Phone numbers</Heading>
        <AddValueDialog
          trigger={addPhoneTrigger}
          title='Add phone number'
          description="We'll send a verification code to this number."
          placeholder='+1 (555) 000-0000'
        />
      </div>
      <Item.Group>
        <Item.Root>
          <Item.Content>
            <Item.Label>+1 (555) 010-1842</Item.Label>
          </Item.Content>
        </Item.Root>
      </Item.Group>

      <div style={{ display: 'flex', marginBlockStart: 'auto' }}>
        <AddValueDialog
          trigger={deleteAccountTrigger}
          title='Delete account'
          description='Type your email address to confirm. This cannot be undone.'
          placeholder='you@example.com'
          confirmLabel='Delete account'
          confirmColor='negative'
        />
      </div>
    </div>
  );
}

/** A `panel` account surface with `prompt` dialogs opened from inside it. */
export function Nested() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={accountTrigger} />
      <Dialog.Popup size='panel'>
        <Dialog.CloseButton />
        <AccountPanelBody />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/**
 * The same panel presented `inline`: it is the page's content rather than a surface over it, so
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
        height: '32rem',
        maxWidth: '100%',
        overflow: 'auto',
        padding: '1rem',
        resize: 'horizontal',
        width: '40rem',
      }}
    >
      <Dialog.Root inline>
        <Dialog.Popup size='panel'>
          <AccountPanelBody />
        </Dialog.Popup>
      </Dialog.Root>
    </div>
  );
}

const settingsTrigger = (props: RenderProps) => <Button {...props}>Open settings</Button>;

const NAV_SECTIONS = ['Profile', 'Security', 'Sessions', 'Connected accounts', 'Billing'];

// Long enough to overflow the panel even on a large display, or the scroll example shows nothing.
const SESSION_DEVICES = [
  'MacBook Pro',
  'iPhone 15',
  'Windows PC',
  'iPad Air',
  'Pixel 8',
  'Linux Workstation',
  'MacBook Air',
  'Steam Deck',
];
const SESSION_PLACES = [
  'Denver, CO · Chrome',
  'Boulder, CO · Edge',
  'Fort Collins, CO · Firefox',
  'Seattle, WA · Chrome',
  'Remote · Safari',
];
const SESSION_TIMES = ['Active now', '2 hours ago', 'Yesterday', '3 days ago', 'Last week', 'Last month'];

const SESSIONS = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  device: SESSION_DEVICES[index % SESSION_DEVICES.length],
  where: SESSION_PLACES[index % SESSION_PLACES.length],
  when: SESSION_TIMES[index % SESSION_TIMES.length],
}));

const editProfileTrigger = (props: RenderProps) => <Button {...props}>Edit profile</Button>;

const discardTrigger = (props: RenderProps) => (
  <Button
    variant='outline'
    {...props}
  >
    Cancel
  </Button>
);

/**
 * A prompt stacked on a prompt — the shape a close confirmation takes. The second prompt paints
 * no scrim of its own; the one beneath it recedes instead.
 */
export function StackedPrompts() {
  const [open, setOpen] = React.useState(false);
  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={setOpen}
    >
      <Dialog.Trigger render={editProfileTrigger} />
      <Dialog.Popup>
        <Dialog.CloseButton />
        <Dialog.Title render={<Heading size='sm' />}>Update profile</Dialog.Title>
        <Dialog.Description render={<Text />}>Change the name people see on your account.</Dialog.Description>
        <Input
          defaultValue='Ada Lovelace'
          placeholder='Your name'
        />
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Dialog.Root
            role='alertdialog'
            open={confirmationOpen}
            onOpenChange={setConfirmationOpen}
          >
            <Dialog.Trigger render={discardTrigger} />
            <Dialog.Popup>
              <Dialog.Title render={<Heading size='sm' />}>Discard changes?</Dialog.Title>
              <Dialog.Description render={<Text />}>Your edits will be lost.</Dialog.Description>
              <Dialog.Actions>
                <Dialog.Close render={<Button variant='outline' />}>Keep editing</Dialog.Close>
                <Button
                  color='negative'
                  onClick={() => {
                    setConfirmationOpen(false);
                    setOpen(false);
                  }}
                >
                  Discard
                </Button>
              </Dialog.Actions>
            </Dialog.Popup>
          </Dialog.Root>
          <Button onClick={() => setOpen(false)}>Save</Button>
        </div>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/** The panel clips rather than scrolling, so the scroll region is composed inside it. */
export function PanelSidebar() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={settingsTrigger} />
      <Dialog.Popup size='panel'>
        <Dialog.CloseButton />

        {/* Its own header, so the accessible name survives the nav being hidden on a phone. */}
        <div style={{ flex: 'none', padding: '1.5rem 1.5rem 0' }}>
          <Dialog.Title render={<Heading size='lg' />}>Settings</Dialog.Title>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* The rail has nowhere to go on a phone. Queried against the dialog's own `cl-dialog`
              container rather than the window, so it follows the surface it sits in — `@3xl` is
              Tailwind's 48rem, the dialog's phone band. */}
          <nav
            className='@3xl/cl-dialog:flex hidden'
            style={{
              borderInlineEnd: `1px solid var(--cl-color-border)`,
              flex: 'none',
              flexDirection: 'column',
              gap: '0.25rem',
              padding: '1.5rem 1rem',
              width: '14rem',
            }}
          >
            {NAV_SECTIONS.map((section, index) => (
              <Button
                key={section}
                variant='ghost'
                size='sm'
                fullWidth
                // `Button` centres its content; a nav row wants a leading label.
                style={{ justifyContent: 'flex-start' }}
                aria-current={index === 2 ? 'page' : undefined}
              >
                {section}
              </Button>
            ))}
          </nav>

          {/* Flush with the popup edge, so the scrollbar and edge fade land on the true edge. */}
          <div
            {...stylex.props(scrollAreaRoot)}
            style={{ flex: 1, minWidth: 0 }}
          >
            <div {...stylex.props(...scrollAreaViewport())}>
              <div style={{ padding: '1.5rem' }}>
                <Item.Group>
                  {SESSIONS.map(session => (
                    <Item.Root key={session.id}>
                      <Item.Content>
                        <Item.Label>{session.device}</Item.Label>
                        <Item.Description>
                          {session.where} · {session.when}
                        </Item.Description>
                      </Item.Content>
                      <Item.Actions>
                        <Button
                          variant='outline'
                          size='sm'
                          color='negative'
                        >
                          Revoke
                        </Button>
                      </Item.Actions>
                    </Item.Root>
                  ))}
                </Item.Group>
              </div>
            </div>
          </div>
        </div>
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
