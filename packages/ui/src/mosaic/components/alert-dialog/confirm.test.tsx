import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dialog } from '../dialog';
import { AlertDialog } from './alert-dialog';
import { createConfirmHandle } from './confirm-handle';
import { useConfirmedClose } from './use-confirmed-close';

afterEach(() => cleanup());

const settle = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

/**
 * The target shape: a form prompt that will not close while its field holds anything, guarded by a
 * confirmation stacked on it.
 */
function GuardedForm({ onClosed }: { onClosed?: () => void } = {}) {
  const confirm = React.useMemo(() => createConfirmHandle(), []);
  const [open, setOpen] = React.useState(true);
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onOpenChange = useConfirmedClose({
    handle: confirm,
    when: () => value.trim() !== '',
    onOpenChange: next => {
      setOpen(next);
      if (!next) {
        onClosed?.();
      }
    },
    confirm: {
      title: 'Discard changes?',
      description: 'This address has not been saved.',
      actionLabel: 'Discard',
      cancelLabel: 'Keep editing',
      destructive: true,
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      closedBy='closerequest'
    >
      <Dialog.Title>Add email address</Dialog.Title>
      <input
        ref={inputRef}
        aria-label='Email address'
        value={value}
        onChange={event => setValue(event.target.value)}
      />
      <Dialog.Close>Cancel</Dialog.Close>
      <AlertDialog.Confirm
        handle={confirm}
        finalFocus={inputRef}
      />
    </Dialog>
  );
}

describe('useConfirmedClose', () => {
  it('closes without asking when the guard does not apply', async () => {
    const user = userEvent.setup();
    render(<GuardedForm />);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('asks instead of closing once the guard applies, and keeps the dialog open behind it', async () => {
    const user = userEvent.setup();
    render(<GuardedForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'name@example.com');
    await user.keyboard('{Escape}');

    expect(screen.getByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();
    // `hidden: true` because it has to be: a modal confirmation marks everything outside it inert
    // and `aria-hidden`, the guarded dialog included, so the default accessible-tree query would
    // report it missing when it is merely covered. That it is still mounted is the assertion.
    expect(screen.getByRole('dialog', { name: 'Add email address', hidden: true })).toBeInTheDocument();
  });

  it('renders the labels the caller asked for', async () => {
    const user = userEvent.setup();
    render(<GuardedForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'a');
    await user.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('commits the close when the action is taken', async () => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(<GuardedForm onClosed={onClosed} />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'a');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Discard' }));

    await waitFor(() => expect(onClosed).toHaveBeenCalled());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves the dialog open when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(<GuardedForm onClosed={onClosed} />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'a');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    await settle();

    expect(onClosed).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Add email address' })).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  // A veto still runs floating-ui's synchronous `openchange` emit, so the focus machinery fires on
  // a close that never happened. Focus must not be dropped on the body.
  it('keeps focus inside the dialog after a vetoed Escape', async () => {
    const user = userEvent.setup();
    render(<GuardedForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'a');
    await user.keyboard('{Escape}');
    await settle();

    const alert = screen.getByRole('alertdialog');
    expect(alert.contains(document.activeElement)).toBe(true);
  });

  it('returns focus to the field when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    render(<GuardedForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'a');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveFocus());
  });

  // One question per answer: hammering Escape used to be able to stack a confirmation per keypress.
  it('opens one confirmation for repeated close requests', async () => {
    const user = userEvent.setup();
    render(<GuardedForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'a');
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    await settle();

    expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
  });

  it('covers Dialog.Close as well as Escape', async () => {
    const user = userEvent.setup();
    render(<GuardedForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'a');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Add email address', hidden: true })).toBeInTheDocument();
  });

  it('can be asked again after an answer', async () => {
    const user = userEvent.setup();
    render(<GuardedForm />);
    const field = screen.getByRole('textbox', { name: 'Email address' });

    await user.type(field, 'a');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    await settle();
    await user.keyboard('{Escape}');

    expect(screen.getByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();
  });
});

describe('createConfirmHandle', () => {
  it('resolves true for the action and false for a cancel', async () => {
    const user = userEvent.setup();
    const handle = createConfirmHandle();
    const answers: boolean[] = [];

    function Harness() {
      return (
        <Dialog defaultOpen>
          <Dialog.Title>Host</Dialog.Title>
          <button
            type='button'
            onClick={() => {
              void handle
                .show({ title: 'Delete this key?', description: 'Applications using it stop working.' })
                .then(answer => answers.push(answer));
            }}
          >
            Ask
          </button>
          <AlertDialog.Confirm handle={handle} />
        </Dialog>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Ask' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(answers).toEqual([true]));

    await user.click(screen.getByRole('button', { name: 'Ask' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(answers).toEqual([true, false]));
  });

  it('resolves false when dismissed with Escape', async () => {
    const user = userEvent.setup();
    const handle = createConfirmHandle();
    const answers: boolean[] = [];

    render(
      <Dialog defaultOpen>
        <Dialog.Title>Host</Dialog.Title>
        <button
          type='button'
          onClick={() => {
            void handle.show({ title: 'Sure?', description: 'No going back.' }).then(a => answers.push(a));
          }}
        >
          Ask
        </button>
        <AlertDialog.Confirm handle={handle} />
      </Dialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Ask' }));
    await user.keyboard('{Escape}');

    await waitFor(() => expect(answers).toEqual([false]));
  });

  it('returns the in-flight promise rather than opening a second confirmation', async () => {
    const handle = createConfirmHandle();
    render(
      <Dialog defaultOpen>
        <Dialog.Title>Host</Dialog.Title>
        <AlertDialog.Confirm handle={handle} />
      </Dialog>,
    );

    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    await act(async () => {
      first = handle.show({ title: 'First', description: 'One' });
      second = handle.show({ title: 'Second', description: 'Two' });
    });

    expect(second).toBe(first);
    expect(screen.getByRole('alertdialog', { name: 'First' })).toBeInTheDocument();
  });

  it('stacks over the dialog it guards rather than replacing it', async () => {
    const user = userEvent.setup();
    render(<GuardedForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'a');
    await user.keyboard('{Escape}');
    await settle();

    const popups = document.querySelectorAll('.cl-dialog-popup');
    expect(popups).toHaveLength(2);
    expect(popups[0]).toHaveAttribute('data-stack-base', '');
    expect(popups[1]).toHaveAttribute('data-stacked', '');
  });
});
