import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { clerkApiError } from '../../../../__tests__/clerk-errors';
import {
  demandReverificationOnce,
  fapiUrl,
  holdRequests,
  serveFapi,
  VERIFICATION_CODE,
  worker,
} from '../../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiPhoneNumber, fapiSession, fapiUser } from '../../../../__tests__/feature/fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { MosaicProvider } from '../../../../mosaic-provider';
import { UserProfileMfaSection } from '../user-profile-mfa-section';
import { mfaEnvironment, phone, renderMfa } from './mfa-feature-setup';

describe('User profile MFA management', () => {
  it('updates an existing setup error when localization changes', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    const section = (message: string) => (
      <MosaicProvider localization={{ overrides: { 'errors.action_blocked': message } }}>
        <UserProfileMfaSection />
      </MosaicProvider>
    );
    const { rerender } = await renderWithClerk(section('First localized error'));
    worker.use(
      http.post(fapiUrl('/v1/me/totp'), () =>
        HttpResponse.json(
          { errors: [{ code: 'action_blocked', message: 'Server detail', long_message: 'Server detail' }] },
          { status: 403 },
        ),
      ),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('First localized error'));
    rerender(section('Updated localized error'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Updated localized error'));
  });

  it.each([
    {
      cause: clerkApiError('phone_number_not_verified', 'Unable to update the default method.'),
      message: 'Unable to update the default method.',
    },
    {
      cause: new Error('Cannot read properties of undefined'),
      message: 'Unable to set this method as default. Please try again.',
    },
    { cause: 'network failure', message: 'Unable to set this method as default. Please try again.' },
  ])('shows a safe default-change error for $message', async ({ cause, message }) => {
    const first = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const second = fapiPhoneNumber({
      ...phone,
      id: 'phone_2',
      phone_number: '+15555550202',
      reserved_for_second_factor: true,
    });
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', phone_numbers: [first, second] }) }),
      ]),
    });
    const { clerk } = await renderWithClerk(<UserProfileMfaSection />);
    const selectedPhone = clerk.user?.phoneNumbers.find(item => item.id === 'phone_2');
    if (!selectedPhone) {
      throw new Error('Expected the second phone');
    }
    vi.spyOn(selectedPhone, 'makeDefaultSecondFactor').mockRejectedValue(cause);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(message));
  });

  async function renderTwoSmsMethodsNeedingReverification() {
    const first = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const second = fapiPhoneNumber({
      ...phone,
      id: 'phone_2',
      phone_number: '+15555550202',
      reserved_for_second_factor: true,
    });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [first, second] }), mfaEnvironment(), {
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me/phone_numbers/phone_2');
    return fapi;
  }

  const secondManage = () => screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' });
  const defaultUpdates = (fapi: Awaited<ReturnType<typeof renderMfa>>) =>
    fapi.mfa.phoneUpdates.filter(update => update.default === true);

  it('verifies the session before changing the default method and returns focus to its menu', async () => {
    const fapi = await renderTwoSmsMethodsNeedingReverification();
    const user = userEvent.setup();

    await openMenu(user, await screen.findByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await user.keyboard('hunter2{Enter}');

    await waitFor(() => expect(defaultUpdates(fapi)).toEqual([{ id: 'phone_2', reserved: undefined, default: true }]));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(secondManage()).toHaveFocus());
  });

  it('lets the user cancel verification quietly and retry the default change', async () => {
    const fapi = await renderTwoSmsMethodsNeedingReverification();
    const user = userEvent.setup();

    await openMenu(user, await screen.findByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await screen.findByText('Enter your current password to continue');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(defaultUpdates(fapi)).toEqual([]);
    expect(screen.queryByRole('alert')).toBeNull();
    await waitFor(() => expect(secondManage()).toHaveFocus());

    await openMenu(user, secondManage());
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() => expect(defaultUpdates(fapi)).toEqual([{ id: 'phone_2', reserved: undefined, default: true }]));
  });

  it('keeps the verification dialog open while retrying and reports an ordinary retry error', async () => {
    const fapi = await renderTwoSmsMethodsNeedingReverification();
    const user = userEvent.setup();

    await openMenu(user, await screen.findByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await screen.findByText('Enter your current password to continue');
    const dialog = screen.getByRole('dialog');
    const replay = holdRequests('post', '/v1/me/phone_numbers/:id');
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await user.keyboard('hunter2{Enter}');
    await waitFor(() => expect(replay.requests).toHaveLength(1));

    expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
    await user.keyboard('{Escape}');
    expect(dialog).toBeVisible();

    replay.fail('action_blocked', 'Unable to update the default method.');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent("This action couldn't be completed."));
    expect(defaultUpdates(fapi)).toEqual([]);
  });

  it('waits for a verification factor before opening the default-change dialog', async () => {
    await renderTwoSmsMethodsNeedingReverification();
    const start = holdRequests('post', '/v1/client/sessions/:id/verify');
    const user = userEvent.setup();

    await openMenu(user, await screen.findByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() => expect(start.requests).toHaveLength(1));
    expect(screen.queryByRole('dialog')).toBeNull();

    start.release();
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
  });

  it('shows a safe message when authenticator setup throws an unexpected error', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    const { clerk } = await renderWithClerk(<UserProfileMfaSection />);
    if (!clerk.user) {
      throw new Error('Expected the signed-in user');
    }
    vi.spyOn(clerk.user, 'createTOTP').mockRejectedValue(new Error('Internal authenticator failure'));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'));
    expect(screen.queryByText('Internal authenticator failure')).toBeNull();
  });

  it('keeps localized Clerk errors when removing an authenticator fails', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', totp_enabled: true, two_factor_enabled: true }) }),
      ]),
    });
    await renderWithClerk(<UserProfileMfaSection />, undefined, {
      overrides: { 'errors.action_blocked': 'This authenticator must remain enabled.' },
    });
    worker.use(
      http.post(fapiUrl('/v1/me/totp'), ({ request }) =>
        new URL(request.url).searchParams.get('_method') === 'DELETE'
          ? HttpResponse.json(
              { errors: [{ code: 'action_blocked', message: 'Action blocked', long_message: 'Action blocked' }] },
              { status: 403 },
            )
          : undefined,
      ),
    );
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('This authenticator must remain enabled.'));
    expect(screen.getByText('Authenticator app')).toBeVisible();
  });

  it('verifies the session when removing an authenticator demands it, then removes it', async () => {
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, two_factor_enabled: true }),
      mfaEnvironment(),
      { verification: { secrets: { password: 'hunter2' } } },
    );
    demandReverificationOnce('/v1/me/totp');
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await user.type(screen.getByLabelText('Password'), 'hunter2{Enter}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.totp_enabled).toBe(false);
    expect(screen.queryByRole('button', { name: 'Manage Authenticator app' })).toBeNull();
  });

  it('removes SMS MFA while retaining the phone number', async () => {
    const reserved = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [reserved], two_factor_enabled: true }));
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0101' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    expect(screen.getByRole('alertdialog', { name: 'Remove SMS verification' })).toHaveAccessibleDescription(
      'You will no longer receive sign-in verification codes at +1 (555) 555-0101. The phone number will remain on your account.',
    );
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByText('+1 (555) 555-0101')).toBeNull());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add verification method' })).toHaveFocus());
    expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_1', reserved: false, default: undefined });
    expect(fapi.client.sessions[0]?.user.phone_numbers).toHaveLength(1);
  });

  it('keeps removal pending through dismissal and duplicate confirmation attempts', async () => {
    const reserved = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [reserved], two_factor_enabled: true }));
    const held = holdRequests('post', '/v1/me/phone_numbers/phone_1');
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0101' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    const dialog = screen.getByRole('alertdialog');
    const remove = within(dialog).getByRole('button', { name: 'Remove' });
    await user.click(remove);
    await waitFor(() => expect(held.requests).toHaveLength(1));
    try {
      await user.keyboard('{Escape}');
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      expect(dialog).toBeVisible();
      remove.click();
      expect(held.requests).toHaveLength(1);
      expect(fapi.mfa.phoneUpdates).toHaveLength(0);
    } finally {
      held.release();
    }
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.mfa.phoneUpdates).toHaveLength(1);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add verification method' })).toHaveFocus());
  });

  it('restores the selected SMS row action after cancelling removal confirmation', async () => {
    const reserved = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [reserved], two_factor_enabled: true }));
    const user = userEvent.setup();
    const action = screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0101' });
    await openMenu(user, action);
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(action).toHaveFocus();
  });

  it('does not show a late authenticator setup response in another account', async () => {
    const fapi = serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) }),
        fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2' }) }),
      ]),
    });
    const { clerk } = await renderWithClerk(<UserProfileMfaSection />);
    let release = () => undefined;
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });
    let started = false;
    worker.use(
      http.post(fapiUrl('/v1/me/totp'), async () => {
        const initiatingClient = structuredClone(fapi.client);
        const initiatingSession = initiatingClient.sessions.find(item => item.id === 'sess_1');
        if (initiatingSession?.user) {
          initiatingSession.user.first_name = 'LateResponseConsumed';
        }
        started = true;
        await gate;
        return HttpResponse.json({
          response: {
            object: 'totp',
            id: 'totp_held',
            secret: 'FIRSTACCOUNT',
            uri: 'otpauth://totp/Acme:first?secret=FIRSTACCOUNT',
            verified: false,
            created_at: Date.now(),
            updated_at: Date.now(),
          },
          client: initiatingClient,
        });
      }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await waitFor(() => expect(started).toBe(true));
    try {
      await clerk.setActive({ session: 'sess_2' });
      await waitFor(() => expect(fapi.client.last_active_session_id).toBe('sess_2'));
    } finally {
      release();
    }
    await waitFor(() =>
      expect(clerk.client?.sessions.find(item => item.id === 'sess_1')?.user?.firstName).toBe('LateResponseConsumed'),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByDisplayValue('FIRSTACCOUNT')).toBeNull();
    expect(fapi.mfa.totpCreations).toBe(0);
    expect(clerk.session?.id).toBe('sess_2');
    expect(clerk.user?.id).toBe('user_2');
  });

  it('keeps the profile visible until regenerated backup codes are ready', async () => {
    await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
    );
    const held = holdRequests('post', '/v1/me/backup_codes/');
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage Backup codes' }));
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
    await waitFor(() => expect(held.requests).toHaveLength(1));
    try {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByRole('button', { name: 'Add verification method' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Manage Backup codes' })).toBeVisible();
    } finally {
      held.release();
    }
    await waitFor(() => expect(screen.getByText('CODE0100')).toBeVisible());
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    for (const name of ['Print', 'Download', 'Copy and close']) {
      expect(screen.getByRole('button', { name })).toBeEnabled();
    }
  });

  it('returns failed regeneration to the section and retries from the menu', async () => {
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
    );
    const handlers = worker.listHandlers();
    const held = holdRequests('post', '/v1/me/backup_codes/');
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Manage Backup codes' });
    await openMenu(user, trigger);
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
    await waitFor(() => expect(held.requests).toHaveLength(1));
    held.fail('action_blocked', 'Unable to create backup codes.');
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        "This action couldn't be completed. Please try again later or contact support if this persists.",
      ),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    worker.resetHandlers(...handlers);
    await openMenu(user, trigger);
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
    expect(await screen.findByText('CODE0100')).toBeVisible();
    expect(fapi.mfa.backupCodeCreations).toBe(1);
  });

  it('uses fresh server codes for explicit regeneration', async () => {
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
    );
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage Backup codes' }));
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
    const list = await screen.findByRole('list', { name: 'Backup codes' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(10);
    expect(within(list).queryByText('CODE0001')).toBeNull();
    expect(fapi.mfa.backupCodeCreations).toBe(1);
  });

  async function renderBackupCodesNeedingReverification() {
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
      mfaEnvironment(),
      { verification: { secrets: { password: 'hunter2' } } },
    );
    demandReverificationOnce('/v1/me/backup_codes');
    return fapi;
  }

  const regenerate = async (user: ReturnType<typeof userEvent.setup>) => {
    await openMenu(user, await screen.findByRole('button', { name: 'Manage Backup codes' }));
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
  };

  it('verifies the session before regenerating backup codes and then shows them', async () => {
    const fapi = await renderBackupCodesNeedingReverification();
    const user = userEvent.setup();

    await regenerate(user);
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    const refresh = holdRequests('get', '/v1/me');
    try {
      await user.keyboard('hunter2{Enter}');
      await act(async () => {
        await waitFor(() => expect(refresh.requests).toHaveLength(1));
      });
      await user.keyboard('{Escape}');
      expect(screen.getByRole('dialog')).toHaveAttribute('data-open');
      expect(screen.getByText('Enter your current password to continue')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-busy', 'true');
    } finally {
      refresh.release();
    }

    const list = await screen.findByRole('list', { name: 'Backup codes' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(10);
    expect(fapi.mfa.backupCodeCreations).toBe(1);
  });

  it('lets the user cancel verification quietly and retry regenerating backup codes', async () => {
    const fapi = await renderBackupCodesNeedingReverification();
    const user = userEvent.setup();

    await regenerate(user);
    await screen.findByText('Enter your current password to continue');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.mfa.backupCodeCreations).toBe(0);
    expect(screen.queryByRole('alert')).toBeNull();

    await regenerate(user);
    await screen.findByRole('list', { name: 'Backup codes' });
    expect(fapi.mfa.backupCodeCreations).toBe(1);
  });

  it('keeps the verification open while regenerating and reports an ordinary retry error', async () => {
    const fapi = await renderBackupCodesNeedingReverification();
    const user = userEvent.setup();

    await regenerate(user);
    await screen.findByText('Enter your current password to continue');
    const dialog = screen.getByRole('dialog');
    const handlers = worker.listHandlers();
    const replay = holdRequests('post', '/v1/me/backup_codes/');
    await user.type(screen.getByLabelText('Password'), 'hunter2{Enter}');
    await waitFor(() => expect(replay.requests).toHaveLength(1));

    expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
    await user.keyboard('{Escape}');
    expect(dialog).toBeVisible();

    replay.fail('action_blocked', 'Unable to create backup codes.');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('alert')).toHaveTextContent(
      "This action couldn't be completed. Please try again later or contact support if this persists.",
    );
    expect(screen.queryByRole('list', { name: 'Backup codes' })).toBeNull();
    expect(fapi.mfa.backupCodeCreations).toBe(0);
    worker.resetHandlers(...handlers);
    await regenerate(user);
    await screen.findByRole('list', { name: 'Backup codes' });
    expect(fapi.mfa.backupCodeCreations).toBe(1);
  });

  it('keeps the profile visible until verification preparation is ready', async () => {
    const fapi = await renderBackupCodesNeedingReverification();
    const start = holdRequests('post', '/v1/client/sessions/:id/verify');
    const user = userEvent.setup();

    await regenerate(user);
    await waitFor(() => expect(start.requests).toHaveLength(1));
    try {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByRole('button', { name: 'Manage Backup codes' })).toBeVisible();
    } finally {
      start.release();
    }
    await screen.findByText('Enter your current password to continue');
    await waitFor(() => expect(screen.getByRole('dialog')).toContainElement(document.activeElement));
    await user.type(screen.getByLabelText('Password'), 'hunter2{Enter}');
    await screen.findByRole('list', { name: 'Backup codes' });
    expect(fapi.mfa.backupCodeCreations).toBe(1);
  });

  it('keeps the profile visible until the first response can request verification', async () => {
    await renderBackupCodesNeedingReverification();
    const first = holdRequests('post', '/v1/me/backup_codes/');
    const user = userEvent.setup();

    await regenerate(user);
    await waitFor(() => expect(first.requests).toHaveLength(1));
    try {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByRole('button', { name: 'Manage Backup codes' })).toBeVisible();
    } finally {
      first.release();
    }

    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
  });

  const startSms = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
  };

  it('verifies the session before reserving an existing phone for SMS MFA', async () => {
    const fapi = await renderMfa(undefined, mfaEnvironment(), { verification: { secrets: { password: 'hunter2' } } });
    demandReverificationOnce('/v1/me/phone_numbers/phone_1');
    const user = userEvent.setup();

    await startSms(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await user.keyboard('hunter2{Enter}');

    expect(await screen.findByText('CODE0001')).toBeVisible();
    expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_1', reserved: true, default: undefined });
  });

  it('keeps session verification on screen until the SMS reservation refresh completes', async () => {
    await renderMfa(undefined, mfaEnvironment(), { verification: { secrets: { password: 'hunter2' } } });
    demandReverificationOnce('/v1/me/phone_numbers/phone_1');
    const user = userEvent.setup();

    await startSms(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    const refresh = holdRequests('get', '/v1/me');
    try {
      await user.keyboard('hunter2{Enter}');
      await act(async () => {
        await waitFor(() => expect(refresh.requests).toHaveLength(1));
      });
      await user.keyboard('{Escape}');
      expect(screen.getByRole('dialog')).toHaveAttribute('data-open');
      expect(screen.getByText('Enter your current password to continue')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByText('CODE0001')).toBeNull();
    } finally {
      refresh.release();
    }

    expect(await screen.findByText('CODE0001')).toBeVisible();
  });

  it('keeps SMS code verification open until its reservation challenge can be cancelled', async () => {
    const unverified = fapiPhoneNumber({ ...phone, verification: { ...phone.verification, status: 'unverified' } });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [unverified] }), mfaEnvironment(), {
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me/phone_numbers/phone_1');
    const user = userEvent.setup();

    await startSms(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    const attempt = holdRequests('post', '/v1/me/phone_numbers/phone_1/attempt_verification');
    await user.type(code, VERIFICATION_CODE);
    await waitFor(() => expect(attempt.requests).toHaveLength(1));
    const dialog = screen.getByRole('dialog');
    try {
      expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
      await user.keyboard('{Escape}');
      expect(dialog).toBeVisible();
    } finally {
      attempt.release();
    }

    expect(await within(dialog).findByText('Enter your current password to continue')).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.mfa.phoneAttempts).toEqual([{ id: 'phone_1', code: VERIFICATION_CODE }]);
    expect(fapi.mfa.phoneUpdates).toEqual([]);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('verifies the session before creating a phone for SMS MFA, then sends its code', async () => {
    const fapi = await renderMfa(fapiUser({ id: 'user_1' }), mfaEnvironment(), {
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me/phone_numbers');
    const user = userEvent.setup();

    await startSms(user);
    await user.type(screen.getByRole('textbox', { name: 'Phone' }), '5555550303');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await user.keyboard('hunter2{Enter}');

    await waitFor(() => expect(fapi.mfa.phonePreparations).toHaveLength(1));
    expect(fapi.mfa.phoneCreations).toHaveLength(1);
    expect(await screen.findByRole('button', { name: 'Verify' })).toBeVisible();
  });

  it('keeps session verification on screen until the new phone code is sent', async () => {
    const fapi = await renderMfa(fapiUser({ id: 'user_1' }), mfaEnvironment(), {
      verification: { secrets: { password: 'hunter2' } },
    });
    demandReverificationOnce('/v1/me/phone_numbers');
    const user = userEvent.setup();

    await startSms(user);
    await user.type(screen.getByRole('textbox', { name: 'Phone' }), '5555550303');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    const prepare = holdRequests('post', '/v1/me/phone_numbers/:id/prepare_verification');
    try {
      await user.keyboard('hunter2{Enter}');
      await act(async () => {
        await waitFor(() => expect(prepare.requests).toHaveLength(1));
      });
      expect(screen.getByText('Enter your current password to continue')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByRole('textbox', { name: 'Phone' })).toBeNull();
    } finally {
      prepare.release();
    }

    expect(await screen.findByRole('textbox', { name: 'Verification code' })).toBeVisible();
    expect(screen.queryByRole('textbox', { name: 'Phone' })).toBeNull();
    expect(fapi.mfa.phonePreparations).toHaveLength(1);
  });

  it('lets the user cancel SMS MFA verification quietly and add the method again', async () => {
    const fapi = await renderMfa(undefined, mfaEnvironment(), { verification: { secrets: { password: 'hunter2' } } });
    demandReverificationOnce('/v1/me/phone_numbers/phone_1');
    const user = userEvent.setup();

    await startSms(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('Enter your current password to continue');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.mfa.phoneUpdates).toEqual([]);
    expect(screen.queryByRole('alert')).toBeNull();

    await startSms(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('CODE0001')).toBeVisible();
  });

  it('verifies the session before starting authenticator setup', async () => {
    const fapi = await renderMfa(undefined, mfaEnvironment(), { verification: { secrets: { password: 'hunter2' } } });
    demandReverificationOnce('/v1/me/totp');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await user.keyboard('hunter2{Enter}');

    expect(await screen.findByRole('img', { name: /QR code/i })).toBeVisible();
    expect(fapi.mfa.totpCreations).toBe(1);
  });

  it('lets the user cancel authenticator verification quietly and start setup again', async () => {
    const fapi = await renderMfa(undefined, mfaEnvironment(), { verification: { secrets: { password: 'hunter2' } } });
    demandReverificationOnce('/v1/me/totp');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await screen.findByText('Enter your current password to continue');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.mfa.totpCreations).toBe(0);
    expect(screen.queryByRole('alert')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    expect(await screen.findByRole('img', { name: /QR code/i })).toBeVisible();
    expect(fapi.mfa.totpCreations).toBe(1);
  });

  it('copies server-issued backup codes and closes their one-time surface', async () => {
    const fapi = await renderMfa();
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    await waitFor(() => expect(screen.getByText('CODE0001')).toBeVisible());
    await user.click(screen.getByRole('button', { name: 'Copy and close' }));
    await waitFor(() => expect(write).toHaveBeenCalledWith(fapi.mfa.codes.join('\n')));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('downloads the displayed backup codes in a file named after the application', async () => {
    const fapi = await renderMfa(fapiUser({ id: 'user_1', username: 'alice', phone_numbers: [phone] }));
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup-codes');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    await waitFor(() => expect(screen.getByText('CODE0001')).toBeVisible());
    await user.click(screen.getByRole('button', { name: 'Download' }));
    expect(create).toHaveBeenCalledOnce();
    const saved = create.mock.calls[0]?.[0];
    if (!(saved instanceof Blob)) {
      throw new Error('Expected the displayed backup codes to be saved in a blob');
    }
    expect(await saved.text()).toBe(
      [
        'These are your backup codes for Acme account alice.',
        'Store them securely and keep them secret. Each code can only be used once.',
        '',
        ...fapi.mfa.codes,
      ].join('\n'),
    );
    expect(click).toHaveBeenCalledOnce();
    expect(click.mock.instances[0]?.download).toBe('Acme_backup_codes.txt');
    expect(revoke).toHaveBeenCalledWith('blob:backup-codes');
    expect(screen.getByText('CODE0001')).toBeVisible();
  });

  it('keeps newly issued authenticator codes when the follow-up account reload fails', async () => {
    const fapi = await renderMfa();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await screen.findByRole('textbox', { name: 'Verification code' });
    worker.use(
      http.get(fapiUrl('/v1/me'), () =>
        HttpResponse.json(
          { errors: [{ code: 'unexpected_error', message: 'Reload failed', long_message: 'Reload failed' }] },
          { status: 503 },
        ),
      ),
    );
    await user.type(screen.getByRole('textbox', { name: 'Verification code' }), '123456');
    expect(await screen.findByText('CODE0001')).toBeVisible();
    expect(fapi.mfa.totpAttempts).toEqual(['123456']);
  });

  it('keeps regenerated codes when the follow-up account reload fails', async () => {
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
    );
    worker.use(
      http.get(fapiUrl('/v1/me'), () =>
        HttpResponse.json(
          { errors: [{ code: 'unexpected_error', message: 'Reload failed', long_message: 'Reload failed' }] },
          { status: 503 },
        ),
      ),
    );
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage Backup codes' }));
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
    await waitFor(() => expect(screen.getByText('CODE0100')).toBeVisible());
    expect(fapi.mfa.backupCodeCreations).toBe(1);
  });

  it('does not expose replacement codes when another factor is enrolled with existing codes', async () => {
    const reserved = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', phone_numbers: [reserved], two_factor_enabled: true, backup_code_enabled: true }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    await waitFor(() => expect(fapi.mfa.totpAttempts).toEqual(['123456']));
    expect(screen.queryByRole('list', { name: 'Backup codes' })).toBeNull();
    expect(fapi.client.sessions[0]?.user.backup_code_enabled).toBe(true);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('sets a different SMS phone as default and moves its row first', async () => {
    const first = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const second = fapiPhoneNumber({
      ...phone,
      id: 'phone_2',
      phone_number: '+15555550202',
      reserved_for_second_factor: true,
    });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [first, second], two_factor_enabled: true }));
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() =>
      expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_2', default: true, reserved: undefined }),
    );
    await waitFor(() =>
      expect(screen.getAllByText('SMS verification')[0]?.closest('li')).toHaveTextContent('+1 (555) 555-0202'),
    );
    expect(screen.getAllByText('SMS verification')[0]?.closest('li')).toHaveTextContent('Default');
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0101' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Set as default' })).toBeVisible());
  });

  it('shows a failed default change and clears its error on retry', async () => {
    const first = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const second = fapiPhoneNumber({
      ...phone,
      id: 'phone_2',
      phone_number: '+15555550202',
      reserved_for_second_factor: true,
    });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [first, second], two_factor_enabled: true }));
    let attempts = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/phone_numbers/phone_2'), ({ request }) => {
        if (new URL(request.url).searchParams.get('_method') !== 'PATCH') {
          return undefined;
        }
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json(
              {
                errors: [
                  {
                    code: 'unexpected_error',
                    message: 'Unable to update default method.',
                    long_message: 'Unable to update default method.',
                  },
                ],
              },
              { status: 503 },
            )
          : undefined;
      }),
    );
    const user = userEvent.setup();
    const selected = screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' });

    await openMenu(user, selected);
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to update default method.'));
    expect(screen.getAllByText('Default')).toHaveLength(1);

    await openMenu(user, selected);
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    await waitFor(() =>
      expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_2', default: true, reserved: undefined }),
    );
    expect(attempts).toBe(2);
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0101' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Set as default' })).toBeVisible());
  });

  it.each([
    { phase: 'mutation', method: 'post', path: '/v1/me/phone_numbers/phone_2', pendingPhone: '+1 (555) 555-0202' },
    { phase: 'refresh', method: 'get', path: '/v1/me', pendingPhone: '+1 (555) 555-0101' },
  ] as const)(
    'keeps method menus available but hides default changes during $phase',
    async ({ method, path, pendingPhone }) => {
      const first = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
      const second = fapiPhoneNumber({
        ...phone,
        id: 'phone_2',
        phone_number: '+15555550202',
        reserved_for_second_factor: true,
      });
      await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [first, second], two_factor_enabled: true }));
      const held = holdRequests(method, path);
      const user = userEvent.setup();
      const selected = screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' });
      await openMenu(user, selected);
      await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
      await waitFor(() => expect(held.requests).toHaveLength(1));
      try {
        const pendingAction = screen.getByRole('button', { name: `Manage SMS verification ${pendingPhone}` });
        await openMenu(user, pendingAction);
        await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Remove method' })).toBeVisible());
        expect(screen.queryByRole('menuitem', { name: 'Set as default' })).toBeNull();
        await user.click(await screen.findByRole('menuitem', { name: 'Remove method' }));
        expect(screen.queryByRole('alertdialog')).toBeNull();
      } finally {
        held.release();
      }
      await waitFor(() => expect(screen.getByText('+1 (555) 555-0202').closest('li')).toHaveTextContent('Default'));
      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0101' }));
      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Set as default' })).toBeVisible());
    },
  );

  it('clears backup-code eligibility when the final optional factor is removed', async () => {
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
    );
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(fapi.mfa.totpRemovals).toBe(1));
    expect(fapi.client.sessions[0]?.user.backup_code_enabled).toBe(false);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('finishes removal when the follow-up account reload fails', async () => {
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
    );
    const user = userEvent.setup();
    await openMenu(user, screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    worker.use(
      http.get(fapiUrl('/v1/me'), () =>
        HttpResponse.json(
          { errors: [{ code: 'unexpected_error', message: 'Reload failed', long_message: 'Reload failed' }] },
          { status: 503 },
        ),
      ),
    );
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(fapi.mfa.totpRemovals).toBe(1));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it.each([
    { message: 'Printing is unavailable in this browser.', overrides: {} },
    {
      message: 'Allow popups to print these codes.',
      overrides: { 'errors.mfa_print_unavailable': 'Allow popups to print these codes.' },
    },
  ])('localizes printing failures as $message', async ({ message, overrides }) => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(<UserProfileMfaSection />, undefined, { overrides });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    expect(await screen.findByText('CODE0001')).toBeVisible();
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    await user.click(screen.getByRole('button', { name: 'Print' }));
    expect(open).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent(message);
  });

  it('prints the codes under a heading naming the application and account', async () => {
    const fapi = await renderMfa(fapiUser({ id: 'user_1', username: 'alice', phone_numbers: [phone] }));
    const printable = {
      document: document.implementation.createHTMLDocument(),
      addEventListener: vi.fn(),
      setTimeout: vi.fn(),
      focus: vi.fn(),
      print: vi.fn(),
      close: vi.fn(),
    };
    vi.spyOn(window, 'open').mockReturnValue(printable as unknown as Window);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    expect(await screen.findByText('CODE0001')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Print' }));
    expect(printable.print).toHaveBeenCalledOnce();
    expect(printable.document.title).toBe('Your backup codes for Acme account alice');
    expect(printable.document.querySelector('h1')?.textContent).toBe('Your backup codes for Acme account alice');
    expect(printable.document.querySelector('pre')?.textContent).toBe(fapi.mfa.codes.join('\n'));
    expect(screen.getByRole('alert').textContent).toBe('');
  });
});
