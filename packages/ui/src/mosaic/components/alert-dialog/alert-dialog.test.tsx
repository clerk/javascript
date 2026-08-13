import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dialog } from '../dialog';
import { AlertDialog } from './alert-dialog';

afterEach(() => cleanup());

// Both dev warnings defer by a task, so the assertions have to let one elapse.
const settle = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

function Confirm({ onOpenChange }: { onOpenChange?: (open: boolean) => void } = {}) {
  return (
    <AlertDialog
      defaultOpen
      onOpenChange={onOpenChange}
    >
      <AlertDialog.Title>Discard changes?</AlertDialog.Title>
      <AlertDialog.Description>This address has not been saved.</AlertDialog.Description>
      <AlertDialog.Actions>
        <AlertDialog.Close>Keep editing</AlertDialog.Close>
        <button type='button'>Discard</button>
      </AlertDialog.Actions>
    </AlertDialog>
  );
}

describe('Mosaic AlertDialog', () => {
  it('renders as an alertdialog, named and described by its parts', () => {
    render(<Confirm />);

    const popup = screen.getByRole('alertdialog', { name: 'Discard changes?' });
    expect(popup).toHaveAccessibleDescription('This address has not been saved.');
  });

  it('carries the dialog slot classes, so it inherits the surface and its motion', () => {
    render(<Confirm />);

    expect(document.querySelector('.cl-dialog-backdrop')).toBeInTheDocument();
    expect(document.querySelector('.cl-dialog-viewport')).toBeInTheDocument();
    expect(document.querySelector('.cl-dialog-popup')).toBeInTheDocument();
    expect(document.querySelector('.cl-alert-dialog-actions')).toBeInTheDocument();
  });

  it('is always the prompt size', () => {
    render(<Confirm />);

    expect(document.querySelector('.cl-dialog-popup')).toHaveAttribute('data-size', 'prompt');
  });

  it('opens from a trigger', async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog
        trigger={props => (
          <button
            type='button'
            {...props}
          >
            Delete
          </button>
        )}
      >
        <AlertDialog.Title>Delete this key?</AlertDialog.Title>
        <AlertDialog.Description>Applications using it stop working.</AlertDialog.Description>
      </AlertDialog>,
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

  it('closes on AlertDialog.Close, reporting it through onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Confirm onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Keep editing' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('hands the render-prop form a close that routes through onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <AlertDialog
        defaultOpen
        onOpenChange={onOpenChange}
      >
        {({ close }) => (
          <>
            <AlertDialog.Title>Discard changes?</AlertDialog.Title>
            <AlertDialog.Description>This address has not been saved.</AlertDialog.Description>
            <AlertDialog.Actions>
              <button
                type='button'
                onClick={close}
              >
                Keep editing
              </button>
            </AlertDialog.Actions>
          </>
        )}
      </AlertDialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Keep editing' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });
});

// The dismissal policy is the behavioural half of what makes this an alert dialog: it cannot be
// answered by clicking next to it, but Escape — the keyboard's cancel — still works.
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
          <AlertDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            finalFocus={inputRef}
          >
            <AlertDialog.Title>Discard changes?</AlertDialog.Title>
            <AlertDialog.Description>This address has not been saved.</AlertDialog.Description>
            <AlertDialog.Actions>
              <AlertDialog.Close>Keep editing</AlertDialog.Close>
            </AlertDialog.Actions>
          </AlertDialog>
        </>
      );
    }
    render(<Guarded />);

    await user.click(screen.getByRole('button', { name: 'Keep editing' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveFocus());
  });
});

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

  it('lets a controlled consumer decline a close', async () => {
    const user = userEvent.setup();

    function Guarded() {
      const [open, setOpen] = React.useState(true);
      return (
        <AlertDialog
          open={open}
          onOpenChange={next => {
            if (next) {
              setOpen(true);
            }
          }}
        >
          <AlertDialog.Title>Discard changes?</AlertDialog.Title>
          <AlertDialog.Description>This address has not been saved.</AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close>Keep editing</AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog>
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
      <AlertDialog defaultOpen>
        <AlertDialog.Title>Discard changes?</AlertDialog.Title>
      </AlertDialog>,
    );

    await settle();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no description'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<AlertDialog.Description>'));
    warn.mockRestore();
  });

  // The name warning skipped any role but `dialog` before this component existed, which would have
  // made it silently inert for every alert dialog.
  it('warns when it has no accessible name, and names the alert dialog parts', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <AlertDialog defaultOpen>
        <AlertDialog.Description>This address has not been saved.</AlertDialog.Description>
      </AlertDialog>,
    );

    await settle();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<AlertDialog.Title>'));
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

describe('AlertDialog.Actions', () => {
  it('merges consumer className and style', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialog.Title>Discard changes?</AlertDialog.Title>
        <AlertDialog.Description>This address has not been saved.</AlertDialog.Description>
        <AlertDialog.Actions
          className='custom'
          style={{ marginBlockStart: '2rem' }}
          data-testid='actions'
        >
          <AlertDialog.Close>Keep editing</AlertDialog.Close>
        </AlertDialog.Actions>
      </AlertDialog>,
    );

    const actions = screen.getByTestId('actions');
    expect(actions).toHaveClass('cl-alert-dialog-actions');
    expect(actions).toHaveClass('custom');
    expect(actions).toHaveStyle({ marginBlockStart: '2rem' });
  });

  it('renders as another element through render', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialog.Title>Discard changes?</AlertDialog.Title>
        <AlertDialog.Description>This address has not been saved.</AlertDialog.Description>
        <AlertDialog.Actions render={props => <footer {...props} />}>
          <AlertDialog.Close>Keep editing</AlertDialog.Close>
        </AlertDialog.Actions>
      </AlertDialog>,
    );

    expect(document.querySelector('footer.cl-alert-dialog-actions')).toBeInTheDocument();
  });
});

// An alert dialog is a `prompt`, which is the size that may stack — a form prompt raising a
// "discard changes?" over itself is the case the whole stack was built for.
describe('stacked on another dialog', () => {
  it('stacks on a prompt without warning, and marks the surface beneath', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <Dialog.Title>Add email address</Dialog.Title>
        <AlertDialog
          trigger={props => (
            <button
              type='button'
              {...props}
            >
              Discard
            </button>
          )}
        >
          <AlertDialog.Title>Discard changes?</AlertDialog.Title>
          <AlertDialog.Description>This address has not been saved.</AlertDialog.Description>
        </AlertDialog>
      </Dialog>,
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
