import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileDeleteAccountDialogView } from '../user-profile-delete-account-dialog.view';

function Harness({ onDelete = vi.fn() }: { onDelete?: () => void }) {
  const [confirmation, setConfirmation] = useState('');

  return (
    <MosaicProvider>
      <UserProfileDeleteAccountDialogView
        open
        state={{ confirmation, isSubmitting: false, errors: {} }}
        onConfirmationChange={setConfirmation}
        onDelete={onDelete}
      />
    </MosaicProvider>
  );
}

describe('UserProfileDeleteAccountDialogView', () => {
  it('renders an accessible destructive confirmation', () => {
    render(<Harness />);

    expect(screen.getByRole('alertdialog', { name: 'Delete account' })).toHaveAccessibleDescription(
      'Are you sure you want to delete your account? Some associated data may be retained. To request full data deletion, please contact support.',
    );
    expect(screen.getByLabelText('Type “Delete account” below to continue')).toHaveAttribute(
      'placeholder',
      'Delete account',
    );
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeDisabled();
  });

  it('requires the exact confirmation before deleting', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<Harness onDelete={onDelete} />);

    const input = screen.getByLabelText('Type “Delete account” below to continue');
    await user.type(input, 'delete account{Enter}');
    expect(onDelete).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, 'Delete account{Enter}');
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('renders an unattributed form error', () => {
    render(
      <MosaicProvider>
        <UserProfileDeleteAccountDialogView
          open
          state={{
            confirmation: 'Delete account',
            isSubmitting: false,
            errors: { form: 'Something went wrong. Please try again.' },
          }}
          onConfirmationChange={vi.fn()}
          onDelete={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
  });

  it('announces a pending deletion without changing the button label', () => {
    render(
      <MosaicProvider>
        <UserProfileDeleteAccountDialogView
          open
          state={{ confirmation: 'Delete account', isSubmitting: true, errors: {} }}
          onConfirmationChange={vi.fn()}
          onDelete={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('button', { name: 'Delete account' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar', { name: 'Deleting account' })).toBeInTheDocument();
  });
});
