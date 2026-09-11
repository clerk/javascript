import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../components/button';
import { MosaicProvider } from '../../MosaicProvider';
import type { ConfirmationProps } from './confirmation';
import { Confirmation } from './confirmation';

function renderBlock(overrides: Partial<ConfirmationProps> = {}) {
  return render(
    <MosaicProvider>
      <Confirmation
        open
        onOpenChange={vi.fn()}
        title='Remove connected account'
        description='Google will be removed from this account. You will no longer be able to use this connected account and any dependent features will no longer work.'
        actionLabel='Remove'
        onConfirm={vi.fn()}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

const confirmButton = () => screen.getByRole('button', { name: 'Remove' });

describe('Confirmation', () => {
  it('renders nothing until the caller opens it', () => {
    renderBlock({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks to open from the trigger', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderBlock({ open: false, onOpenChange, trigger: <Button>Remove</Button> });

    await user.click(confirmButton());

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('confirms from the action', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onConfirm });

    await user.click(confirmButton());

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('asks to close from cancel', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onOpenChange });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('explains a failed attempt', () => {
    renderBlock({ errorMessage: 'Google is your only way to sign in.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Google is your only way to sign in.');
  });

  it('stays inert while the caller is confirming', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderBlock({ isConfirming: true, onConfirm });

    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(confirmButton());
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
