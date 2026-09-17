import type { RenderProps } from '@clerk/headless/utils';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Card } from '@clerk/ui/mosaic/components/card';
import type { DialogCompactPlacement, DialogVariant } from '@clerk/ui/mosaic/components/dialog';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Input } from '@clerk/ui/mosaic/components/input';
import { Text } from '@clerk/ui/mosaic/components/text';
import { UserProfileView } from '@clerk/ui/mosaic/features/user-profile/user-profile.view';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileFixture } from './fixtures/user-profile';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './dialog.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Dialog',
  source: 'packages/ui/src/mosaic/components/dialog/dialog.tsx',
  styles: {
    _variants: {
      variant: { card: {}, profile: {} },
      compactPlacement: { center: {}, sheet: {} },
    },
    _defaultVariants: {
      variant: 'card',
      compactPlacement: 'center',
    },
  },
};

const dialogTrigger = (props: RenderProps) => <Button {...props}>Open dialog</Button>;

// A stand-in for a surface, painted by the story rather than by a component, so the playground
// shows the DIALOG's own box — what each `variant` measures and where `compactPlacement` puts it.
// Every real dialog holds a `Card` or a `Profile` instead; see the examples below.
const surface: React.CSSProperties = {
  background: 'var(--cl-color-card)',
  border: '1px dashed var(--cl-color-border)',
  borderRadius: 'var(--cl-radius-xl)',
  color: 'var(--cl-color-card-foreground)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  height: '100%',
  padding: '1.5rem',
};

/**
 * The dialog paints nothing: it brings the geometry, the motion and the floating tree, and the
 * SURFACE comes from what is rendered inside it. This example draws its own box so the two are
 * visible apart — the dashed edge is the popup, and `variant` is what it measures.
 *
 * Every real dialog holds a `Card` (see [the surface section](#every-dialog-brings-its-own-surface))
 * or a `Profile` (see [A profile](#a-profile)), which is also where the name and the dismiss come
 * from — hence the `aria-label` and the corner `Dialog.CloseButton` standing in for them here.
 */
export function Default(args: Record<string, unknown>) {
  const { variant, compactPlacement } = args as {
    variant?: DialogVariant;
    compactPlacement?: DialogCompactPlacement;
  };
  return (
    <Dialog.Root>
      <Dialog.Trigger render={dialogTrigger} />
      <Dialog.Popup
        variant={variant}
        compactPlacement={compactPlacement}
        aria-label='Dialog surface'
      >
        <Dialog.CloseButton />
        <div style={surface}>
          <Heading size='sm'>The surface</Heading>
          <Text>
            The dashed edge is <code>Dialog.Popup</code>. A real dialog fills it with a Card or a Profile, which paints
            the frame, names the dialog and carries the dismiss.
          </Text>
        </div>
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
 * `role='alertdialog'` is the whole difference: it announces as an interruption, and an outside
 * press cannot dismiss it — a question that needs an answer must not be answerable by clicking
 * next to it. `Card.Header` withholds its corner dismiss for the same reason, and Escape still
 * closes it. Cancel first, so it takes the opening focus.
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
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>Delete Acme Inc?</Card.Title>
            <Card.Description>
              The organization and everything in it will be permanently removed. This cannot be undone.
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  fullWidth
                />
              }
            >
              Cancel
            </Dialog.Close>
            {/* Not a `Dialog.Close`: the action is where the work happens, so the caller closes
                once it resolves rather than the button closing on press. */}
            <Button
              color='negative'
              fullWidth
              onClick={() => setOpen(false)}
            >
              Delete organization
            </Button>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

const addEmailTrigger = (props: RenderProps) => <Button {...props}>Add email address</Button>;

/**
 * `compactPlacement='sheet'` bottom-anchors the surface in the compact band — the dialog viewport
 * under `48rem` — and slides it up from the edge, instead of centring it. Above the band nothing
 * changes, so narrow the window to see it.
 *
 * For a dialog that asks one thing and returns: a confirmation, or a single-field form like this
 * one, where the answer belongs within thumb's reach.
 */
export function Sheet() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) {
          setValue('');
        }
      }}
    >
      <Dialog.Trigger render={addEmailTrigger} />
      <Dialog.Popup
        compactPlacement='sheet'
        initialFocus={inputRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>Add email address</Card.Title>
            <Card.Description>You will need to verify this address before it can be used.</Card.Description>
          </Card.Header>
          {/* A form, so Enter in the field is the primary action; Tab stays in visual order. */}
          <Card.Content
            render={
              <form
                id='add-email'
                onSubmit={event => {
                  event.preventDefault();
                  setValue('');
                  setOpen(false);
                }}
              />
            }
          >
            <Input
              ref={inputRef}
              type='email'
              required
              aria-label='Email address'
              placeholder='name@example.com'
              value={value}
              onChange={event => setValue(event.target.value)}
            />
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  fullWidth
                />
              }
            >
              Cancel
            </Dialog.Close>
            <Button
              type='submit'
              form='add-email'
              fullWidth
            >
              Add
            </Button>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

