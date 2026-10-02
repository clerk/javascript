import { act, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfilePasskeysSection } from '../user-profile-passkeys-section/user-profile-passkeys-section';

function servePasskeys() {
  vi.spyOn(navigator, 'webdriver', 'get').mockReturnValue(false);
  const environment = fapiEnvironment();
  environment.user_settings.attributes.passkey.enabled = true;
  return serveFapi({
    environment,
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
  });
}

afterEach(() => vi.restoreAllMocks());

describe('Updating the rendered passkey policy', () => {
  it('removes passkeys after the environment is replaced', async () => {
    const fapi = servePasskeys();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    expect(screen.getByRole('group', { name: 'Passkeys' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add passkey' })).toBeVisible();

    const environment = fapiEnvironment();
    environment.user_settings.attributes.passkey.enabled = false;
    fapi.environment = environment;
    await act(() => clerk.__internal_setEnvironment(environment));

    await waitFor(() => expect(screen.queryByRole('group', { name: 'Passkeys' })).toBeNull());
    expect(screen.queryByRole('button', { name: 'Add passkey' })).toBeNull();
  });

  it('removes passkeys after the existing environment fetches disabled policy', async () => {
    const fapi = servePasskeys();
    const { clerk } = await renderWithClerk(<UserProfilePasskeysSection />);
    expect(screen.getByRole('group', { name: 'Passkeys' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add passkey' })).toBeVisible();
    const environment = clerk.__internal_environment;
    if (!environment) {
      throw new Error('Missing loaded environment');
    }

    fapi.environment.user_settings.attributes.passkey.enabled = false;
    await act(() => environment.fetch());

    expect(clerk.__internal_environment).toBe(environment);
    await waitFor(() => expect(screen.queryByRole('group', { name: 'Passkeys' })).toBeNull());
    expect(screen.queryByRole('button', { name: 'Add passkey' })).toBeNull();
  });
});
