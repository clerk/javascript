import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
        <Dialog.Title>Discard changes?</Dialog.Title>
        <Dialog.Description>This address has not been saved.</Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close>Keep editing</Dialog.Close>
          <button type='button'>Discard</button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

describe('role="alertdialog"', () => {
  it('renders as an alertdialog, named and described by its parts', () => {
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
          <Dialog.Title>Discard changes?</Dialog.Title>
          <Dialog.Description>This address has not been saved.</Dialog.Description>
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
    expect(document.querySelector('.cl-dialog-actions')).toBeInTheDocument();
  });

  it('is always the prompt size, and warns when asked for another', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root
        defaultOpen
        role='alertdialog'
      >
        <Dialog.Popup size='profile'>
          <Dialog.Title>Discard changes?</Dialog.Title>
          <Dialog.Description>This address has not been saved.</Dialog.Description>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(document.querySelector('.cl-dialog-popup')).toHaveAttribute('data-size', 'prompt');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('size="profile"'));
    warn.mockRestore();
  });

  it('opens from a trigger', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root role='alertdialog'>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>Delete this key?</Dialog.Title>
          <Dialog.Description>Applications using it stop working.</Dialog.Description>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('opens focused on the cancel button, as the first element in the actions row', async () => {
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
              <Dialog.Title>Discard changes?</Dialog.Title>
              <Dialog.Description>This address has not been saved.</Dialog.Description>
              <Dialog.Actions>
                <Dialog.Close>Keep editing</Dialog.Close>
              </Dialog.Actions>
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

  it('keeps Escape out too under closedBy="none"', async () => {
    const user = userEvent.setup();
    render(<Confirm closedBy='none' />);

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
            <Dialog.Title>Discard changes?</Dialog.Title>
            <Dialog.Description>This address has not been saved.</Dialog.Description>
            <Dialog.Actions>
              <Dialog.Close>Keep editing</Dialog.Close>
            </Dialog.Actions>
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
          <Dialog.Title>Discard changes?</Dialog.Title>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    await settle();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no description'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<Dialog.Description>'));
    warn.mockRestore();
  });

  it('does not ask a plain dialog for a description', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.Title>Notifications</Dialog.Title>
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
          <Dialog.Description>This address has not been saved.</Dialog.Description>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    await settle();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<Dialog.Title>'));
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

describe('Dialog.Actions', () => {
  it('merges consumer className and style', () => {
    render(
      <Dialog.Root
        defaultOpen
        role='alertdialog'
      >
        <Dialog.Popup>
          <Dialog.Title>Discard changes?</Dialog.Title>
          <Dialog.Description>This address has not been saved.</Dialog.Description>
          <Dialog.Actions
            className='custom'
            style={{ marginBlockStart: '2rem' }}
            data-testid='actions'
          >
            <Dialog.Close>Keep editing</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    const actions = screen.getByTestId('actions');
    expect(actions).toHaveClass('cl-dialog-actions');
    expect(actions).toHaveClass('custom');
    expect(actions).toHaveStyle({ marginBlockStart: '2rem' });
  });

  it('renders as another element through render', () => {
    render(
      <Dialog.Root
        defaultOpen
        role='alertdialog'
      >
        <Dialog.Popup>
          <Dialog.Title>Discard changes?</Dialog.Title>
          <Dialog.Description>This address has not been saved.</Dialog.Description>
          <Dialog.Actions render={props => <footer {...props} />}>
            <Dialog.Close>Keep editing</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(document.querySelector('footer.cl-dialog-actions')).toBeInTheDocument();
  });
});

// An alert dialog is a `prompt`, which is the size that may stack — a form prompt raising a
// "discard changes?" over itself is the case the whole stack was built for.
describe('stacked on another dialog', () => {
  it('stacks on a prompt without warning, and marks the surface beneath', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.Title>Add email address</Dialog.Title>
          <Dialog.Root role='alertdialog'>
            <Dialog.Trigger>Discard</Dialog.Trigger>
            <Dialog.Popup>
              <Dialog.Title>Discard changes?</Dialog.Title>
              <Dialog.Description>This address has not been saved.</Dialog.Description>
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
