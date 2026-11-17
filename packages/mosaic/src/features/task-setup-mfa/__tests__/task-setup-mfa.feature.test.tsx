import type { UserJSON } from '@clerk/shared/types';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { type FakeFapiState, serveFapi, VERIFICATION_CODE } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiPhoneNumber,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { mfaEnvironment } from '../../user-profile/user-profile-mfa-section/__tests__/mfa-feature-setup';
import { TaskSetupMFA } from '../task-setup-mfa';

const email = fapiEmailAddress({ id: 'email_1', email_address: 'alice@example.com' });
const verifiedPhone = fapiPhoneNumber({
  id: 'phone_1',
  phone_number: '+15555550101',
  verification: fapiVerification('phone_code', { status: 'verified' }),
});

function alice(overrides: Partial<UserJSON> = {}) {
  return fapiUser({ id: 'user_1', email_addresses: [email], ...overrides });
}

function pendingSession(
  user: UserJSON,
  tasks: { key: 'setup-mfa' | 'choose-organization' }[] = [{ key: 'setup-mfa' }],
) {
  return fapiSession({ id: 'sess_1', user, status: 'pending', tasks });
}

function smsOnlyEnvironment() {
  const environment = mfaEnvironment();
  environment.user_settings.attributes.authenticator_app.used_for_second_factor = false;
  environment.user_settings.attributes.authenticator_app.second_factors = [];
  return environment;
}

function authenticatorOnlyEnvironment() {
  const environment = mfaEnvironment();
  environment.user_settings.attributes.phone_number.used_for_second_factor = false;
  environment.user_settings.attributes.phone_number.second_factors = [];
  return environment;
}

async function renderTask({
  user = alice(),
  environment = mfaEnvironment(),
  session = pendingSession(user),
}: {
  user?: UserJSON;
  environment?: ReturnType<typeof mfaEnvironment>;
  session?: ReturnType<typeof fapiSession>;
} = {}) {
  const fapi = serveFapi({ environment, client: fapiClient([session]) });
  const rendered = await renderWithClerk(<TaskSetupMFA redirectUrlComplete='/dashboard' />);
  return { fapi, ...rendered };
}

function resolveTask(fapi: FakeFapiState) {
  fapi.client = {
    ...fapi.client,
    sessions: fapi.client.sessions.map(session => ({ ...session, status: 'active', tasks: null })),
  };
}

describe('TaskSetupMFA', () => {
  it('offers each method the instance uses for a second factor', async () => {
    await renderTask();

    expect(await screen.findByRole('heading', { name: 'Set up two-step verification' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Authenticator app/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /SMS code/ })).toBeVisible();
    expect(screen.getByText('Signed in as alice@example.com')).toBeVisible();
  });

  it('sets up an authenticator app, shows the backup codes, and continues once the task is done', async () => {
    const { fapi, navigate } = await renderTask();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /Authenticator app/ }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    resolveTask(fapi);
    await user.type(code, '123456');

    expect(await screen.findByRole('heading', { name: 'Authenticator app verification enabled' })).toBeVisible();
    const codes = screen.getByRole('list', { name: 'Backup codes' });
    expect(within(codes).getAllByRole('listitem')).toHaveLength(10);
    expect(within(codes).getByText('CODE0001')).toBeVisible();
    expect(fapi.mfa.totpAttempts).toEqual(['123456']);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'));
  });

  it('keeps the same authenticator secret after going back to the methods', async () => {
    const { fapi } = await renderTask();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /Authenticator app/ }));
    await screen.findByRole('textbox', { name: 'Verification code' });
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await user.click(await screen.findByRole('button', { name: /Authenticator app/ }));

    expect(await screen.findByRole('textbox', { name: 'Verification code' })).toBeVisible();
    expect(fapi.mfa.totpCreations).toBe(1);
  });

  it('shows an incorrect authenticator code and accepts a retry', async () => {
    await renderTask();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /Authenticator app/ }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await user.type(code, '000000');
    expect(await screen.findByText('Incorrect code')).toBeVisible();

    await user.clear(code);
    await user.type(code, '123456');
    expect(await screen.findByRole('heading', { name: 'Authenticator app verification enabled' })).toBeVisible();
  });

  it('opens on the authenticator app when it is the only method', async () => {
    const { fapi } = await renderTask({ environment: authenticatorOnlyEnvironment() });

    expect(await screen.findByRole('textbox', { name: 'Verification code' })).toBeVisible();
    expect(fapi.mfa.totpCreations).toBe(1);
  });

  it('opens on SMS when it is the only method, and reserves a verified phone', async () => {
    const { fapi } = await renderTask({
      user: alice({ phone_numbers: [verifiedPhone] }),
      environment: smsOnlyEnvironment(),
    });
    const user = userEvent.setup();

    expect(await screen.findByRole('combobox', { name: /Phone number/ })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('heading', { name: 'SMS code verification enabled' })).toBeVisible();
    expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_1', reserved: true, default: undefined });
  });

  it('adds and verifies a new phone number', async () => {
    const { fapi } = await renderTask({ environment: smsOnlyEnvironment() });
    const user = userEvent.setup();

    await user.type(await screen.findByRole('textbox', { name: 'Phone' }), '5555550123');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), VERIFICATION_CODE);

    expect(await screen.findByRole('heading', { name: 'SMS code verification enabled' })).toBeVisible();
    expect(fapi.mfa.phoneCreations).toEqual(['+15555550123']);
    expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_1', reserved: true, default: undefined });
  });

  it('does not offer the primary phone when it is the only way to sign in', async () => {
    await renderTask({
      user: fapiUser({ id: 'user_1', phone_numbers: [verifiedPhone], primary_phone_number_id: 'phone_1' }),
      environment: smsOnlyEnvironment(),
    });

    expect(await screen.findByRole('textbox', { name: 'Phone' })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: /Phone number/ })).toBeNull();
  });

  it('leaves for redirectUrlComplete when the session has no setup-mfa task', async () => {
    const user = alice();
    const { navigate } = await renderTask({ session: fapiSession({ id: 'sess_1', user }) });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'));
    expect(screen.queryByRole('heading', { name: 'Set up two-step verification' })).toBeNull();
  });

  it('signs out from the footer', async () => {
    const { fapi, navigate } = await renderTask();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
    expect(fapi.client.sessions).toEqual([]);
  });
});
