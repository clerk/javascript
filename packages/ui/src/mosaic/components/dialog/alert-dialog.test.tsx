import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Card } from '../card';
import type { DialogRootProps } from './dialog';
import { Dialog } from './dialog';

afterEach(() => cleanup());

// Both dev warnings defer by a task, so the assertions have to let one elapse.
const settle = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

function Confirm({ onOpenChange, ...rest }: Partial<DialogRootProps> = {}) {
  return (
    <Dialog.Root
      defaultOpen
      {...rest}
      role='alertdialog'
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup>
        <Card.Root elevation='overlay'>
          <Card.Header>
            <Card.Title>Discard changes?</Card.Title>
            <Card.Description>This address has not been saved.</Card.Description>
          </Card.Header>
          <Card.Footer>
            <Dialog.Close>Keep editing</Dialog.Close>
            <button type='button'>Discard</button>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

describe('role="alertdialog"', () => {
  it('renders as an alertdialog, named and described by the card inside it', () => {
    render(<Confirm />);

    const popup = screen.getByRole('alertdialog', { name: 'Discard changes?' });
    expect(popup).toHaveAccessibleDescription('This address has not been saved.');
  });

  it('keeps the alertdialog role when a consumer passes one to the popup', () => {
    render(
      <Dialog.Root
        defaultOpen
        role='alertdialog'
      >
        <Dialog.Popup role='dialog'>
          <Card.Root elevation='overlay'>
            <Card.Header>
              <Card.Title>Discard changes?</Card.Title>
              <Card.Description>This address has not been saved.</Card.Description>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.getByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('carries the dialog slot classes, so it inherits the surface and its motion', () => {
    render(<Confirm />);

    expect(document.querySelector('.cl-dialog-backdrop')).toBeInTheDocument();
    expect(document.querySelector('.cl-dialog-viewport')).toBeInTheDocument();
    expect(document.querySelector('.cl-dialog-popup')).toBeInTheDocument();
  });

  // The role decides the dismissal policy, and nothing else: an alert is a `Card` at the card
  // size like every other dialog, and may be asked for any size and placement.
  it('takes the size it is given, like any other dialog', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Confirm />);

    expect(document.querySelector('.cl-dialog-popup')).toHaveAttribute('data-size', 'card');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  // A corner X answers the question by leaving, which is the one thing an alert must not offer.
  it('renders no dismiss in the card header, unlike a plain dialog', () => {
    const { unmount } = render(<Confirm />);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    unmount();

    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Card.Root elevation='overlay'>
            <Card.Header>
              <Card.Title>Add email address</Card.Title>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('opens from a trigger', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root role='alertdialog'>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Popup>
          <Card.Root elevation='overlay'>
            <Card.Header>
              <Card.Title>Delete this key?</Card.Title>
              <Card.Description>Applications using it stop working.</Card.Description>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  // With no corner dismiss to take it, the opening focus lands on the first button in the footer
  // — which is why the cancel is rendered first.
  it('opens focused on the cancel button, as the first element in the footer', async () => {
    render(<Confirm />);

    // `FloatingFocusManager` moves focus asynchronously after mount, so this waits rather than
    // letting a single task elapse — under a loaded run the one task is not always enough.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Keep editing' })).toHaveFocus());
  });

  it('closes on Dialog.Close, reporting it through onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Confirm onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Keep editing' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});

// An alert raised by a veto has no trigger, so without `finalFocus` there is nothing for focus to
// return to and answering the question drops the user on the body.
describe('focus', () => {
  it('returns focus where finalFocus points when it closes', async () => {
    const user = userEvent.setup();

    function Guarded() {
      const [confirmOpen, setConfirmOpen] = React.useState(true);
      const inputRef = React.useRef<HTMLInputElement>(null);
      return (
        <>
          <input
            ref={inputRef}
            aria-label='Email address'
          />
          <Dialog.Root
            role='alertdialog'
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
          >
            <Dialog.Popup finalFocus={inputRef}>
              <Card.Root elevation='overlay'>
                <Card.Header>
                  <Card.Title>Discard changes?</Card.Title>
                  <Card.Description>This address has not been saved.</Card.Description>
                </Card.Header>
                <Card.Footer>
                  <Dialog.Close>Keep editing</Dialog.Close>
                </Card.Footer>
              </Card.Root>
            </Dialog.Popup>
          </Dialog.Root>
        </>
      );
    }
    render(<Guarded />);

    await user.click(screen.getByRole('button', { name: 'Keep editing' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveFocus());
  });
});

// The dismissal policy is the behavioural half of what makes this an alert dialog: it cannot be
// answered by clicking next to it, but Escape — the keyboard's cancel — still works.
describe('dismissal', () => {
  it('does not close on an outside press', async () => {
    const user = userEvent.setup();
    render(<Confirm />);

    await user.click(document.querySelector('.cl-dialog-backdrop') as HTMLElement);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Confirm />);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it("keeps Escape out too under dismissOn='none'", async () => {
    const user = userEvent.setup();
    render(<Confirm dismissOn='none' />);

    await user.keyboard('{Escape}');

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('lets a controlled consumer decline a close', async () => {
    const user = userEvent.setup();

    function Guarded() {
      const [open, setOpen] = React.useState(true);
      return (
        <Dialog.Root
          role='alertdialog'
          open={open}
          onOpenChange={next => {
            if (next) {
              setOpen(true);
            }
          }}
        >
          <Dialog.Popup>
            <Card.Root elevation='overlay'>
              <Card.Header>
                <Card.Title>Discard changes?</Card.Title>
                <Card.Description>This address has not been saved.</Card.Description>
              </Card.Header>
              <Card.Footer>
                <Dialog.Close>Keep editing</Dialog.Close>
              </Card.Footer>
            </Card.Root>
          </Dialog.Popup>
        </Dialog.Root>
      );
    }
    render(<Guarded />);

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});

describe('dev warnings', () => {
  it('warns when the alert dialog has no description', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root
        defaultOpen
        role='alertdialog'
      >
        <Dialog.Popup>
          <Card.Root elevation='overlay'>
            <Card.Header>
              <Card.Title>Discard changes?</Card.Title>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    await settle();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no description'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<Card.Description>'));
    warn.mockRestore();
  });

  it('does not ask a plain dialog for a description', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Card.Root elevation='overlay'>
            <Card.Header>
              <Card.Title>Notifications</Card.Title>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    await settle();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  // The name warning skipped any role but `dialog` before alert dialogs existed, which would have
  // made it silently inert for every one of them.
  it('warns when it has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root
        defaultOpen
        role='alertdialog'
      >
        <Dialog.Popup>
          <Card.Root elevation='overlay'>
            <Card.Header>
              <Card.Description>This address has not been saved.</Card.Description>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    await settle();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<Card.Title>'));
    warn.mockRestore();
  });

  it('stays quiet when both are supplied', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Confirm />);

    await settle();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

// A form dialog raising a "discard changes?" over itself is the case the whole stack was built for.
describe('stacked on another dialog', () => {
  it('stacks on a card without warning, and marks the surface beneath', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Card.Root elevation='overlay'>
            <Card.Header>
              <Card.Title>Add email address</Card.Title>
            </Card.Header>
          </Card.Root>
          <Dialog.Root role='alertdialog'>
            <Dialog.Trigger>Discard</Dialog.Trigger>
            <Dialog.Popup>
              <Card.Root elevation='overlay'>
                <Card.Header>
                  <Card.Title>Discard changes?</Card.Title>
                  <Card.Description>This address has not been saved.</Card.Description>
                </Card.Header>
              </Card.Root>
            </Dialog.Popup>
          </Dialog.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await settle();

    const popups = document.querySelectorAll('.cl-dialog-popup');
    expect(popups[0]).toHaveAttribute('data-stack-base', '');
    expect(popups[1]).toHaveAttribute('data-stacked', '');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
