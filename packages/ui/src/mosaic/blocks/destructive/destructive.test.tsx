import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../components/button';
import { MosaicProvider } from '../../MosaicProvider';
import type { DestructiveProps } from './destructive';
import { Destructive } from './destructive';

function renderBlock(overrides: Partial<DestructiveProps> = {}) {
  return render(
    <MosaicProvider>
      <Destructive
        open
        onOpenChange={vi.fn()}
        title='Delete account?'
        description='All of your data will be permanently deleted.'
        fieldLabel='Type “Delete account” below to continue'
        confirmationValue='Delete account'
        actionLabel='Delete account'
        onDelete={vi.fn()}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

const confirmButton = () => screen.getByRole('button', { name: 'Delete account' });

describe('Destructive', () => {
  it('renders nothing until the caller opens it', () => {
    renderBlock({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks to open from the trigger', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderBlock({ open: false, onOpenChange, trigger: <Button>Delete account</Button> });

    await user.click(confirmButton());

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('holds the action until the typed phrase matches', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onDelete });

    expect(confirmButton()).toHaveAttribute('aria-disabled', 'true');

    await user.type(screen.getByRole('textbox'), 'Delete accoun');
    expect(confirmButton()).toHaveAttribute('aria-disabled', 'true');

    await user.type(screen.getByRole('textbox'), 't');
    expect(confirmButton()).not.toHaveAttribute('aria-disabled');

    await user.click(confirmButton());
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('submits on enter in the confirmation field, once the typed phrase matches', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onDelete });

    await user.type(screen.getByRole('textbox'), 'Delete accoun{Enter}');
    expect(onDelete).not.toHaveBeenCalled();

    await user.type(screen.getByRole('textbox'), 't{Enter}');
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('asks to close from cancel', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onOpenChange });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('clears the typed phrase once the caller closes it', async () => {
    const user = userEvent.setup();
    const view = renderBlock();

    await user.type(screen.getByRole('textbox'), 'Delete account');
    view.rerender(
      <MosaicProvider>
        <Destructive
          open={false}
          onOpenChange={vi.fn()}
          title='Delete account?'
          description='All of your data will be permanently deleted.'
          fieldLabel='Type “Delete account” below to continue'
          confirmationValue='Delete account'
          actionLabel='Delete account'
          onDelete={vi.fn()}
        />
      </MosaicProvider>,
    );
    view.rerender(
      <MosaicProvider>
        <Destructive
          open
          onOpenChange={vi.fn()}
          title='Delete account?'
          description='All of your data will be permanently deleted.'
          fieldLabel='Type “Delete account” below to continue'
          confirmationValue='Delete account'
          actionLabel='Delete account'
          onDelete={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('marks the field invalid and explains a failed attempt', () => {
    renderBlock({ errorMessage: 'Your subscription is still active.' });

    expect(screen.getByText('Your subscription is still active.')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('stays inert while the caller is deleting', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderBlock({ isDeleting: true, onDelete });

    await user.type(screen.getByRole('textbox'), 'Delete account');

    expect(screen.getByRole('textbox')).toBeDisabled();
    // Busy, not unavailable: the block leaves the pending affordance to `isPending` rather than
    // disabling the action a second time.
    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(confirmButton());
    expect(onDelete).not.toHaveBeenCalled();
  });
});
