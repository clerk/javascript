import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { type FakeFapiSeed, fapiUrl, holdRequests, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseAccount,
  fapiEnterpriseConnection,
  fapiEnvironment,
  fapiExternalAccount,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileEnterpriseAccountsSection } from '../user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section';

const okta = fapiEnterpriseConnection({ id: 'okta', name: 'Acme Okta' });
const custom = fapiEnterpriseConnection({ id: 'saml', name: 'Custom SAML' });

function signedIn(overrides: FakeFapiSeed = {}) {
  return {
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    environment: fapiEnvironment({
      user_settings: { enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false } },
    }),
    enterpriseConnections: [okta, custom],
    ...overrides,
  };
}

async function renderSection(seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
  return { ...view, fapi };
}

describe('enterprise accounts', () => {
  it('shows the fallback while Clerk loads', async () => {
    serveFapi(signedIn());
    const client = holdRequests('get', '/v1/client');
    const rendering = renderWithClerk(<UserProfileEnterpriseAccountsSection fallback={<p>Loading accounts</p>} />);

    await waitFor(() => expect(client.requests).toHaveLength(1));
    expect(screen.getByText('Loading accounts')).toBeInTheDocument();
    client.release();
    await rendering;
    expect(await screen.findByRole('button', { name: 'Connect Acme Okta' })).toBeInTheDocument();
  });

  it('hides the section when SSO is disabled', async () => {
    await renderSection(signedIn({ environment: fapiEnvironment() }));
    expect(screen.queryByRole('region', { name: 'Enterprise accounts' })).toBeNull();
  });

  it('hides the section when the user is signed out', async () => {
    await renderSection(signedIn({ client: fapiClient() }));
    expect(screen.queryByRole('region', { name: 'Enterprise accounts' })).toBeNull();
  });

  it('hides an empty section', async () => {
    await renderSection(signedIn({ enterpriseConnections: [] }));
    expect(screen.queryByRole('region', { name: 'Enterprise accounts' })).toBeNull();
  });

  it('shows only unlinked, organization-linkable connections', async () => {
    const nonLinkable = fapiEnterpriseConnection({
      id: 'other',
      name: 'Other SAML',
      allow_organization_account_linking: false,
    });
    await renderSection(signedIn({ enterpriseConnections: [okta, custom, nonLinkable] }));

    expect(await screen.findByRole('button', { name: 'Connect Acme Okta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect Custom SAML' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Other SAML' })).toBeNull();
  });

  it('shows linked accounts with errors and offers only unlinked connections', async () => {
    const linked = fapiEnterpriseAccount({
      id: 'enterprise_1',
      enterprise_connection_id: 'okta',
      email_address: 'linked@example.com',
      verification: fapiVerification('enterprise_sso', {
        status: 'verified',
        error: { code: 'enterprise_error', message: 'Fix this account', long_message: 'Fix this account' },
      }),
    });
    const inactive = fapiEnterpriseAccount({
      id: 'enterprise_inactive',
      enterprise_connection_id: 'inactive',
      email_address: 'inactive@example.com',
      enterprise_connection: fapiEnterpriseConnection({ id: 'inactive', name: 'Inactive SAML', active: false }),
    });
    const client = fapiClient([
      fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', enterprise_accounts: [linked, inactive] }) }),
    ]);
    await renderSection(
      signedIn({
        client,
        enterpriseConnections: [okta, custom, fapiEnterpriseConnection({ id: 'inactive', name: 'Inactive SAML' })],
      }),
    );

    expect(screen.queryByText('inactive@example.com')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Connect Inactive SAML' })).toBeNull();
    expect(screen.getByText('linked@example.com')).toBeInTheDocument();
    expect(screen.getByText('Requires action')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Acme Okta' })).toBeNull();
    expect(await screen.findByRole('button', { name: 'Connect Custom SAML' })).toBeInTheDocument();
  });

  it('keeps linked rows visible while connections load', async () => {
    const linked = fapiEnterpriseAccount({ id: 'enterprise_1', email_address: 'linked@example.com' });
    const client = fapiClient([
      fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', enterprise_accounts: [linked] }) }),
    ]);
    serveFapi(signedIn({ client }));
    const connections = holdRequests('get', '/v1/me/enterprise_connections');
    const rendering = renderWithClerk(<UserProfileEnterpriseAccountsSection />);

    expect(await screen.findByText('linked@example.com')).toBeInTheDocument();
    await waitFor(() => expect(connections.requests).toHaveLength(1));
    connections.release();
    await rendering;
  });

  it('sends the selected connection and current URL, then opens its redirect', async () => {
    const { clerk } = await renderSection();
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    const connect = await screen.findByRole('button', { name: 'Connect Acme Okta' });
    connect.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    expect(body.get('enterprise_connection_id')).toBe('okta');
    expect(body.get('redirect_url')).toBe(window.location.href);
    expect(screen.getByRole('button', { name: 'Connect Acme Okta' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Connect Custom SAML' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Connect Custom SAML' }));
    expect(request.requests).toHaveLength(1);

    request.release();
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(new URL('https://accounts.example/enterprise-authorize')),
    );
  });

  it('preserves modal return state in the redirect URL', async () => {
    serveFapi(signedIn());
    await renderWithClerk(<UserProfileEnterpriseAccountsSection mode='modal' />);
    const request = holdRequests('post', '/v1/me/external_accounts');

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    const encoded = new URL(body.get('redirect_url') || '').searchParams.get('__clerk_modal_state');
    expect(encoded).toBeTruthy();
    expect(JSON.parse(window.atob(encoded || ''))).toMatchObject({ componentName: 'UserProfile' });
    request.fail();
  });

  it('shows a missing redirect error and allows another attempt', async () => {
    serveFapi(signedIn());
    worker.use(
      http.post(fapiUrl('/v1/me/external_accounts'), () =>
        HttpResponse.json({
          response: fapiExternalAccount({
            id: 'idn_okta',
            provider: 'google',
            verification: fapiVerification('enterprise_sso', { status: 'unverified' }),
          }),
          client: null,
        }),
      ),
    );
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The connection could not start. Please try again.');
    expect(screen.getByRole('button', { name: 'Connect Acme Okta' })).toBeEnabled();
    serveFapi(signedIn());
    await user.click(screen.getByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(new URL('https://accounts.example/enterprise-authorize')),
    );
  });

  it('shows the API long message and succeeds after a manual retry', async () => {
    const { clerk } = await renderSection();
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('enterprise_error', 'Acme is unavailable.');
    expect(await screen.findByRole('alert')).toHaveTextContent('Acme is unavailable.');
    expect(navigate).not.toHaveBeenCalled();
    serveFapi(signedIn());
    await user.click(screen.getByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(new URL('https://accounts.example/enterprise-authorize')),
    );
  });

  it('shows a direct verification-required API error without opening a dialog', async () => {
    await renderSection();
    const request = holdRequests('post', '/v1/me/external_accounts');

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('session_reverification_required', 'Verify your session.');
    expect(await screen.findByRole('alert')).toHaveTextContent('Verify your session.');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Connect Acme Okta' })).toBeEnabled();
  });

  it('reports a network failure without opening a dialog', async () => {
    serveFapi(signedIn());
    worker.use(http.post(fapiUrl('/v1/me/external_accounts'), () => HttpResponse.error()));
    await renderWithClerk(<UserProfileEnterpriseAccountsSection />);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The connection could not start. Please try again.');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Connect Acme Okta' })).toBeEnabled();
  });
});
