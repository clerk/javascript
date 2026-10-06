import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseAccount,
  fapiEnterpriseConnection,
  fapiExternalAccount,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileEnterpriseAccountsSection } from '../user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section';
import { enterpriseAccountSeed, enterpriseMember, okta } from './enterprise-accounts.fixtures';

function serveMember(connections = [okta]) {
  return serveFapi(enterpriseAccountSeed({ enterpriseConnections: connections }));
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

  it.each(['inactive', 'unscoped', 'linking disabled', 'nonmember', 'feature disabled'] as const)(
    'rejects an offered connection that becomes %s',
    async change => {
      const fapi = serveMember();
      const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
      const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
      const connect = await screen.findByRole('button', { name: 'Connect Acme Okta' });
      if (change === 'inactive') {
        fapi.enterpriseConnections = [{ ...okta, active: false }];
      } else if (change === 'unscoped') {
        fapi.enterpriseConnections = [{ ...okta, organization_id: null }];
      } else if (change === 'linking disabled') {
        fapi.enterpriseConnections = [{ ...okta, allow_organization_account_linking: false }];
      } else if (change === 'nonmember') {
        fapi.client = fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]);
      } else {
        fapi.enterpriseLinking.enabled = false;
      }
      await userEvent.setup().click(connect);
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          change === 'linking disabled' || change === 'feature disabled' ? 'Feature not enabled' : 'not found',
        ),
      );
      expect(navigate).not.toHaveBeenCalled();
      expect(connect).toBeEnabled();
    },
  );

  it('discovers memberships independently for each user', async () => {
    serveFapi(
      enterpriseAccountSeed({
        client: fapiClient([
          fapiSession({ id: 'sess_1', user: enterpriseMember() }),
          fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2' }) }),
        ]),
      }),
    );
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    expect(await screen.findByRole('button', { name: 'Connect Acme Okta' })).toBeVisible();
    await act(() => clerk.setActive({ session: 'sess_2' }));
    await waitFor(() => expect(screen.queryByRole('group', { name: 'Enterprise accounts' })).toBeNull());
    expect(clerk.user?.id).toBe('user_2');
    expect(await clerk.user?.getEnterpriseConnections({ withOrganizationAccountLinking: true })).toEqual([]);
    await act(() => clerk.setActive({ session: 'sess_1' }));
    expect(await screen.findByRole('button', { name: 'Connect Acme Okta' })).toBeVisible();
  });

  it('keeps discovery independent of the POST-only feature flag', async () => {
    serveFapi(enterpriseAccountSeed({ enterpriseLinking: {} }));
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Feature not enabled'));
    expect(navigate).not.toHaveBeenCalled();
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
    expect(account?.provider).toBe('');
    expect(account?.id).toBeUndefined();
    expect(fapi.client.sessions[0]?.user.external_accounts).toEqual([]);
    expect(fapi.client.sessions[0]?.user.enterprise_accounts).toEqual([]);
  });

  it.each(['saml', 'oidc'] as const)(
    'shows the explicit %s callback result after reloading the returned page',
    async protocol => {
      const connection =
        protocol === 'saml'
          ? okta
          : fapiEnterpriseConnection({
              id: 'oidc',
              name: 'Acme OIDC',
              organization_id: 'org_acme',
              provider: 'oidc_custom',
              oauth_config: {
                id: 'oauthcfg_1',
                name: 'Acme OIDC',
                client_id: 'oauth_client',
                provider_key: 'custom_mock',
                created_at: 0,
                updated_at: 0,
              },
            });
      const pending = {
        ...fapiExternalAccount({
          id: 'idn_oidc',
          provider: 'custom_mock',
          verification: fapiVerification('oauth_custom_mock', {
            status: 'unverified',
            external_verification_redirect_url: 'https://accounts.example/oidc-authorize',
          }),
        }),
        provider: 'oauth_custom_mock',
      };
      const fapi = serveFapi(
        enterpriseAccountSeed({
          enterpriseConnections: [connection],
          enterpriseLinking: {
            enabled: true,
            preparations: {
              [connection.id]:
                protocol === 'saml'
                  ? {
                      kind: 'saml',
                      verification: fapiVerification('saml', {
                        status: 'unverified',
                        external_verification_redirect_url: 'https://accounts.example/saml-authorize',
                      }),
                    }
                  : { kind: 'oidc', account: pending },
            },
          },
        }),
      );
      let queries = 0;
      worker.use(
        http.get(fapiUrl('/v1/me/enterprise_connections'), () => {
          queries++;
        }),
      );
      const view = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
      const navigate = vi.spyOn(view.clerk, '__internal_windowNavigate').mockImplementation(() => {});
      const responsePayload = new Promise<unknown>(resolve => {
        const capture = ({ request, response }: { request: Request; response: Response }) => {
          if (request.method === 'POST' && new URL(request.url).pathname === '/v1/me/external_accounts') {
            worker.events.removeListener('response:mocked', capture);
            resolve(response.clone().json());
          }
        };
        worker.events.on('response:mocked', capture);
      });

      await userEvent.setup().click(await screen.findByRole('button', { name: `Connect ${connection.name}` }));
      await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
      if (protocol === 'oidc') {
        expect(await responsePayload).toMatchObject({
          response: { provider: 'oauth_custom_mock', verification: { strategy: 'oauth_custom_mock' } },
        });
      } else {
        expect(await responsePayload).toMatchObject({
          response: { object: 'external_account', verification: { strategy: 'saml' } },
        });
      }

      expect(fapi.client.sessions[0]?.user.external_accounts).toEqual([]);
      expect(fapi.enterpriseLinking.pendingExternalAccounts).toEqual(
        protocol === 'oidc' ? [{ userId: 'user_1', connectionId: connection.id, account: pending }] : [],
      );
      expect(fapi.client.sessions[0]?.user.enterprise_accounts).toEqual([]);
      const linked = fapiEnterpriseAccount({
        id: 'ent_linked',
        protocol: protocol === 'saml' ? 'saml' : 'oauth',
        provider: protocol === 'saml' ? 'saml_okta' : 'oauth_custom_mock',
        email_address: 'linked@example.com',
        enterprise_connection_id: protocol === 'saml' ? connection.id : null,
        verification: fapiVerification(protocol === 'saml' ? 'saml' : 'oauth_custom_mock', { status: 'verified' }),
      });
      if (!linked.enterprise_connection) {
        throw new Error('Expected enterprise connection fixture');
      }
      linked.enterprise_connection = {
        ...linked.enterprise_connection,
        id: protocol === 'saml' ? connection.id : 'oauthcfg_1',
        name: connection.name,
        protocol: linked.protocol,
        provider: linked.provider,
        enterprise_connection_id: protocol === 'saml' ? connection.id : null,
      };
      const completed = fapiUser({
        ...enterpriseMember(),
        enterprise_accounts: [linked],
        external_accounts: [],
      });
      fapi.client = fapiClient([fapiSession({ id: 'sess_1', user: completed })]);
      fapi.enterpriseLinking.verifiedLinks = [{ userId: completed.id, connectionId: connection.id }];
      fapi.enterpriseLinking.pendingExternalAccounts = [];
      await act(async () => {
        if (!view.clerk.client) {
          throw new Error('Expected loaded client');
        }
        await view.clerk.client.reload();
        await view.clerk.setActive({ session: 'sess_1' });
      });
      expect(await screen.findByText('linked@example.com')).toBeVisible();
      const initialQueries = queries;
      view.rerender(<UserProfileEnterpriseAccountsSection key='returned-page' />);
      await waitFor(() => expect(queries).toBeGreaterThan(initialQueries));
      await waitFor(() => expect(screen.queryByRole('button', { name: `Connect ${connection.name}` })).toBeNull());
      expect(await view.clerk.user?.getEnterpriseConnections({ withOrganizationAccountLinking: true })).toEqual([]);
    },
  );

  it('rejects a stale SAML offer after that connection has been claimed', async () => {
    const fapi = serveMember();
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const connect = await screen.findByRole('button', { name: 'Connect Acme Okta' });
    fapi.enterpriseLinking.verifiedLinks = [{ userId: 'user_1', connectionId: okta.id }];
    await userEvent.setup().click(connect);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'An enterprise account is already connected for this connection email: user_1@example.com',
      ),
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it('rejects SAML linking when the primary email no longer exists', async () => {
    const fapi = serveMember();
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const connect = await screen.findByRole('button', { name: 'Connect Acme Okta' });
    fapi.client = fapiClient([
      fapiSession({
        id: 'sess_1',
        user: { ...enterpriseMember(), primary_email_address_id: null, email_addresses: [] },
      }),
    ]);
    await userEvent.setup().click(connect);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('not found'));
    expect(navigate).not.toHaveBeenCalled();
  });
});
