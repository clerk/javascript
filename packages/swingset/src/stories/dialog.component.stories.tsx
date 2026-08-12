/** @jsxImportSource @emotion/react */
import type { RenderProps } from '@clerk/headless/utils';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Card } from '@clerk/ui/mosaic/components/card';
import type { DialogSize } from '@clerk/ui/mosaic/components/dialog';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
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
  styleEngine: 'stylex',
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
    <Dialog
      size={size}
      trigger={dialogTrigger}
    >
      {({ close }) => (
        <>
          <Dialog.CloseButton />
          <Dialog.Title>Confirm action</Dialog.Title>
          <Dialog.Description>Are you sure you want to proceed? This action cannot be undone.</Dialog.Description>
          <Button
            color='negative'
            onClick={close}
          >
            Cancel
          </Button>
        </>
      )}
    </Dialog>
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

const addEmailTrigger = addTrigger('Add email address');
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

// A `panel` has no padding of its own — its regions reach the popup's edges — so a body that is
// ordinary padded content supplies its own. See `PanelSidebar` for the case that motivates it.
const panelBody = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: '0.75rem',
  minHeight: 0,
  overflowY: 'auto',
  padding: '1.5rem',
} as const;

// The triggers deliberately sit at three corners of the panel — two at the inline end, at
// different heights, and one at the start edge near the bottom. Each card scales out of the
// button that opened it, so spreading them apart is what makes that visible; stacked in a
// column they would all resolve to nearly the same origin.
const sectionHeader = {
  alignItems: 'center',
  display: 'flex',
  gap: '1rem',
  justifyContent: 'space-between',
} as const;

/** A `card` dialog opened from inside the `panel` — the shape the account profile uses. */
function AddValueDialog({
  trigger,
  title,
  description,
  placeholder,
  confirmLabel = 'Continue',
  confirmColor,
}: {
  trigger: (props: RenderProps) => React.ReactElement;
  title: string;
  description: string;
  placeholder: string;
  confirmLabel?: string;
  confirmColor?: 'negative';
}) {
  return (
    <Dialog
      trigger={trigger}
      closedBy='closerequest'
    >
      {({ close }) => (
        <>
          <Dialog.CloseButton />
          <Dialog.Title render={<Heading size='sm' />}>{title}</Dialog.Title>
          <Dialog.Description render={<Text />}>{description}</Dialog.Description>
          <Input placeholder={placeholder} />
          {/* Hand-rolled, as every dialog's footer is today. A Header/Body/Footer split is planned. */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button
              variant='outline'
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              color={confirmColor}
              onClick={close}
            >
              {confirmLabel}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}

/** A `panel` account surface with `card` dialogs opened from inside it. */
export function Nested() {
  return (
    <Dialog
      size='panel'
      trigger={accountTrigger}
    >
      <Dialog.CloseButton />
      <div style={panelBody}>
        <Dialog.Title render={<Heading size='lg' />}>Account</Dialog.Title>
        <Dialog.Description render={<Text />}>Manage the addresses people can reach you at.</Dialog.Description>

        <div style={sectionHeader}>
          <Heading size='sm'>Email addresses</Heading>
          <AddValueDialog
            trigger={addEmailTrigger}
            title='Add email address'
            description="We'll send a verification code to this address."
            placeholder='you@example.com'
          />
        </div>
        <Item.Group>
          <Item.Root>
            <Item.Content>
              <Item.Title>ada@example.com</Item.Title>
              <Item.Description>Primary</Item.Description>
            </Item.Content>
          </Item.Root>
          <Item.Root>
            <Item.Content>
              <Item.Title>ada.lovelace@work.example.com</Item.Title>
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
              <Item.Title>+1 (555) 010-1842</Item.Title>
            </Item.Content>
          </Item.Root>
        </Item.Group>

        {/* Pinned to the bottom of the panel, at the opposite edge from the two above. */}
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
    </Dialog>
  );
}

const settingsTrigger = (props: RenderProps) => <Button {...props}>Open settings</Button>;

const NAV_SECTIONS = ['Profile', 'Security', 'Sessions', 'Connected accounts', 'Billing'];

// Deliberately long — a 27" display shows a lot of a 90dvh panel, and the example is worthless
// if it doesn't actually overflow there.
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

/**
 * The panel clips rather than scrolling, so the scroll region is composed inside it. A flex row
 * puts a fixed rail beside a scrolling column, and the close button — anchored to the popup —
 * stays put while the right side moves.
 */
export function PanelSidebar() {
  return (
    <Dialog
      size='panel'
      trigger={settingsTrigger}
    >
      <Dialog.CloseButton />

      {/* Its own header, so the accessible name survives the nav being hidden on a phone. */}
      <div style={{ flex: 'none', padding: '1.5rem 1.5rem 0' }}>
        <Dialog.Title render={<Heading size='lg' />}>Settings</Dialog.Title>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/*
          A 14rem rail beside a scrolling column has nowhere to go on a phone, so it is dropped
          below Tailwind's `md` — which is 48rem, the same band the dialog's own layout switches on.
        */}
        <nav
          className='hidden md:flex'
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
              // A nav row is a label, not a centred action — `Button` centres its content, so the
              // alignment has to be overridden per item.
              style={{ justifyContent: 'flex-start' }}
              aria-current={index === 2 ? 'page' : undefined}
            >
              {section}
            </Button>
          ))}
        </nav>

        {/*
          The scroll region sits FLUSH with the popup — no padding between it and the dialog edge —
          so its scrollbar and edge fade land on the true edge. Padding goes on the content inside
          it instead. `scrollAreaRoot` is the positioned ancestor; `scrollAreaViewport()` scrolls.
        */}
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
                      <Item.Title>{session.device}</Item.Title>
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
    </Dialog>
  );
}

/** `size='card'` paints nothing itself — the popup renders AS a `Card`, which supplies the surface. */
export function CardSurface() {
  return (
    <Dialog.Root size='card'>
      <Dialog.Trigger render={props => <Button {...props}>Sign in</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup render={<Card.Root elevation='overlay' />}>
            <Dialog.CloseButton />
            <Card.Header>
              <Dialog.Title render={<Heading size='sm' />}>Sign in</Dialog.Title>
              <Dialog.Description render={<Text />}>Continue to your account.</Dialog.Description>
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
                  >
                    Cancel
                  </Button>
                )}
              />
              <Button>Continue</Button>
            </Card.Footer>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
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
    <Dialog.Root size='card'>
      <Dialog.Trigger render={props => <Button {...props}>Review terms</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup render={<Card.Root elevation='overlay' />}>
            <Dialog.CloseButton />
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
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
