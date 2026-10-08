import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import { fapiUrl, holdRequests, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { MosaicProvider } from '../../../../mosaic-provider';
import { UserProfilePasskeysSection } from '../user-profile-passkeys-section';

afterEach(() => vi.restoreAllMocks());

function cancelledRegistration() {
  vi.spyOn(navigator, 'webdriver', 'get').mockReturnValue(false);
  const environment = fapiEnvironment();
  environment.user_settings.attributes.passkey.enabled = true;
  const state = serveFapi({
    environment,
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', passkeys: [] }) })]),
  });
  vi.spyOn(navigator.credentials, 'create').mockRejectedValue(new DOMException('Cancelled', 'NotAllowedError'));
  return state;
}

async function pendingResourceStatus() {
  const response = await fetch(fapiUrl('/v1/me/passkeys/passkey_1/attempt_verification'), {
    method: 'POST',
    body: new URLSearchParams({ strategy: 'passkey', public_key_credential: '{}' }),
  });
  return response.status;
}

it('removes the pending registration after cancellation, rather than merely hiding its row', async () => {
  cancelledRegistration();
  await renderWithClerk(<UserProfilePasskeysSection />);
  const cleanup = holdRequests('post', '/v1/me/passkeys/passkey_1');
  await userEvent.setup().click(screen.getByRole('button', { name: 'Add passkey' }));
  await waitFor(() => expect(cleanup.requests).toHaveLength(1));
  expect(new URL(cleanup.requests[0]?.url ?? '').searchParams.get('_method')).toBe('DELETE');
  cleanup.release();
  expect(await screen.findByRole('alert')).toBeVisible();
  expect(await pendingResourceStatus()).toBe(404);
});

it('retains the localized cancellation error when pending cleanup fails', async () => {
  cancelledRegistration();
  await renderWithClerk(
    <MosaicProvider
      localization={{ locale: 'fr-FR', messages: { errors: { passkey_registration_cancelled: 'Création annulée.' } } }}
    >
      <UserProfilePasskeysSection />
    </MosaicProvider>,
  );
  const cleanup = holdRequests('post', '/v1/me/passkeys/passkey_1');
  await userEvent.setup().click(screen.getByRole('button', { name: 'Add passkey' }));
  await waitFor(() => expect(cleanup.requests).toHaveLength(1));
  cleanup.fail('session_reverification_required', 'Cleanup requires reverification');
  expect(await screen.findByRole('alert')).toHaveTextContent('Création annulée.');
  expect(screen.getByRole('button', { name: 'Add passkey' })).toBeEnabled();
});