const editProfileTrigger = (props: RenderProps) => <Button {...props}>Edit profile</Button>;

/**
 * A dialog stacked on a dialog — the shape a close confirmation takes. Press Cancel: the alert
 * arrives over the form, paints no scrim of its own, and the surface beneath recedes and dims
 * instead. One scrim serves the whole stack, so depth never becomes a function of stack count.
 */
export function Stacked() {
  const [open, setOpen] = React.useState(false);
  const [savedName, setSavedName] = React.useState('Ada Lovelace');
  const [name, setName] = React.useState(savedName);
  const nameRef = React.useRef<HTMLInputElement>(null);

  const close = () => {
    setName(savedName);
    setOpen(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        if (next) {
          setOpen(true);
        } else {
          close();
        }
      }}
    >
      <Dialog.Trigger render={editProfileTrigger} />
      <Dialog.Popup initialFocus={nameRef}>
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>Update profile</Card.Title>
            <Card.Description>Change the name people see on your account.</Card.Description>
          </Card.Header>
          <Card.Content
            render={
              <form
                id='update-profile'
                onSubmit={event => {
                  event.preventDefault();
                  setSavedName(name);
                  setOpen(false);
                }}
              />
            }
          >
            <Input
              ref={nameRef}
              aria-label='Name'
              placeholder='Your name'
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </Card.Content>
          <Card.Footer>
            {/* The confirmation lives INSIDE the dialog it guards, so the two share one floating
                tree — which is what escape ordering, the stacking styles and the refcounted
                scroll lock all read. */}
            <Dialog.Root role='alertdialog'>
              <Dialog.Trigger
                render={
                  <Button
                    variant='outline'
                    fullWidth
                  />
                }
              >
                Cancel
              </Dialog.Trigger>
              <Dialog.Popup finalFocus={nameRef}>
                <Card.Root
                  elevation='overlay'
                  renderBranding={false}
                >
                  <Card.Header>
                    <Card.Title>Discard changes?</Card.Title>
                    <Card.Description>Your edits will be lost.</Card.Description>
                  </Card.Header>
                  <Card.Footer>
                    <Dialog.Close
                      render={
                        <Button
                          variant='outline'
                          fullWidth
                        />
                      }
                    >
                      Keep editing
                    </Dialog.Close>
                    <Button
                      color='negative'
                      fullWidth
                      onClick={close}
                    >
                      Discard
                    </Button>
                  </Card.Footer>
                </Card.Root>
              </Dialog.Popup>
            </Dialog.Root>
            <Button
              type='submit'
              form='update-profile'
              fullWidth
            >
              Save
            </Button>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

const accountTrigger = (props: RenderProps) => <Button {...props}>Open account</Button>;

/** The "add email address" dialog the account profile opens, driven by `open` rather than a trigger. */
function AddEmailDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (value: string) => void;
}) {
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        onOpenChange(next);
        if (!next) {
          setValue('');
        }
      }}
    >
      <Dialog.Popup
        compactPlacement='sheet'
        initialFocus={inputRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>Add email address</Card.Title>
            <Card.Description>A verification code will be sent to this address.</Card.Description>
          </Card.Header>
          <Card.Content
            render={
              <form
                id='profile-add-email'
                onSubmit={event => {
                  event.preventDefault();
                  onAdd(value.trim());
                  setValue('');
                  onOpenChange(false);
                }}
              />
            }
          >
            <Input
              ref={inputRef}
              type='email'
              required
              aria-label='Email address'
              placeholder='you@example.com'
              value={value}
              onChange={event => setValue(event.target.value)}
            />
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  fullWidth
                />
              }
            >
              Cancel
            </Dialog.Close>
            <Button
              type='submit'
              form='profile-add-email'
              fullWidth
            >
              Add email
            </Button>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/**
 * The real user page inside a `profile` dialog. The dialog positions it and the page paints
 * itself — the same composition as a `Card` inside a `card` dialog — so the page names the
 * dialog, scrolls its own content column, collapses its own sidebar, and carries the dismiss.
 * Adding an email opens a card over the profile; the danger zone's delete confirmation is the
 * page's own.
 */
