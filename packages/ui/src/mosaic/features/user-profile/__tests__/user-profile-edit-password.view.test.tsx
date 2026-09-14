import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../../components/button';
import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileEditPasswordViewProps } from '../user-profile-password-section/user-profile-edit-password.view';
import { UserProfileEditPasswordView } from '../user-profile-password-section/user-profile-edit-password.view';

function renderView(overrides: Partial<UserProfileEditPasswordViewProps> = {}) {
  const props: UserProfileEditPasswordViewProps = {
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
        <UserProfileEditPasswordView {...props} />
      </MosaicProvider>,
    ),
  };
}

const currentPasswordField = () => screen.getByLabelText('Current password');
const newPasswordField = () => screen.getByLabelText('New password');
const confirmPasswordField = () => screen.getByLabelText('Confirm password');
const signOutCheckbox = () => screen.getByRole('checkbox', { name: 'Sign out of all other devices' });
const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('UserProfileEditPasswordView', () => {
  it('renders nothing until the caller opens it', () => {
    renderView({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

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
    const newPasswordGroup = newPasswordField().closest('.cl-input-group') as HTMLElement;

    await user.click(within(newPasswordGroup).getByRole('button', { name: 'Show password' }));

    expect(newPasswordField()).toHaveAttribute('type', 'text');
    expect(newPasswordField()).toHaveValue('new-secret-123');
    expect(currentPasswordField()).toHaveAttribute('type', 'password');
    expect(confirmPasswordField()).toHaveAttribute('type', 'password');

    await user.click(within(newPasswordGroup).getByRole('button', { name: 'Hide password' }));

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

  it('asks to open from the trigger', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderView({ open: false, onOpenChange, trigger: <Button>Change password</Button> });

    await user.click(screen.getByRole('button', { name: 'Change password' }));

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('reports each keystroke to its own field, holding nothing itself', async () => {
    const onCurrentPasswordChange = vi.fn();
    const onNewPasswordChange = vi.fn();
    const onConfirmPasswordChange = vi.fn();
    const onSignOutOfOtherSessionsChange = vi.fn();
    const user = userEvent.setup();
    renderView({
      onCurrentPasswordChange,
      onNewPasswordChange,
      onConfirmPasswordChange,
      onSignOutOfOtherSessionsChange,
    });

    await user.type(currentPasswordField(), 'a');
    await user.type(newPasswordField(), 'b');
    await user.type(confirmPasswordField(), 'c');
    await user.click(signOutCheckbox());

    expect(onCurrentPasswordChange).toHaveBeenCalledWith('a');
    expect(onNewPasswordChange).toHaveBeenCalledWith('b');
    expect(onConfirmPasswordChange).toHaveBeenCalledWith('c');
    expect(onSignOutOfOtherSessionsChange).toHaveBeenCalledWith(false);
    expect(newPasswordField()).toHaveValue('');
    expect(signOutCheckbox()).toBeChecked();
  });

  it('submits from the action once every field is filled', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderView({ currentPassword: 'old', newPassword: 'new-secret-123', confirmPassword: 'new-secret-123', onSubmit });

    await user.click(saveButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('lets the browser hold an empty required field back', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderView({ onSubmit });

    expect(currentPasswordField()).toBeRequired();
    expect(newPasswordField()).toBeRequired();
    expect(confirmPasswordField()).toBeRequired();
    await user.click(saveButton());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('asks to close from cancel', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onOpenChange });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('announces the failure in a negative banner', () => {
    renderView({ error: { message: 'Your password could not be updated.' } });

    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('data-color', 'negative');
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

  it('explains itself and offers only cancel while an enterprise account is active', async () => {
    const onSubmit = vi.fn();
    const onConfirmPasswordChange = vi.fn();
    const user = userEvent.setup();
    renderView({ hasActiveEnterpriseAccount: true, onSubmit, onConfirmPasswordChange });

    expect(
      screen.getByText(
        'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(currentPasswordField()).toBeDisabled();
    expect(newPasswordField()).toBeDisabled();
    expect(confirmPasswordField()).toBeDisabled();
    expect(signOutCheckbox()).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

    await user.type(confirmPasswordField(), 'abc');
    expect(onConfirmPasswordChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
