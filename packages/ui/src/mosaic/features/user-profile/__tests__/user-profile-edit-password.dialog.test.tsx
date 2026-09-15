import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileEditPasswordDialogProps } from '../user-profile-password-section/user-profile-edit-password.dialog';
import { UserProfileEditPasswordDialog } from '../user-profile-password-section/user-profile-edit-password.dialog';

function renderView(overrides: Partial<UserProfileEditPasswordDialogProps> = {}) {
  const props: UserProfileEditPasswordDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    hasPassword: true,
    requiresCurrentPassword: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    signOutOfOtherSessions: true,
    onCurrentPasswordChange: vi.fn(),
    onNewPasswordChange: vi.fn(),
    onConfirmPasswordChange: vi.fn(),
    onSignOutOfOtherSessionsChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileEditPasswordDialog {...props} />
      </MosaicProvider>,
    ),
  };
}

const currentPasswordField = () => screen.getByLabelText('Current password');
const newPasswordField = () => screen.getByLabelText('New password');
const confirmPasswordField = () => screen.getByLabelText('Confirm password');
const signOutCheckbox = () => screen.getByRole('checkbox', { name: 'Sign out of all other devices' });
const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('UserProfileEditPasswordDialog', () => {
  it('names the dialog for a change and masks every field', () => {
    renderView({ currentPassword: 'old', newPassword: 'new', confirmPassword: 'new' });

    expect(screen.getByRole('dialog', { name: 'Change password' })).toBeInTheDocument();
    expect(currentPasswordField()).toHaveAttribute('type', 'password');
    expect(currentPasswordField()).toHaveValue('old');
    expect(newPasswordField()).toHaveAttribute('type', 'password');
    expect(newPasswordField()).toHaveAttribute('autocomplete', 'new-password');
    expect(confirmPasswordField()).toHaveAttribute('type', 'password');
    expect(signOutCheckbox()).toBeChecked();
    expect(signOutCheckbox()).toHaveAccessibleDescription(
      'It is recommended to sign out of all other devices which may have used your old password.',
    );
  });

  it('reveals a password from its own eye toggle and hides it again', async () => {
    const user = userEvent.setup();
    renderView({ newPassword: 'new-secret-123' });
    const [, newPasswordToggle] = screen.getAllByRole('button', { name: 'Show password' });
    if (!newPasswordToggle) {
      throw new Error('New password visibility toggle is missing');
    }

    await user.click(newPasswordToggle);

    expect(newPasswordField()).toHaveAttribute('type', 'text');
    expect(newPasswordField()).toHaveValue('new-secret-123');
    expect(currentPasswordField()).toHaveAttribute('type', 'password');
    expect(confirmPasswordField()).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));

    expect(newPasswordField()).toHaveAttribute('type', 'password');
  });

  it('names the dialog for a first password and skips the current one', () => {
    renderView({ hasPassword: false });

    expect(screen.getByRole('dialog', { name: 'Set password' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Current password')).not.toBeInTheDocument();
  });

  it('skips the current password when reverification stands in for it', async () => {
    renderView({ requiresCurrentPassword: false });

    expect(screen.queryByLabelText('Current password')).not.toBeInTheDocument();
    await waitFor(() => expect(newPasswordField()).toHaveFocus());
  });

  it('opens on the current password rather than the corner dismiss', async () => {
    renderView();

    await waitFor(() => expect(currentPasswordField()).toHaveFocus());
  });

  it('announces the failure in a negative banner', () => {
    renderView({ error: { message: 'Your password could not be updated.' } });

    const banner = screen.getByRole('alert');
    expect(banner).toHaveTextContent('Your password could not be updated.');
    expect(newPasswordField()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('renders field-scoped failures under their controls with no banner', () => {
    renderView({
      error: {
        fields: {
          currentPassword: 'Incorrect password.',
          newPassword: 'Your password must contain 8 or more characters.',
          confirmPassword: "Passwords don't match.",
        },
      },
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(currentPasswordField()).toHaveAttribute('aria-invalid', 'true');
    expect(currentPasswordField()).toHaveAccessibleDescription('Incorrect password.');
    expect(newPasswordField()).toHaveAttribute('aria-invalid', 'true');
    expect(newPasswordField()).toHaveAccessibleDescription('Your password must contain 8 or more characters.');
    expect(confirmPasswordField()).toHaveAttribute('aria-invalid', 'true');
    expect(confirmPasswordField()).toHaveAccessibleDescription("Passwords don't match.");
  });

  it('withholds the save while the caller says the value is unacceptable', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderView({
      canSave: false,
      currentPassword: 'old',
      newPassword: 'new-secret-123',
      confirmPassword: 'new-secret-123',
      onSubmit,
    });

    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
    await user.click(saveButton());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('stays inert while the save runs', async () => {
    const onSubmit = vi.fn();
    const onNewPasswordChange = vi.fn();
    const user = userEvent.setup();
    renderView({ isSaving: true, onSubmit, onNewPasswordChange });

    await user.type(newPasswordField(), 'abc');

    expect(currentPasswordField()).toBeDisabled();
    expect(newPasswordField()).toBeDisabled();
    expect(confirmPasswordField()).toBeDisabled();
    expect(signOutCheckbox()).toBeDisabled();
    screen.getAllByRole('button', { name: 'Show password' }).forEach(toggle => expect(toggle).toBeDisabled());
    expect(onNewPasswordChange).not.toHaveBeenCalled();
    expect(saveButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(saveButton());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
