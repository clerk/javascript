import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfilePasskeysSection } from '../user-profile-passkeys-section/user-profile-passkeys-section';

function serveRegistration(passkeys = { name: 'Chrome on macOS', authenticatorName: '' }) {
  const environment = fapiEnvironment();
  environment.user_settings.attributes.passkey.enabled = true;
  vi.spyOn(navigator, 'webdriver', 'get').mockReturnValue(false);
  vi.spyOn(navigator.credentials, 'create').mockResolvedValue({
    id: 'credential_1',
    type: 'public-key',
    rawId: new Uint8Array([1, 2, 3]).buffer,
    authenticatorAttachment: 'platform',
    response: {
      clientDataJSON: new TextEncoder().encode('{}').buffer,
      attestationObject: new Uint8Array([4, 5, 6]).buffer,
      getTransports: () => ['internal'],
    },
  });
  const seed = {
    environment,
    passkeys,
    client: fapiClient([
      fapiSession({ id: 'sess_a', user: fapiUser({ id: 'user_a' }) }),
      fapiSession({ id: 'sess_b', user: fapiUser({ id: 'user_b' }) }),
    ]),
  };
  return serveFapi(seed);
}

afterEach(() => vi.restoreAllMocks());

describe('Registering passkeys against the backend contract', () => {
  it('rejects another user verifying a pending registration without changing either account', async () => {
    const fapi = serveRegistration();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    const alice = clerk.user;
    if (!alice) {
      throw new Error('Missing Alice');
    }
    const creation = holdRequests('post', '/v1/me/passkeys');
    const outcome = alice.createPasskey().then(
      result => result,
      (error: unknown) => error,
    );
    await waitFor(() => expect(creation.requests).toHaveLength(1));
    await act(() => clerk.setActive({ session: 'sess_b' }));
    creation.release();
    expect(await outcome).toMatchObject({ status: 403, errors: [{ code: 'resource_forbidden' }] });
    expect(fapi.client.sessions.map(session => session.user.passkeys)).toEqual([[], []]);
    expect(screen.queryByText('Chrome on macOS')).toBeNull();
  });

  it.each([
    { minutes: 2, expired: false },
    { minutes: 10, expired: true },
  ])('handles verification after $minutes minutes', async ({ minutes, expired }) => {
    const fapi = serveRegistration();
    await renderWithClerk(<UserProfilePasskeysSection />);
    const verification = holdRequests('post', '/v1/me/passkeys/passkey_1/attempt_verification');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Add passkey' }));
    await waitFor(() => expect(verification.requests).toHaveLength(1));
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + minutes * 60_000);
    verification.release();
    if (expired) {
      expect(await screen.findByRole('alert')).toBeVisible();
      expect(fapi.client.sessions[0]?.user.passkeys).toEqual([]);
    } else {
      expect(await screen.findByText('Chrome on macOS')).toBeVisible();
      expect(screen.queryByRole('alert')).toBeNull();
    }
  });

  it.each([
    { name: 'Firefox on Windows', authenticatorName: '', expected: 'Firefox on Windows' },
    { name: 'Chrome on macOS', authenticatorName: 'iCloud Keychain', expected: 'iCloud Keychain' },
  ])('shows $expected after registration', async ({ name, authenticatorName, expected }) => {
    const fapi = serveRegistration({ name, authenticatorName });
    await renderWithClerk(<UserProfilePasskeysSection />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Add passkey' }));
    expect(await screen.findByText(expected)).toBeVisible();
    expect(fapi.client.sessions[0]?.user.passkeys[0]?.name).toBe(expected);
  });
});
