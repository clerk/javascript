import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseConnection,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileEnterpriseAccountsSection } from '../user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section';

const member = fapiUser({
  id: 'user_member',
  organization_memberships: [fapiMembership(fapiOrganization({ id: 'org_acme' }))],
});
const okta = fapiEnterpriseConnection({ id: 'okta', name: 'Acme Okta', organization_id: 'org_acme' });

function serveMember(connections = [okta]) {
  return serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_member', user: member })]),
    environment: fapiEnvironment({
      user_settings: { enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false } },
    }),
    enterpriseConnections: connections,
  });
}

describe('enterprise linking server contract', () => {
  it('offers only active organization connections the user belongs to', async () => {
    serveMember([
      okta,
      fapiEnterpriseConnection({ id: 'inactive', active: false, organization_id: 'org_acme' }),
      fapiEnterpriseConnection({ id: 'unscoped', organization_id: null }),
      fapiEnterpriseConnection({ id: 'nonmember', organization_id: 'org_other' }),
      fapiEnterpriseConnection({
        id: 'disabled',
        allow_organization_account_linking: false,
        organization_id: 'org_acme',
      }),
    ]);
    await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    expect(await screen.findByRole('button', { name: 'Connect Acme Okta' })).toBeVisible();
    expect(screen.getAllByRole('button', { name: /^Connect / })).toHaveLength(1);
  });

  it('rejects a connection deactivated after it was offered', async () => {
    const fapi = serveMember();
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const connect = await screen.findByRole('button', { name: 'Connect Acme Okta' });
    fapi.enterpriseConnections = [{ ...okta, active: false }];
    await userEvent.setup().click(connect);
    expect(await screen.findByRole('alert')).toHaveTextContent('not found');
    expect(navigate).not.toHaveBeenCalled();
    expect(connect).toBeEnabled();
  });

  it('starts SAML with verification only and no pending account', async () => {
    const fapi = serveMember();
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    if (!clerk.user) {
      throw new Error('Expected signed-in user');
    }
    const create = vi.spyOn(clerk.user, 'createExternalAccount');
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
    const account = await create.mock.results[0]?.value;
    expect(account?.verification?.strategy).toBe('saml');
    expect(account?.provider).toBeUndefined();
    expect(fapi.client.sessions[0]?.user.external_accounts).toEqual([]);
    expect(fapi.client.sessions[0]?.user.enterprise_accounts).toEqual([]);
  });
});
