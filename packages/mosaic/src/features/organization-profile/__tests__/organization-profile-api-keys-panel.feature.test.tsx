import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiApiKey,
  fapiClient,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { OrganizationProfileApiKeysPanel } from '../organization-profile-api-keys-panel';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });

const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  organization_memberships: [fapiMembership(acme, { permissions: ['org:sys_api_keys:read'] })],
});

function serve(apiKeysSettings: { user_api_keys_enabled: boolean; orgs_api_keys_enabled: boolean }) {
  serveFapi({
    environment: fapiEnvironment({ api_keys_settings: apiKeysSettings }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: acme.id })]),
    apiKeys: [fapiApiKey({ id: 'ak_org', name: 'Org key', subject: acme.id })],
  });
}

describe('OrganizationProfileApiKeysPanel', () => {
  it("lists the organization's keys when organization API keys are enabled", async () => {
    serve({ user_api_keys_enabled: false, orgs_api_keys_enabled: true });
    await renderWithClerk(<OrganizationProfileApiKeysPanel />);

    expect(await screen.findByText('Org key')).toBeVisible();
  });

  it('renders the fallback when only user API keys are enabled', async () => {
    serve({ user_api_keys_enabled: true, orgs_api_keys_enabled: false });
    await renderWithClerk(<OrganizationProfileApiKeysPanel fallback={<p>Unavailable</p>} />);

    expect(await screen.findByText('Unavailable')).toBeVisible();
    expect(screen.queryByRole('table', { name: 'API Keys' })).toBeNull();
    expect(screen.queryByText('API Keys')).toBeNull();
  });
});
