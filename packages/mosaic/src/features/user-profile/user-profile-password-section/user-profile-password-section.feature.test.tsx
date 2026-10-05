import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfilePasswordSection } from './user-profile-password-section';

const email = fapiEmailAddress({ id: 'idn_1', email_address: 'person@example.com' });
const alice = fapiUser({ id: 'user_1', email_addresses: [email] });

async function renderPassword(user = alice, environment = fapiEnvironment()) {
  const fapi = serveFapi({ environment, client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
  await renderWithClerk(<UserProfilePasswordSection />);
  return fapi;
}

async function fillPassword() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Change password' }));
  await user.type(screen.getByLabelText('Current password'), 'old-secret');
  await user.type(screen.getByLabelText('New password'), 'new-password-123');
  await user.type(screen.getByLabelText('Confirm password'), 'new-password-123');
  return user;
}

describe('Changing a password', () => {
  it.each(['sign out', 'switch user', 'switch session'] as const)(
    'discards the password draft after %s',
    async change => {
      const fapi = serveFapi({
        client: fapiClient([
          fapiSession({ id: 'sess_1', user: alice }),
          fapiSession({ id: 'sess_2', user: change === 'switch user' ? fapiUser({ id: 'user_2' }) : alice }),
        ]),
      });
      const { clerk } = await renderWithClerk(<UserProfilePasswordSection />);
      const user = await fillPassword();

      await act(() => (change === 'sign out' ? clerk.signOut() : clerk.setActive({ session: 'sess_2' })));

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(fapi.passwordUpdates).toHaveLength(0);
      if (change === 'sign out') {
        expect(screen.queryByText('Password')).toBeNull();
      } else {
        expect(clerk.session?.id).toBe('sess_2');
        await user.click(screen.getByRole('button', { name: 'Change password' }));
        expect(screen.getByLabelText('Current password')).toHaveValue('');
        expect(screen.getByLabelText('New password')).toHaveValue('');
        expect(screen.getByLabelText('Confirm password')).toHaveValue('');
      }
    },
  );

  it.each(['password mode', 'enterprise management'] as const)(
    'rejects saving an open dialog after the %s changes',
    async change => {
      const fapi = serveFapi({
        client: fapiClient([
          fapiSession({
            id: 'sess_1',
            user: fapiUser({
              ...alice,
              enterprise_accounts: [fapiEnterpriseAccount({ id: 'ent_1', active: false })],
            }),
          }),
        ]),
      });
      const { clerk } = await renderWithClerk(<UserProfilePasswordSection />);
      const user = await fillPassword();
      const dialog = screen.getByRole('dialog');
      const currentUser = clerk.user;
      const account = currentUser?.enterpriseAccounts[0];
      if (!currentUser || !account) {
        throw new Error('Expected a signed-in user with an enterprise account');
      }
      if (change === 'password mode') {
        currentUser.passwordEnabled = false;
      } else {
        account.active = true;
      }
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Password update is no longer available.'),
      );
      expect(screen.getByRole('dialog')).toBe(dialog);
      expect(screen.getByLabelText('New password')).toHaveValue('new-password-123');
      expect(fapi.passwordUpdates).toHaveLength(0);
    },
  );

  it('shows an unexpected update failure in the dialog and keeps the draft', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    const { clerk } = await renderWithClerk(<UserProfilePasswordSection />);
    if (!clerk.user) {
      throw new Error('Expected a signed-in user');
    }
    const update = vi.spyOn(clerk.user, 'updatePassword').mockRejectedValue(new Error('Connection interrupted'));
    try {
      const user = await fillPassword();
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Connection interrupted'));
      expect(screen.getByLabelText('Current password')).toHaveValue('old-secret');
      expect(screen.getByLabelText('New password')).toHaveValue('new-password-123');
      expect(screen.getByLabelText('Confirm password')).toHaveValue('new-password-123');
    } finally {
      update.mockRestore();
    }
  });

  it('shows feedback when the password strength checker cannot load', async () => {
    const environment = fapiEnvironment();
    environment.user_settings.password_settings.show_zxcvbn = true;
    serveFapi({ environment, client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    const { clerk } = await renderWithClerk(<UserProfilePasswordSection />);
    const modules = clerk.__internal_moduleManager;
    if (!modules) {
      throw new Error('Expected a module manager');
    }
    const load = vi.spyOn(modules, 'import').mockRejectedValue(new Error('Failed to load password strength checker'));
    try {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Change password' }));
      await user.type(screen.getByLabelText('New password'), 'new-password-123');

      await waitFor(() =>
        expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
          'Something went wrong. Please try again.',
        ),
      );
    } finally {
      load.mockRestore();
    }
  });

  it('sends the update to Clerk and closes after it succeeds', async () => {
    const fapi = await renderPassword();
    const user = await fillPassword();
    await user.click(screen.getByRole('checkbox', { name: 'Sign out of all other devices' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.passwordUpdates[0]?.get('current_password')).toBe('old-secret');
    expect(fapi.passwordUpdates[0]?.get('new_password')).toBe('new-password-123');
    expect(fapi.passwordUpdates[0]?.get('sign_out_of_other_sessions')).toBe('false');
  });

  it('stays busy until the update finishes and prevents duplicate saves', async () => {
    await renderPassword();
    const user = await fillPassword();
    const update = holdRequests('post', '/v1/me/change_password');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(update.requests).toHaveLength(1));
    expect(screen.getByLabelText('New password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Enter}');
    expect(update.requests).toHaveLength(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    update.release();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('shows a direct API error and keeps the draft without retrying automatically', async () => {
    const fapi = await renderPassword();
    const user = await fillPassword();
    const update = holdRequests('post', '/v1/me/change_password');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(update.requests).toHaveLength(1));
    update.fail('session_reverification_required');

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('session_reverification_required'));
    expect(screen.getByLabelText('New password')).toHaveValue('new-password-123');
    expect(screen.queryByText('Verification required')).toBeNull();
    expect(update.requests).toHaveLength(1);
    serveFapi(fapi);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.passwordUpdates).toHaveLength(1);
  });

  it('shows a password error at the field and keeps the draft', async () => {
    await renderPassword();
    const user = await fillPassword();
    const update = holdRequests('post', '/v1/me/change_password');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(update.requests).toHaveLength(1));
    update.fail('form_password_pwned', undefined, 'new_password');

    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'This password has been found as part of a breach and can not be used, please try another password instead.',
      ),
    );
    expect(screen.getByLabelText('Confirm password')).toHaveValue('new-password-123');
    expect(screen.getByRole('alert').textContent).toBe('');
  });

  it('shows an incorrect current password error at the field and keeps the draft', async () => {
    await renderPassword();
    const user = await fillPassword();
    const update = holdRequests('post', '/v1/me/change_password');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(update.requests).toHaveLength(1));
    update.fail('form_password_incorrect', undefined, 'current_password');

    await waitFor(() =>
      expect(screen.getByLabelText('Current password')).toHaveAccessibleDescription(
        'Your current password is incorrect.',
      ),
    );
    expect(screen.getByLabelText('Current password')).toHaveValue('old-secret');
    expect(screen.getByLabelText('New password')).toHaveValue('new-password-123');
    expect(screen.getByLabelText('Confirm password')).toHaveValue('new-password-123');
    expect(screen.getByRole('alert').textContent).toBe('');
  });

  it('sets a first password without asking for the current one', async () => {
    const fapi = await renderPassword(fapiUser({ ...alice, password_enabled: false }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Set password' }));
    expect(screen.queryByLabelText('Current password')).toBeNull();
    await user.type(screen.getByLabelText('New password'), 'new-password-123');
    await user.type(screen.getByLabelText('Confirm password'), 'new-password-123');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.passwordUpdates[0]?.has('current_password')).toBe(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Change password' })).toBeInTheDocument());
  });

  it('hides the section when instance passwords are disabled', async () => {
    const environment = fapiEnvironment();
    environment.user_settings.attributes.password.enabled = false;
    await renderPassword(alice, environment);

    expect(screen.queryByRole('button', { name: 'Change password' })).toBeNull();
  });

  it.each([true, false])('shows the managed view when passwordEnabled is %s', async passwordEnabled => {
    await renderPassword(
      fapiUser({
        ...alice,
        password_enabled: passwordEnabled,
        enterprise_accounts: [
          fapiEnterpriseAccount({ id: 'inactive', active: false, enterprise_connection: null }),
          fapiEnterpriseAccount({ id: 'ent_1' }),
        ],
      }),
    );

    expect(screen.getByText(/Managed by|Your password can currently/)).toHaveTextContent('Managed by Company SSO');
    if (!passwordEnabled) {
      expect(screen.getByText('No password set')).toBeVisible();
    }
    expect(screen.queryByRole('button', { name: 'Change password' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Set password' })).toBeNull();
  });

  it('keeps the managed view when connection details are unavailable', async () => {
    await renderPassword(
      fapiUser({
        ...alice,
        enterprise_accounts: [fapiEnterpriseAccount({ id: 'ent_1', enterprise_connection: null })],
      }),
    );

    expect(screen.getByText('Managed by your enterprise connection')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change password' })).toBeNull();
  });

  it('shows the generic provider label when the enterprise connection name is blank', async () => {
    const account = fapiEnterpriseAccount({ id: 'ent_1' });
    if (!account.enterprise_connection) {
      throw new Error('Expected an enterprise connection');
    }
    account.enterprise_connection.name = '';
    await renderPassword(fapiUser({ ...alice, enterprise_accounts: [account] }));

    expect(screen.getByText('Managed by your enterprise connection')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change password' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Set password' })).toBeNull();
  });

  it('focuses the current password and clears the draft after cancellation', async () => {
    await renderPassword();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    await waitFor(() => expect(screen.getByLabelText('Current password')).toHaveFocus());
    await user.type(screen.getByLabelText('New password'), 'draft-secret');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await user.click(screen.getByRole('button', { name: 'Change password' }));
    expect(screen.getByLabelText('New password')).toHaveValue('');
    await waitFor(() => expect(screen.getByLabelText('Current password')).toHaveFocus());
  });

  it('keeps a confirmation mismatch visible after its field is cleared', async () => {
    await renderPassword();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    await waitFor(() => expect(screen.getByLabelText('Current password')).toHaveFocus());
    await user.type(screen.getByLabelText('New password'), 'new-password-123');
    await user.type(screen.getByLabelText('Confirm password'), 'new-password-12');
    await user.click(screen.getByLabelText('New password'));
    await waitFor(() =>
      expect(screen.getByLabelText('Confirm password')).toHaveAccessibleDescription("Passwords don't match."),
    );
    await user.clear(screen.getByLabelText('Confirm password'));

    expect(screen.getByLabelText('New password')).toHaveValue('new-password-123');
    expect(screen.getByLabelText('Confirm password')).toHaveValue('');
    await waitFor(() =>
      expect(screen.getByLabelText('Confirm password')).toHaveAccessibleDescription("Passwords don't match."),
    );
    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('reveals and hides the current password on request', async () => {
    await renderPassword();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    const current = screen.getByLabelText('Current password');
    expect(current).toHaveAttribute('type', 'password');

    await user.click(screen.getAllByRole('button', { name: 'Show password' })[0]);
    expect(current).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(current).toHaveAttribute('type', 'password');
  });

  it('shows the password rule and leaves matching passwords eligible for a server check', async () => {
    const environment = fapiEnvironment();
    environment.user_settings.password_settings.min_length = 8;
    const fapi = await renderPassword(alice, environment);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    await user.type(screen.getByLabelText('Current password'), 'old-secret');
    await user.type(screen.getByLabelText('New password'), 'short');
    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Your password must contain 8 or more characters.',
      ),
    );
    await user.type(screen.getByLabelText('Confirm password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(fapi.passwordUpdates).toHaveLength(1));
    expect(fapi.passwordUpdates[0]?.get('new_password')).toBe('short');
  });

  it('shows the minimum length as an error after an empty new password is left', async () => {
    await renderPassword();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    await waitFor(() => expect(screen.getByLabelText('Current password')).toHaveFocus());
    await user.click(screen.getByLabelText('New password'));
    expect(screen.getByLabelText('New password')).not.toHaveAccessibleDescription(
      'Your password must contain 8 or more characters.',
    );

    await user.click(screen.getByLabelText('Confirm password'));

    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Your password must contain 8 or more characters.',
      ),
    );
    expect(screen.getByLabelText('New password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('lists the configured complexity requirements beside the new password', async () => {
    const environment = fapiEnvironment();
    environment.user_settings.password_settings.require_uppercase = true;
    environment.user_settings.password_settings.require_numbers = true;
    await renderPassword(alice, environment);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    await waitFor(() => expect(screen.getByLabelText('Current password')).toHaveFocus());
    await user.type(screen.getByLabelText('New password'), 'longpassword');

    await waitFor(
      () =>
        expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
          'Your password must contain a number and an uppercase letter.',
        ),
      { timeout: 2500 },
    );
  });

  it('advises a weak password without blocking a server check', async () => {
    const environment = fapiEnvironment();
    environment.user_settings.password_settings.show_zxcvbn = true;
    environment.user_settings.password_settings.min_zxcvbn_strength = 3;
    const fapi = await renderPassword(alice, environment);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    await user.type(screen.getByLabelText('Current password'), 'old-secret');
    await user.type(screen.getByLabelText('New password'), 'password123');
    await user.type(screen.getByLabelText('Confirm password'), 'password123');

    await waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(/Your password is not strong enough/),
    );
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(fapi.passwordUpdates).toHaveLength(1));
  });
});

describe('Deferred password behavior', () => {
  it.todo('reverifies the session and retries the password update when Clerk requires verification');
  it.todo('omits the current password when session reverification is enabled');
});