export function Nested() {
  const [addEmailOpen, setAddEmailOpen] = React.useState(false);
  const { activePage, setActivePage, pages, addEmail } = useUserProfileFixture({
    onAddEmail: () => setAddEmailOpen(true),
  });
  return (
    <Dialog.Root>
      <Dialog.Trigger render={accountTrigger} />
      <Dialog.Popup variant='profile'>
        <UserProfileView
          activePage={activePage}
          pages={pages}
          onPageChange={setActivePage}
        />
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
 * The same page with no dialog around it at all: it is the page's content rather than a surface
 * over one, so there is no trigger, portal, scrim, scroll lock or focus trap, and nothing dismisses
 * it. The surface paints itself either way — only the placement differs — and the dialogs it opens
 * are still modal over the whole page.
 *
 * The host is resizable. The page's compact layout is a container query against the page itself, so
 * dragging the host below `48rem` collapses the sidebar without the browser window moving.
 */
export function Standalone() {
  const [addEmailOpen, setAddEmailOpen] = React.useState(false);
  const { activePage, setActivePage, pages, addEmail } = useUserProfileFixture({
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
      <UserProfileView
        activePage={activePage}
        pages={pages}
        onPageChange={setActivePage}
      />
      <AddEmailDialog
        open={addEmailOpen}
        onOpenChange={setAddEmailOpen}
        onAdd={addEmail}
      />
    </div>
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
          <Card.Root
            elevation='overlay'
            renderBranding={false}
          >
            <Card.Header>
              <Card.Title>Notifications</Card.Title>
              <Card.Description>You are all caught up. Good job!</Card.Description>
            </Card.Header>
          </Card.Root>
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
            <Card.Root
              elevation='overlay'
              renderBranding={false}
            >
              <Card.Header>
                <Card.Title>{payload?.name}</Card.Title>
                <Card.Description>{payload ? `${payload.role} of this organization.` : null}</Card.Description>
              </Card.Header>
            </Card.Root>
          </Dialog.Popup>
        )}
      </Dialog.Root>
    </>
  );
}

/** The sign-in / sign-up surface: the same composition, at the width the legacy card matches. */
export function CardSurface() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={props => <Button {...props}>Sign in</Button>} />
      <Dialog.Popup variant='card'>
        <Card.Root elevation='overlay'>
          <Card.Header>
            <Card.Title>Sign in</Card.Title>
            <Card.Description>Continue to your account.</Card.Description>
          </Card.Header>
          <Card.Content>
            <Input
              aria-label='Email address'
              placeholder='you@example.com'
            />
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
        </Card.Root>
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
      <Dialog.Popup variant='card'>
        <Card.Root elevation='overlay'>
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
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/** `initialFocus` skips past the card's dismiss and the name field; `finalFocus` is left default. */
export function CustomFocus() {
  const feedbackRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <Dialog.Root>
      <Dialog.Trigger render={props => <Button {...props}>Give feedback</Button>} />
      <Dialog.Popup initialFocus={feedbackRef}>
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>Feedback</Card.Title>
            <Card.Description>
              The feedback field takes focus on open — past the dismiss and the name field.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Input
              aria-label='Name'
              placeholder='Name'
            />
            <Input
              ref={feedbackRef}
              aria-label='Feedback'
              placeholder='Feedback'
            />
          </Card.Content>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
