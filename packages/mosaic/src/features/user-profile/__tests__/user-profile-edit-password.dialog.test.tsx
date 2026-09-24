import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { FormField, UseFormResult } from '../../../components/form';
import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileEditPasswordDialogProps } from '../user-profile-password-section/user-profile-edit-password.dialog';
import { UserProfileEditPasswordDialog } from '../user-profile-password-section/user-profile-edit-password.dialog';
import type { UserProfileEditPasswordValues } from '../user-profile-password-section/user-profile-password-section.types';

type Form = UseFormResult<UserProfileEditPasswordValues>;

const untouched: FormField = { feedback: undefined, isValidating: false, touched: false, isDirty: false };

function stubForm(overrides: Partial<Form> = {}): Form {
  const form: Form = {
    id: 'edit-password',
    values: { currentPassword: '', newPassword: '', confirmPassword: '', signOutOfOtherSessions: true },
    fields: {
      currentPassword: untouched,
      newPassword: untouched,
      confirmPassword: untouched,
      signOutOfOtherSessions: untouched,
    },
    error: undefined,
    isSubmitting: false,
    isDirty: false,
    canSubmit: true,
    register: name => ({
      name,
      value: form.values[name],
      onChange: event => form.setValue(name, event.target.value),
      onBlur: () => form.touch(name),
      ref: () => undefined,
    }),
    setValue: vi.fn(),
    touch: vi.fn(),
    submit: vi.fn(),
    handleSubmit: vi.fn((event: { preventDefault: () => void }) => event.preventDefault()),
    reset: vi.fn(),
    ...overrides,
  };
  return form;
}

function renderView(overrides: Partial<UserProfileEditPasswordDialogProps> = {}, form: Partial<Form> = {}) {
  const props: UserProfileEditPasswordDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    hasPassword: true,
    requiresCurrentPassword: true,
    form: stubForm(form),
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
    renderView(
      {},
      { values: { currentPassword: 'old', newPassword: 'new', confirmPassword: 'new', signOutOfOtherSessions: true } },
    );

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

  it('writes typing and leaving a field back to the form by name', async () => {
    const user = userEvent.setup();
    const { props } = renderView();

    await user.type(newPasswordField(), 'a');
    await user.tab();
    await user.click(signOutCheckbox());

    expect(props.form.setValue).toHaveBeenCalledWith('newPassword', 'a');
    expect(props.form.touch).toHaveBeenCalledWith('newPassword');
    expect(props.form.setValue).toHaveBeenCalledWith('signOutOfOtherSessions', false);
  });

  it('reveals a password from its own eye toggle and hides it again', async () => {
    const user = userEvent.setup();
    renderView(
      {},
      {
        values: {
          currentPassword: '',
          newPassword: 'new-secret-123',
          confirmPassword: '',
          signOutOfOtherSessions: true,
        },
      },
    );
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
    renderView({}, { error: 'Your password could not be updated.' });

    const banner = screen.getByRole('alert');
    expect(banner).toHaveTextContent('Your password could not be updated.');
    expect(newPasswordField()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('renders field errors under their controls with no banner', () => {
    const errored = (message: string): FormField => ({
      feedback: { type: 'error', message },
      isValidating: false,
      touched: true,
    });
    renderView(
      {},
      {
        fields: {
          currentPassword: errored('Incorrect password.'),
          newPassword: errored('Your password must contain 8 or more characters.'),
          confirmPassword: errored("Passwords don't match."),
          signOutOfOtherSessions: untouched,
        },
      },
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(currentPasswordField()).toHaveAttribute('aria-invalid', 'true');
    expect(currentPasswordField()).toHaveAccessibleDescription('Incorrect password.');
    expect(newPasswordField()).toHaveAttribute('aria-invalid', 'true');
    expect(newPasswordField()).toHaveAccessibleDescription('Your password must contain 8 or more characters.');
    expect(confirmPasswordField()).toHaveAttribute('aria-invalid', 'true');
    expect(confirmPasswordField()).toHaveAccessibleDescription("Passwords don't match.");
  });

  it('withholds the save while the form says it cannot submit', async () => {
    const user = userEvent.setup();
    const { props } = renderView({}, { canSubmit: false });

    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
    await user.click(saveButton());

    expect(props.form.handleSubmit).not.toHaveBeenCalled();
  });

  it('submits the form from the save button once every required field is filled', async () => {
    const user = userEvent.setup();
    const { props } = renderView(
      {},
      {
        values: {
          currentPassword: 'old-secret',
          newPassword: 'new-secret-123',
          confirmPassword: 'new-secret-123',
          signOutOfOtherSessions: true,
        },
      },
    );

    await user.click(saveButton());

    expect(props.form.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('stays inert while the save runs', async () => {
    const user = userEvent.setup();
    const { props } = renderView({}, { isSubmitting: true });

    await user.type(newPasswordField(), 'abc');

    expect(currentPasswordField()).toBeDisabled();
    expect(newPasswordField()).toBeDisabled();
    expect(confirmPasswordField()).toBeDisabled();
    expect(signOutCheckbox()).toBeDisabled();
    screen.getAllByRole('button', { name: 'Show password' }).forEach(toggle => expect(toggle).toBeDisabled());
    expect(props.form.setValue).not.toHaveBeenCalled();
    expect(saveButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(saveButton());
    expect(props.form.handleSubmit).not.toHaveBeenCalled();
  });
});
