import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, holdRequests, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiPhoneNumber, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { mfaSectionNode, UserProfileMfaSection } from '../user-profile-mfa-section/user-profile-mfa-section';
import { useUserProfileMfaModel } from '../user-profile-mfa-section/user-profile-mfa-section.model';
import { renderPasswordSection } from '../user-profile-password-section/user-profile-password-section';
import { useUserProfilePasswordModel } from '../user-profile-password-section/user-profile-password-section.model';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';
import { mfaEnvironment, phone, renderMfa } from './mfa-feature-setup';

describe('User profile MFA management', () => {
  it('shows a safe message when authenticator setup throws an unexpected error', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    const { clerk } = await renderWithClerk(<UserProfileMfaSection />);
    if (!clerk.user) {
      throw new Error('Expected the signed-in user');
    }
    const create = vi.spyOn(clerk.user, 'createTOTP').mockRejectedValue(new Error('Internal authenticator failure'));
    try {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Add verification method' }));
      await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'),
      );
      expect(screen.queryByText('Internal authenticator failure')).toBeNull();
    } finally {
      create.mockRestore();
    }
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
          ? HttpResponse.json({ errors: [{ code: 'action_blocked', message: 'Action blocked' }] }, { status: 403 })
          : undefined,
      ),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('This authenticator must remain enabled.'));
    expect(screen.getByText('Authenticator app')).toBeVisible();
  });

  it('renders a plain MFA node in Authentication over legacy methods', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(
      <UserProfileSecurityPanelView
        mfaSlot={<div>Connected MFA</div>}
        mfaMethods={[{ id: 'injected', type: 'authenticator' }]}
      />,
    );

    const authentication = screen.getByRole('region', { name: 'Authentication' });
    expect(within(authentication).getByText('Connected MFA')).toBeVisible();
    expect(within(authentication).queryByRole('heading', { name: '2-step verification' })).toBeNull();
  });

  it('suppresses injected MFA when the slot is explicitly null', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(
      <UserProfileSecurityPanelView
        mfaSlot={null}
        mfaMethods={[{ id: 'injected', type: 'authenticator' }]}
      />,
    );

    expect(screen.queryByRole('region', { name: 'Authentication' })).toBeNull();
  });

  it('removes SMS MFA while retaining the phone number', async () => {
    const reserved = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [reserved], two_factor_enabled: true }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +15555550101' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    expect(screen.getByRole('alertdialog', { name: 'Remove SMS verification' })).toHaveAccessibleDescription(
      'You will no longer receive sign-in verification codes at +15555550101. The phone number will remain on your account.',
    );
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByText('+15555550101')).toBeNull());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add verification method' })).toHaveFocus());
    expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_1', reserved: false, default: undefined });
    expect(fapi.client.sessions[0]?.user.phone_numbers).toHaveLength(1);
  });

  it('moves focus through remaining MFA rows and then to Add after sequential removals', async () => {
    const first = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const second = fapiPhoneNumber({ id: 'phone_2', phone_number: '+15555550202', reserved_for_second_factor: true });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [first, second], two_factor_enabled: true }));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +15555550101' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    const remaining = await screen.findByRole('button', { name: 'Manage SMS verification +15555550202' });
    await waitFor(() => expect(remaining).toHaveFocus());

    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add verification method' })).toHaveFocus());
    expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_1', reserved: false, default: undefined });
    expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_2', reserved: false, default: undefined });
  });

  it('shows second-factor reverification for removal with no addable methods', async () => {
    const environment = mfaEnvironment();
    environment.user_settings.attributes.phone_number.used_for_second_factor = false;
    const fapi = serveFapi({
      environment,
      client: fapiClient([
        fapiSession({
          id: 'sess_1',
          user: fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
        }),
      ]),
      verification: { secondFactors: [{ strategy: 'totp' }], secrets: { totp: '654321' } },
    });
    await renderWithClerk(<UserProfileMfaSection />);
    let attempts = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/totp'), ({ request }) => {
        if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
          return undefined;
        }
        attempts += 1;
        return attempts === 1 || fapi.verification.status !== 'complete'
          ? HttpResponse.json(
              { errors: [{ code: 'session_reverification_required', message: 'Reverification required' }] },
              { status: 403 },
            )
          : undefined;
      }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByText('Verification required')).toBeVisible());
    expect(fapi.mfa.totpRemovals).toBe(0);
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '654321');
    await waitFor(() => expect(fapi.mfa.totpRemovals).toBe(1));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('leaves the enrolled method intact when removal reverification is cancelled', async () => {
    const environment = mfaEnvironment();
    environment.user_settings.attributes.phone_number.used_for_second_factor = false;
    const fapi = serveFapi({
      environment,
      client: fapiClient([
        fapiSession({
          id: 'sess_1',
          user: fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
        }),
      ]),
      verification: { secondFactors: [{ strategy: 'totp' }], secrets: { totp: '654321' } },
    });
    await renderWithClerk(<UserProfileMfaSection />);
    worker.use(
      http.post(fapiUrl('/v1/me/totp'), ({ request }) =>
        new URL(request.url).searchParams.get('_method') === 'DELETE'
          ? HttpResponse.json(
              { errors: [{ code: 'session_reverification_required', message: 'Reverification required' }] },
              { status: 403 },
            )
          : undefined,
      ),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByText('Verification required')).toBeVisible());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Verification required')).toBeNull());
    expect(fapi.mfa.totpRemovals).toBe(0);
    expect(screen.getByText('Authenticator app')).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
    serveFapi(fapi);
    await user.click(screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(fapi.mfa.totpRemovals).toBe(1));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('restores the selected SMS row action after cancelling removal confirmation', async () => {
    const reserved = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [reserved], two_factor_enabled: true }));
    const user = userEvent.setup();
    const action = screen.getByRole('button', { name: 'Manage SMS verification +15555550101' });
    await user.click(action);
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(action).toHaveFocus();
  });

  it('places a connected MFA slot after password in the security panel', async () => {
    function Panel() {
      const mfaSlot = mfaSectionNode(useUserProfileMfaModel());
      const passwordSlot = renderPasswordSection(useUserProfilePasswordModel(), null);
      return (
        <UserProfileSecurityPanelView
          passwordSlot={passwordSlot}
          mfaSlot={mfaSlot}
        />
      );
    }
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(<Panel />);
    const authentication = screen.getByRole('region', { name: 'Authentication' });
    expect(authentication).toHaveTextContent('Password');
    expect(authentication).toHaveTextContent('2-step verification');
    expect(authentication.textContent?.indexOf('Password')).toBeLessThan(
      authentication.textContent?.indexOf('2-step verification') ?? 0,
    );
  });

  it('uses the connected slot instead of duplicate injected MFA props', async () => {
    function Panel() {
      const mfaSlot = mfaSectionNode(useUserProfileMfaModel());
      return (
        <UserProfileSecurityPanelView
          mfaSlot={mfaSlot}
          mfaMethods={[{ id: 'injected', type: 'authenticator' }]}
        />
      );
    }
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(<Panel />);
    expect(screen.getAllByText('2-step verification')).toHaveLength(1);
    expect(screen.queryByText('Authenticator app')).toBeNull();
  });

  it('suppresses injected MFA when the connected slot is hidden', async () => {
    function Panel() {
      const mfaSlot = mfaSectionNode(useUserProfileMfaModel());
      return (
        <UserProfileSecurityPanelView
          mfaSlot={mfaSlot}
          mfaMethods={[{ id: 'injected', type: 'authenticator' }]}
        />
      );
    }
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]) });
    await renderWithClerk(<Panel />);
    expect(screen.queryByRole('region', { name: 'Authentication' })).toBeNull();
  });

  it('reverifies the first factor before creating an authenticator secret', async () => {
    const fapi = await renderMfa();
    fapi.verification.secrets.password = 'hunter2';
    let attempts = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/totp'), () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json(
              { errors: [{ code: 'session_reverification_required', message: 'Reverification required' }] },
              { status: 403 },
            )
          : undefined;
      }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await waitFor(() => expect(screen.getByText('Verification required')).toBeVisible());
    expect(fapi.mfa.totpCreations).toBe(0);
    const password = await screen.findByLabelText('Password');
    await waitFor(() => expect(password).toBeVisible());
    await user.type(password, 'hunter2{Enter}');
    await waitFor(() => expect(fapi.verification.status).toBe('complete'));
    await waitFor(() => expect(fapi.mfa.totpCreations).toBe(1));
    expect(await screen.findByRole('img', { name: /QR code/i }, { timeout: 3000 })).toBeVisible();
    expect(fapi.mfa.totpCreations).toBe(1);
  });

  it('waits for enrolled second-factor verification before regenerating backup codes', async () => {
    const fapi = serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([
        fapiSession({
          id: 'sess_1',
          user: fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
        }),
      ]),
      verification: { secondFactors: [{ strategy: 'totp' }], secrets: { totp: '654321' } },
    });
    await renderWithClerk(<UserProfileMfaSection />);
    let attempts = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/backup_codes/'), () => {
        attempts += 1;
        return attempts === 1 || fapi.verification.status !== 'complete'
          ? HttpResponse.json(
              { errors: [{ code: 'session_reverification_required', message: 'Reverification required' }] },
              { status: 403 },
            )
          : undefined;
      }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
    await waitFor(() => expect(screen.getByText('Verification required')).toBeVisible());
    expect(fapi.mfa.backupCodeCreations).toBe(0);
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '654321');
    await waitFor(() => expect(fapi.verification.status).toBe('complete'));
    await waitFor(() => expect(screen.getByText('CODE0100')).toBeVisible());
    expect(fapi.mfa.backupCodeCreations).toBe(1);
  });

  it('cancels authenticator enrollment without showing an error or creating a secret', async () => {
    const fapi = await renderMfa();
    worker.use(
      http.post(fapiUrl('/v1/me/totp'), () =>
        HttpResponse.json(
          { errors: [{ code: 'session_reverification_required', message: 'Reverification required' }] },
          { status: 403 },
        ),
      ),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await waitFor(() => expect(screen.getByText('Verification required')).toBeVisible());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(fapi.mfa.totpCreations).toBe(0);
  });

  it('does not retry a pending authenticator challenge after the active account changes', async () => {
    const fapi = serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) }),
        fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2' }) }),
      ]),
    });
    const { clerk } = await renderWithClerk(<UserProfileMfaSection />);
    worker.use(
      http.post(fapiUrl('/v1/me/totp'), () =>
        HttpResponse.json(
          { errors: [{ code: 'session_reverification_required', message: 'Reverification required' }] },
          { status: 403 },
        ),
      ),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await waitFor(() => expect(screen.getByText('Verification required')).toBeVisible());
    await clerk.setActive({ session: 'sess_2' });
    await waitFor(() => expect(fapi.client.last_active_session_id).toBe('sess_2'));
    await waitFor(() => expect(screen.queryByText('Verification required')).toBeNull());
    expect(fapi.mfa.totpCreations).toBe(0);
  });

  it('rechecks phone eligibility after reverification before reserving it', async () => {
    const fapi = serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', phone_numbers: [phone] }) })]),
      verification: { secrets: { password: 'hunter2' } },
    });
    await renderWithClerk(<UserProfileMfaSection />);
    let attempts = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/phone_numbers/phone_1'), ({ request }) => {
        if (new URL(request.url).searchParams.get('_method') !== 'PATCH') {
          return undefined;
        }
        attempts += 1;
        return HttpResponse.json(
          { errors: [{ code: 'session_reverification_required', message: 'Reverification required' }] },
          { status: 403 },
        );
      }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(screen.getByText('Verification required')).toBeVisible());
    const password = await screen.findByLabelText('Password');
    await waitFor(() => expect(password).toBeVisible());
    const session = fapi.client.sessions.find(item => item.id === 'sess_1');
    const seededPhone = session?.user?.phone_numbers.find(item => item.id === 'phone_1');
    if (!seededPhone) {
      throw new Error('Missing seeded phone');
    }
    seededPhone.reserved_for_second_factor = true;
    await user.type(password, 'hunter2{Enter}');
    await waitFor(() => expect(screen.getByText('This phone number is unavailable.')).toBeVisible());
    expect(attempts).toBe(1);
    expect(fapi.mfa.phoneUpdates).toHaveLength(0);
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

  it('opens the backup-code surface while regeneration is pending', async () => {
    await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
    );
    const held = holdRequests('post', '/v1/me/backup_codes/');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
    await waitFor(() => expect(held.requests).toHaveLength(1));
    await waitFor(() => expect(screen.getByRole('status', { name: 'Generating backup codes' })).toBeVisible());
    expect(screen.queryByRole('button', { name: 'Copy and close' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Download' })).toBeNull();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus());
    held.release();
    await waitFor(() => expect(screen.getByText('CODE0100')).toBeVisible());
  });

  it('uses fresh server codes for explicit regeneration', async () => {
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));
    const list = await screen.findByRole('list', { name: 'Backup codes' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(10);
    expect(within(list).queryByText('CODE0001')).toBeNull();
    expect(fapi.mfa.backupCodeCreations).toBe(1);
  });

  it('copies server-issued backup codes and closes their one-time surface', async () => {
    const fapi = await renderMfa();
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    try {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Add verification method' }));
      await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
      await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
      await waitFor(() => expect(screen.getByText('CODE0001')).toBeVisible());
      await user.click(screen.getByRole('button', { name: 'Copy and close' }));
      await waitFor(() => expect(write).toHaveBeenCalledWith(fapi.mfa.codes.join('\n')));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    } finally {
      write.mockRestore();
    }
  });

  it('downloads only the displayed server-issued backup codes', async () => {
    const fapi = await renderMfa();
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup-codes');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    try {
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
      expect(await saved.text()).toBe(fapi.mfa.codes.join('\n'));
      expect(click).toHaveBeenCalledOnce();
      expect(click.mock.instances[0]?.download).toBe('clerk-backup-codes.txt');
      expect(revoke).toHaveBeenCalledWith('blob:backup-codes');
      expect(screen.getByText('CODE0001')).toBeVisible();
    } finally {
      create.mockRestore();
      revoke.mockRestore();
      click.mockRestore();
    }
  });

  it('keeps newly issued authenticator codes when the follow-up account reload fails', async () => {
    const fapi = await renderMfa();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await screen.findByRole('textbox', { name: 'Verification code' });
    worker.use(
      http.get(fapiUrl('/v1/me'), () =>
        HttpResponse.json({ errors: [{ code: 'unexpected_error', message: 'Reload failed' }] }, { status: 503 }),
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
        HttpResponse.json({ errors: [{ code: 'unexpected_error', message: 'Reload failed' }] }, { status: 503 }),
      ),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
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
    const second = fapiPhoneNumber({ id: 'phone_2', phone_number: '+15555550202', reserved_for_second_factor: true });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [first, second], two_factor_enabled: true }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +15555550202' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() =>
      expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_2', default: true, reserved: undefined }),
    );
    await waitFor(() =>
      expect(screen.getAllByText('SMS verification')[0]?.closest('li')).toHaveTextContent('+15555550202'),
    );
    expect(screen.getAllByText('SMS verification')[0]?.closest('li')).toHaveTextContent('Default');
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +15555550101' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Set as default' })).toBeVisible());
  });

  it('shows a failed default change and clears its error on retry', async () => {
    const first = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const second = fapiPhoneNumber({ id: 'phone_2', phone_number: '+15555550202', reserved_for_second_factor: true });
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
              { errors: [{ code: 'unexpected_error', message: 'Unable to update default method.' }] },
              { status: 503 },
            )
          : undefined;
      }),
    );
    const user = userEvent.setup();
    const selected = screen.getByRole('button', { name: 'Manage SMS verification +15555550202' });

    await user.click(selected);
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to update default method.'));
    expect(screen.getAllByText('Default')).toHaveLength(1);

    await user.click(selected);
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    await waitFor(() =>
      expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_2', default: true, reserved: undefined }),
    );
    expect(attempts).toBe(2);
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +15555550101' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Set as default' })).toBeVisible());
  });

  it.each([
    { phase: 'mutation', method: 'post', path: '/v1/me/phone_numbers/phone_2', pendingPhone: '+15555550202' },
    { phase: 'refresh', method: 'get', path: '/v1/me', pendingPhone: '+15555550101' },
  ] as const)(
    'keeps method menus available but hides default changes during $phase',
    async ({ method, path, pendingPhone }) => {
      const first = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
      const second = fapiPhoneNumber({ id: 'phone_2', phone_number: '+15555550202', reserved_for_second_factor: true });
      await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [first, second], two_factor_enabled: true }));
      const held = holdRequests(method, path);
      const user = userEvent.setup();
      const selected = screen.getByRole('button', { name: 'Manage SMS verification +15555550202' });
      await user.click(selected);
      await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));
      await waitFor(() => expect(held.requests).toHaveLength(1));
      try {
        const pendingAction = screen.getByRole('button', { name: `Manage SMS verification ${pendingPhone}` });
        await user.click(pendingAction);
        if (pendingAction.getAttribute('aria-expanded') !== 'true') {
          await user.click(pendingAction);
        }
        expect(screen.queryByRole('menuitem', { name: 'Set as default' })).toBeNull();
        await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Remove method' })).toBeVisible());
      } finally {
        held.release();
      }
      await waitFor(() => expect(screen.getByText('+15555550202').closest('li')).toHaveTextContent('Default'));
      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('button', { name: 'Manage SMS verification +15555550101' }));
      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Set as default' })).toBeVisible());
    },
  );

  it('clears backup-code eligibility when the final optional factor is removed', async () => {
    const fapi = await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, backup_code_enabled: true, two_factor_enabled: true }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Authenticator app' }));
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
    await user.click(screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    worker.use(
      http.get(fapiUrl('/v1/me'), () =>
        HttpResponse.json({ errors: [{ code: 'unexpected_error', message: 'Reload failed' }] }, { status: 503 }),
      ),
    );
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(fapi.mfa.totpRemovals).toBe(1));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('offers printing for newly issued backup codes', async () => {
    await renderMfa();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    expect(await screen.findByText('CODE0001')).toBeVisible();
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    await user.click(screen.getByRole('button', { name: 'Print' }));
    expect(open).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent('Printing is unavailable in this browser.');
    open.mockRestore();
  });
});
