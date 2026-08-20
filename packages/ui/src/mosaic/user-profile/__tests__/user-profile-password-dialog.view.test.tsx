import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfilePasswordMode, UserProfilePasswordValues } from '../user-profile-password-dialog.view';
import { UserProfilePasswordDialogView } from '../user-profile-password-dialog.view';

const emptyValues: UserProfilePasswordValues = {
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

function Harness({
  onSubmit = vi.fn(),
  mode = 'change',
  isSubmitting = false,
}: {
  onSubmit?: (values: UserProfilePasswordValues) => void;
  mode?: UserProfilePasswordMode;
  isSubmitting?: boolean;
}) {
  const [values, setValues] = useState(emptyValues);
  const canSubmit = Boolean(values.newPassword) && values.newPassword === values.confirmPassword;

  return (
    <MosaicProvider>
      <UserProfilePasswordDialogView
        open
        state={{ mode, values, isSubmitting, errors: {} }}
        canSubmit={canSubmit}
        onValueChange={(field, value) => setValues(current => ({ ...current, [field]: value }))}
        onSubmit={onSubmit}
      />
    </MosaicProvider>
  );
}

describe('UserProfilePasswordDialogView', () => {
  it('renders an accessible password form', () => {
    render(<Harness />);

    const dialog = screen.getByRole('dialog', { name: 'Change password' });
    expect(dialog).toHaveClass('cl-dialog-popup', 'cl-card-root');
    expect(dialog).not.toHaveTextContent('Secured by');
    expect(screen.getByRole('heading', { name: 'Change password' }).closest('.cl-card-header')).not.toBeNull();
    expect(screen.getByLabelText('New password').closest('.cl-card-content')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Change password' }).closest('.cl-card-footer')).not.toBeNull();
    expect(screen.getByLabelText('New password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('Confirm password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByRole('checkbox', { name: 'Sign out of all other devices' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Sign out of all other devices' })).toHaveAccessibleDescription(
      'It is recommended to sign out of all other devices which may have used your old password.',
    );
    expect(screen.queryByLabelText('Current password')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change password' })).toBeDisabled();
  });

  it('submits the controlled password values with Enter', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Harness onSubmit={onSubmit} />);

    await user.click(screen.getByRole('checkbox', { name: 'Sign out of all other devices' }));
    await user.type(screen.getByLabelText('New password'), 'correct-horse');
    await user.type(screen.getByLabelText('Confirm password'), 'correct-horse{Enter}');

    expect(onSubmit).toHaveBeenCalledWith({
      newPassword: 'correct-horse',
      confirmPassword: 'correct-horse',
      signOutOfOtherSessions: false,
    });
  });

  it('renders the set-password flow without a current password', () => {
    render(<Harness mode='set' />);

    expect(screen.getByRole('dialog', { name: 'Set password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set password' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Current password')).not.toBeInTheDocument();
  });

  it('announces a pending password submission without changing the button label', () => {
    render(<Harness isSubmitting />);

    expect(screen.getByRole('button', { name: 'Change password' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar', { name: 'Changing password' })).toBeInTheDocument();
  });

  it('associates field errors with their inputs', () => {
    render(
      <MosaicProvider>
        <UserProfilePasswordDialogView
          open
          state={{
            mode: 'change',
            values: emptyValues,
            isSubmitting: false,
            errors: { confirmPassword: 'Passwords do not match.' },
          }}
          onValueChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByLabelText('Confirm password')).toHaveAccessibleDescription('Passwords do not match.');
    expect(screen.getByLabelText('Confirm password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders an unattributed form error', () => {
    render(
      <MosaicProvider>
        <UserProfilePasswordDialogView
          open
          state={{
            mode: 'change',
            values: emptyValues,
            isSubmitting: false,
            errors: { form: 'Something went wrong. Please try again.' },
          }}
          onValueChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
  });

  it('renders enterprise-managed passwords as read-only', () => {
    render(
      <MosaicProvider>
        <UserProfilePasswordDialogView
          open
          state={{ mode: 'change', values: emptyValues, isReadOnly: true, isSubmitting: false, errors: {} }}
          canSubmit
          onValueChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByText('Your password is managed by your enterprise connection.')).toBeInTheDocument();
    expect(screen.getByLabelText('New password')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Change password' })).not.toBeInTheDocument();
  });
});
