import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, holdRequests, serveFapi, worker } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiPhoneNumber,
  fapiSession,
  fapiUser,
} from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileMfaSection } from '../user-profile-mfa-section';
import { mfaEnvironment, phone, renderMfa } from './mfa-feature-setup';

describe('User profile MFA', () => {
  it('hides when no second factor strategy is enabled', async () => {
    await renderMfa(fapiUser({ id: 'user_1' }), fapiEnvironment());
    expect(screen.queryByText('2-step verification')).toBeNull();
  });

  it('offers configured methods and creates one authenticator secret', async () => {
    await renderMfa();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Authenticator app/ })).toBeVisible());
    expect(screen.getByRole('button', { name: /SMS verification/ })).toBeVisible();
    expect(screen.queryByRole('button', { name: /Backup codes/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    expect(await screen.findByRole('img', { name: /QR code/i })).toBeVisible();
  });

  it('shows enrolled methods with the default SMS phone first', async () => {
    const second = fapiPhoneNumber({
      id: 'phone_2',
      phone_number: '+15555550202',
      reserved_for_second_factor: true,
      default_second_factor: true,
    });
    const first = fapiPhoneNumber({
      ...phone,
      reserved_for_second_factor: true,
    });
    await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [first, second], two_factor_enabled: true }));
    const rows = screen.getAllByText('SMS verification');
    expect(rows).toHaveLength(2);
    expect(rows[0]?.closest('li')).toHaveTextContent('+1 (555) 555-0202');
    expect(rows[0]?.closest('li')).toHaveTextContent('Default');
    expect(rows[1]?.closest('li')).toHaveTextContent('+1 (555) 555-0101');
    expect(rows[1]?.closest('li')).not.toHaveTextContent('Default');
    expect(screen.getByText('+1 (555) 555-0202')).toBeVisible();
    expect(screen.getByText('Default')).toBeVisible();
  });

  it('hides set-as-default while an authenticator is enrolled', async () => {
    const first = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    const second = fapiPhoneNumber({ id: 'phone_2', phone_number: '+15555550202', reserved_for_second_factor: true });
    await renderMfa(
      fapiUser({ id: 'user_1', phone_numbers: [first, second], totp_enabled: true, two_factor_enabled: true }),
    );
    expect(screen.getByText('Authenticator app').closest('li')).toHaveTextContent('Default');
    expect(screen.getAllByText('Default')).toHaveLength(1);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 (555) 555-0202' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Remove method' })).toBeVisible());
    expect(screen.queryByRole('menuitem', { name: 'Set as default' })).toBeNull();
  });

  it('verifies a new authenticator and shows server-issued backup codes', async () => {
    const fapi = await renderMfa();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    expect(await screen.findByText('CODE0001')).toBeVisible();
    expect(within(screen.getByRole('list', { name: 'Backup codes' })).getAllByRole('listitem')).toHaveLength(10);
    expect(fapi.mfa.totpCreations).toBe(1);
    expect(fapi.mfa.totpAttempts).toEqual(['123456']);
    expect(fapi.mfa.backupCodeCreations).toBe(0);
  });

  it('keeps the same authenticator secret after switching back to the method picker', async () => {
    const fapi = await renderMfa();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.click(await screen.findByRole('button', { name: 'Can’t scan? View setup key' }));
    expect(screen.getByDisplayValue('SECRET1')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Scan QR code instead' }));
    expect(screen.getByRole('img', { name: /QR code/i })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    expect(await screen.findByRole('img', { name: /QR code/i })).toBeVisible();
    expect(fapi.mfa.totpCreations).toBe(1);
  });

  it('reserves an existing verified phone without creating another one', async () => {
    const fapi = await renderMfa();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(fapi.mfa.phoneCreations).toEqual([]);
    expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_1', reserved: true, default: undefined });
    expect(await screen.findByText('CODE0001')).toBeVisible();
  });

  it('shows the backend error when the last login identifier cannot be reserved', async () => {
    const fapi = await renderMfa();
    worker.use(
      http.post(fapiUrl('/v1/me/phone_numbers/phone_1'), ({ request }) =>
        new URL(request.url).searchParams.get('_method') === 'PATCH'
          ? HttpResponse.json(
              {
                errors: [
                  {
                    code: 'identification_update_failed',
                    message: 'Update failed',
                    long_message: 'You cannot set your last identification as second factor.',
                  },
                ],
              },
              { status: 400 },
            )
          : undefined,
      ),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() =>
      expect(screen.getByText('You cannot set your last identification as second factor.')).toBeVisible(),
    );
    expect(screen.getByRole('combobox', { name: /Phone number/ })).toHaveAccessibleDescription(
      'You cannot set your last identification as second factor.',
    );
    expect(fapi.mfa.phoneUpdates).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Back' })).toBeVisible();
  });

  it('protects the last required factor from removal', async () => {
    const environment = mfaEnvironment();
    environment.user_settings.sign_up.mfa = { required: true };
    await renderMfa(
      fapiUser({ id: 'user_1', totp_enabled: true, two_factor_enabled: true, backup_code_enabled: true }),
      environment,
    );
    expect(screen.getByText('Authenticator app')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Manage Authenticator app' })).toBeNull();
  });

  it('hides removal of the last configured SMS factor when TOTP is disabled', async () => {
    const environment = mfaEnvironment();
    environment.user_settings.sign_up.mfa = { required: true };
    environment.user_settings.attributes.authenticator_app.used_for_second_factor = false;
    const reserved = fapiPhoneNumber({ ...phone, reserved_for_second_factor: true, default_second_factor: true });
    await renderMfa(
      fapiUser({ id: 'user_1', phone_numbers: [reserved], totp_enabled: true, two_factor_enabled: true }),
      environment,
    );
    expect(screen.getByText('SMS verification')).toBeVisible();
    expect(screen.queryByText('Authenticator app')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Manage SMS verification +1 (555) 555-0101' })).toBeNull();
  });

  it('keeps backup codes visible when TOTP was the only addable method', async () => {
    const environment = mfaEnvironment();
    environment.user_settings.attributes.phone_number.used_for_second_factor = false;
    const fapi = await renderMfa(fapiUser({ id: 'user_1' }), environment);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    expect(await screen.findByText('CODE0001')).toBeVisible();
    expect(fapi.mfa.backupCodeCreations).toBe(0);
  });

  it('shows a localized incorrect TOTP code and allows a retry with the same secret', async () => {
    const fapi = await renderMfa();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await user.type(code, '000000');
    await waitFor(() => expect(screen.getByText('Incorrect code')).toBeVisible());
    expect(fapi.mfa.totpCreations).toBe(1);
    await user.clear(code);
    await user.type(code, '123456');
    expect(await screen.findByText('CODE0001')).toBeVisible();
    expect(fapi.mfa.totpCreations).toBe(1);
  });

  it('uses a supplied non-English catalog for coded TOTP errors', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(<UserProfileMfaSection />, undefined, {
      locale: 'es',
      messages: { errors: { form_code_incorrect: 'El código no es correcto.' } },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '000000');
    await waitFor(() => expect(screen.getByText('El código no es correcto.')).toBeVisible());
  });

  it('verifies an unverified existing SMS phone before reserving it', async () => {
    const unverified = fapiPhoneNumber({ ...phone, verification: { ...phone.verification, status: 'unverified' } });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [unverified] }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('textbox', { name: 'Verification code' })).toBeVisible();
    expect(fapi.mfa.phonePreparations).toEqual(['phone_1']);
    expect(fapi.mfa.phoneUpdates).toEqual([]);
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    expect(await screen.findByText('CODE0001')).toBeVisible();
    expect(fapi.mfa.phoneAttempts).toEqual([{ id: 'phone_1', code: '123456' }]);
    expect(fapi.mfa.phoneUpdates).toContainEqual({ id: 'phone_1', reserved: true, default: undefined });
  });

  it('submits the entered SMS code through the Verify form', async () => {
    const unverified = fapiPhoneNumber({ ...phone, verification: { ...phone.verification, status: 'unverified' } });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [unverified] }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await user.type(code, '000000');
    await waitFor(() => expect(fapi.mfa.phoneAttempts).toHaveLength(1));
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() =>
      expect(fapi.mfa.phoneAttempts).toEqual([
        { id: 'phone_1', code: '000000' },
        { id: 'phone_1', code: '000000' },
      ]),
    );
  });

  it('retries SMS reservation without re-verifying a phone whose code already succeeded', async () => {
    const unverified = fapiPhoneNumber({ ...phone, verification: { ...phone.verification, status: 'unverified' } });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [unverified] }));
    let reservations = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/phone_numbers/phone_1'), ({ request }) => {
        if (new URL(request.url).searchParams.get('_method') !== 'PATCH') {
          return undefined;
        }
        reservations += 1;
        return reservations === 1
          ? HttpResponse.json(
              {
                errors: [
                  { code: 'unexpected_error', message: 'Reservation failed', long_message: 'Reservation failed' },
                ],
              },
              { status: 503 },
            )
          : undefined;
      }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
    await waitFor(() => expect(screen.getByText('Reservation failed')).toBeVisible());
    expect(fapi.mfa.phoneAttempts).toEqual([{ id: 'phone_1', code: '123456' }]);
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(screen.getByText('CODE0001')).toBeVisible());
    expect(reservations).toBe(2);
    expect(fapi.mfa.phoneAttempts).toHaveLength(1);
  });

  it('starts a resend cooldown after sending an SMS verification code', async () => {
    const unverified = fapiPhoneNumber({ ...phone, verification: { ...phone.verification, status: 'unverified' } });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [unverified] }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('textbox', { name: 'Verification code' });
    expect(screen.getByRole('button', { name: /Resend/ })).toBeDisabled();
    expect(fapi.mfa.phonePreparations).toEqual(['phone_1']);
  });

  it('disables verification and Back while resending an SMS code', async () => {
    const unverified = fapiPhoneNumber({ ...phone, verification: { ...phone.verification, status: 'unverified' } });
    await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [unverified] }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    const held = holdRequests('post', '/v1/me/phone_numbers/phone_1/prepare_verification');
    const later = Date.now() + 31_000;
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(later);
    try {
      await waitFor(() => expect(screen.getByRole('button', { name: /Resend/ })).toBeEnabled(), { timeout: 2000 });
      await user.click(screen.getByRole('button', { name: /Resend/ }));
      await waitFor(() => expect(held.requests).toHaveLength(1));
      expect(code).toHaveAttribute('aria-disabled', 'true');
      expect(code).toHaveAttribute('readonly');
      expect(screen.getByRole('button', { name: 'Verify' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    } finally {
      held.release();
      vi.useRealTimers();
    }
    await waitFor(() => expect(screen.getByRole('button', { name: 'Verify' })).toBeEnabled());
    expect(code).not.toHaveAttribute('aria-disabled');
    expect(code).not.toHaveAttribute('readonly');
  });

  it('keeps a newly created phone when preparing its code fails and retries without duplication', async () => {
    const fapi = await renderMfa(fapiUser({ id: 'user_1' }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.type(screen.getByRole('textbox', { name: 'Phone' }), '5555550303');
    const prepare = holdRequests('post', '/v1/me/phone_numbers/phone_1/prepare_verification');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await waitFor(() => expect(prepare.requests).toHaveLength(1));
    prepare.fail('phone_number_invalid', 'Unable to send a code.');
    await waitFor(() => expect(screen.getByText('Unable to send a code.')).toBeVisible());
    expect(fapi.mfa.phoneCreations).toHaveLength(1);
    serveFapi(fapi);
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await waitFor(() => expect(fapi.mfa.phonePreparations).toHaveLength(1));
    expect(fapi.mfa.phoneCreations).toHaveLength(1);
  });

  it('uses a newly selected phone after going back from SMS verification', async () => {
    const first = fapiPhoneNumber({ ...phone, verification: { ...phone.verification, status: 'unverified' } });
    const second = fapiPhoneNumber({
      id: 'phone_2',
      phone_number: '+15555550202',
      verification: { ...phone.verification, status: 'unverified' },
    });
    const fapi = await renderMfa(fapiUser({ id: 'user_1', phone_numbers: [first, second] }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('textbox', { name: 'Verification code' });
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await user.click(screen.getByRole('combobox', { name: /Phone number/ }));
    await user.click(screen.getAllByRole('option')[1]);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(fapi.mfa.phonePreparations).toEqual(['phone_1', 'phone_2']));
  });

  it('returns to the entered number after backing out of a new phone verification', async () => {
    const fapi = await renderMfa(fapiUser({ id: 'user_1' }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.type(screen.getByRole('textbox', { name: 'Phone' }), '5555550303');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await screen.findByRole('textbox', { name: 'Verification code' });
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('(555) 555-0303');
    expect(fapi.mfa.phoneCreations).toHaveLength(1);
  });

  it('creates a new resource when the entered number changes after a prepare failure', async () => {
    const fapi = await renderMfa(fapiUser({ id: 'user_1' }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    await user.type(screen.getByRole('textbox', { name: 'Phone' }), '5555550303');
    const prepare = holdRequests('post', '/v1/me/phone_numbers/phone_1/prepare_verification');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await waitFor(() => expect(prepare.requests).toHaveLength(1));
    prepare.fail('phone_number_invalid', 'Unable to send a code.');
    await waitFor(() => expect(screen.getByText('Unable to send a code.')).toBeVisible());
    serveFapi(fapi);
    const number = screen.getByRole('textbox', { name: 'Phone' });
    await user.clear(number);
    await user.type(number, '5555550404');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await waitFor(() => expect(fapi.mfa.phoneCreations).toHaveLength(2));
    expect(await screen.findByRole('textbox', { name: 'Verification code' })).toBeVisible();
    expect(fapi.mfa.phoneCreations).toEqual(['+15555550303', '+15555550404']);
  });

  it.each([
    { country: 'United States', input: '+15555550303', changed: '+15555550404', canonical: '+15555550303' },
    { country: 'United Kingdom', input: '+447400123456', changed: '+447400123457', canonical: '+447400123456' },
  ])(
    'reuses the original $country phone after editing and restoring a failed SMS setup',
    async ({ input, changed, canonical }) => {
      const fapi = await renderMfa(fapiUser({ id: 'user_1' }));
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Add verification method' }));
      await user.click(screen.getByRole('button', { name: /SMS verification/ }));
      const number = screen.getByRole('textbox', { name: 'Phone' });
      await user.click(number);
      await user.paste(input);
      const prepare = holdRequests('post', '/v1/me/phone_numbers/phone_1/prepare_verification');
      await user.click(screen.getByRole('button', { name: 'Send code' }));
      await waitFor(() => expect(prepare.requests).toHaveLength(1));
      prepare.fail('phone_number_invalid', 'Unable to send a code.');
      await waitFor(() => expect(screen.getByText('Unable to send a code.')).toBeVisible());
      serveFapi(fapi);
      await user.clear(number);
      await user.paste(changed);
      await user.clear(number);
      await user.click(number);
      await user.paste(input);
      await user.click(screen.getByRole('button', { name: 'Send code' }));
      expect(await screen.findByRole('textbox', { name: 'Verification code' })).toBeVisible();
      expect(fapi.mfa.phoneCreations).toEqual([canonical]);
      expect(fapi.mfa.phonePreparations).toEqual(['phone_1']);
    },
  );

  it('reuses the original phone after two different SMS preparations fail', async () => {
    const fapi = await renderMfa(fapiUser({ id: 'user_1' }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    const number = screen.getByRole('textbox', { name: 'Phone' });
    for (const [input, id] of [
      ['5555550303', 'phone_1'],
      ['5555550404', 'phone_2'],
    ] as const) {
      await user.clear(number);
      await user.type(number, input);
      const prepare = holdRequests('post', `/v1/me/phone_numbers/${id}/prepare_verification`);
      await user.click(screen.getByRole('button', { name: 'Send code' }));
      await waitFor(() => expect(prepare.requests).toHaveLength(1));
      prepare.fail('phone_number_invalid', 'Unable to send a code.');
      await waitFor(() => expect(screen.getByText('Unable to send a code.')).toBeVisible());
      await waitFor(() => expect(number).not.toHaveAttribute('readonly'));
      serveFapi(fapi);
    }
    await user.clear(number);
    await user.type(number, '5555550303');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(await screen.findByRole('textbox', { name: 'Verification code' })).toBeVisible();
    expect(fapi.mfa.phoneCreations).toEqual(['+15555550303', '+15555550404']);
    expect(fapi.mfa.phonePreparations).toEqual(['phone_1']);
    await user.type(screen.getByRole('textbox', { name: 'Verification code' }), '123456');
    expect(await screen.findByText('CODE0001')).toBeVisible();
    expect(fapi.mfa.phoneUpdates).toEqual([{ id: 'phone_1', reserved: true, default: undefined }]);
  });
});
