import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiApiKey, fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileApiKeysPanel } from '../user-profile-api-keys-panel';

const alice = fapiUser({ id: 'user_1', first_name: 'Alice' });

function serve(userAPIKeysEnabled: boolean) {
  serveFapi({
    environment: fapiEnvironment({ api_keys_settings: { user_api_keys_enabled: userAPIKeysEnabled } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]),
    apiKeys: [fapiApiKey({ id: 'ak_1', name: 'Web app', subject: alice.id })],
  });
}

describe('UserProfileApiKeysPanel', () => {
  it("lists the user's keys when user API keys are enabled", async () => {
    serve(true);
    await renderWithClerk(<UserProfileApiKeysPanel />);

    expect(await screen.findByText('Web app')).toBeVisible();
  });

  it('renders the fallback when user API keys are disabled', async () => {
    serve(false);
    await renderWithClerk(<UserProfileApiKeysPanel fallback={<p>Unavailable</p>} />);

    expect(await screen.findByText('Unavailable')).toBeVisible();
    expect(screen.queryByRole('table', { name: 'API Keys' })).toBeNull();
    expect(screen.queryByText('API Keys')).toBeNull();
  });
});
