import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { type FakeFapiSeed, fapiUrl, holdRequests, serveFapi, worker } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseAccount,
  fapiEnterpriseConnection,
  fapiEnvironment,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { MosaicProvider } from '../../../../mosaic-provider';
import { UserProfileEnterpriseAccountsSection } from '../user-profile-enterprise-accounts-section';
import { useUserProfileEnterpriseAccountsModel } from '../user-profile-enterprise-accounts-section.model';
import { custom, enterpriseAccountSeed as signedIn, enterpriseMember, okta } from './enterprise-accounts.fixtures';

async function renderSection(seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
  return { ...view, fapi };
}

describe('enterprise accounts', () => {
  it('propagates a linking failure untouched', async () => {
    const feedback = vi.fn<(error: Error) => void>();
    function Connect() {
      const model = useUserProfileEnterpriseAccountsModel();
      return model.status === 'ready' ? (
        <button
          type='button'
          onClick={() => void model.connect('okta').catch(feedback)}
        >
          Connect
        </button>
      ) : null;
    }
    serveFapi(signedIn());
    const { clerk } = await renderWithClerk(<Connect />);
    const user = clerk.user;
    if (!user) {
      throw new Error('Expected a signed-in user');
    }
    const cause = new Error('Failed to fetch');
    vi.spyOn(user, 'createExternalAccount').mockRejectedValue(cause);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect' }));
    await waitFor(() => expect(feedback).toHaveBeenCalledOnce());
    expect(feedback).toHaveBeenCalledWith(cause);
  });

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
    expect(screen.queryByRole('group', { name: 'Enterprise accounts' })).toBeNull();
  });

  it('hides the section when the user is signed out', async () => {
    await renderSection(signedIn({ client: fapiClient() }));
    expect(screen.queryByRole('group', { name: 'Enterprise accounts' })).toBeNull();
  });

  it('hides an empty section', async () => {
    await renderSection(signedIn({ enterpriseConnections: [] }));
    expect(screen.queryByRole('group', { name: 'Enterprise accounts' })).toBeNull();
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
      verification: fapiVerification('saml', {
        status: 'verified',
        error: { code: 'enterprise_error', message: 'Fix this account', long_message: 'Fix this account' },
      }),
    });
    const inactive = fapiEnterpriseAccount({
      id: 'enterprise_inactive',
      enterprise_connection_id: 'inactive',
      email_address: 'inactive@example.com',
    });
    if (!inactive.enterprise_connection) {
      throw new Error('Expected enterprise connection fixture');
    }
    inactive.enterprise_connection = {
      ...inactive.enterprise_connection,
      id: 'inactive',
      name: 'Inactive SAML',
      active: false,
      enterprise_connection_id: 'inactive',
    };
    const client = fapiClient([
      fapiSession({ id: 'sess_1', user: fapiUser({ ...enterpriseMember(), enterprise_accounts: [linked, inactive] }) }),
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
      fapiSession({ id: 'sess_1', user: fapiUser({ ...enterpriseMember(), enterprise_accounts: [linked] }) }),
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
    const pending = screen.getByRole('button', { name: 'Connect Acme Okta' });
    expect(pending).toHaveAttribute('aria-busy', 'true');
    expect(pending).toHaveTextContent('Connect');
    expect(screen.getByRole('progressbar', { name: 'Connecting' })).toBeInTheDocument();
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
          response: {
            object: 'external_account',
            verification: fapiVerification('saml', { status: 'unverified' }),
          },
          client: null,
        }),
      ),
    );
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('The connection could not start. Please try again.'),
    );
    expect(screen.getByRole('button', { name: 'Connect Acme Okta' })).toBeEnabled();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
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
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Acme is unavailable.'));
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
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Verify your session.'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Connect Acme Okta' })).toBeEnabled();
  });

  it('reports a network failure without opening a dialog', async () => {
    serveFapi(signedIn());
    worker.use(http.post(fapiUrl('/v1/me/external_accounts'), () => HttpResponse.error()));
    await renderWithClerk(<UserProfileEnterpriseAccountsSection />);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('The connection could not start. Please try again.'),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Connect Acme Okta' })).toBeEnabled();
  });

  it.each([
    { meta: undefined, message: 'La connexion a échoué.' },
    { meta: { param_name: 'enterprise_connection_id' }, message: 'Cette connexion est indisponible.' },
  ])('localizes a coded API error with $meta', async ({ meta, message }) => {
    serveFapi(signedIn());
    worker.use(
      http.post(fapiUrl('/v1/me/external_accounts'), () =>
        HttpResponse.json(
          { errors: [{ code: 'form_param_invalid', message: 'Server fallback', meta }] },
          { status: 422 },
        ),
      ),
    );
    await renderWithClerk(
      <MosaicProvider
        localization={{
          locale: 'fr-FR',
          overrides: {
            'errors.form_param_invalid': 'La connexion a échoué.',
            'errors.form_param_invalid__enterprise_connection_id': 'Cette connexion est indisponible.',
          },
        }}
      >
        <UserProfileEnterpriseAccountsSection />
      </MosaicProvider>,
    );
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(message));
  });

  it('suppresses immediate duplicate and competing clicks, then clears feedback on retry', async () => {
    await renderSection();
    const request = holdRequests('post', '/v1/me/external_accounts');
    const connect = await screen.findByRole('button', { name: 'Connect Acme Okta' });
    const other = screen.getByRole('button', { name: 'Connect Custom SAML' });
    act(() => {
      connect.click();
      connect.click();
      other.click();
    });
    await waitFor(() => expect(request.requests).toHaveLength(1));
    expect(connect).toHaveAttribute('aria-busy', 'true');
    expect(other).toBeDisabled();
    request.fail('enterprise_error', 'Retry this connection.');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Retry this connection.'));
    const retry = holdRequests('post', '/v1/me/external_accounts');
    await userEvent.setup().click(connect);
    await waitFor(() => expect(retry.requests).toHaveLength(1));
    expect(screen.queryByRole('alert')).toBeNull();
    retry.fail();
  });

  it('releases pending after the redirect grace period', async () => {
    const { clerk } = await renderSection();
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const connect = await screen.findByRole('button', { name: 'Connect Acme Okta' });
    await userEvent.setup().click(connect);
    await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
    expect(connect).toHaveAttribute('aria-busy', 'true');
    await waitFor(() => expect(connect).not.toHaveAttribute('aria-busy', 'true'), { timeout: 2500 });
    expect(connect).toBeEnabled();
  });

  it('localizes a client-defined missing redirect error', async () => {
    serveFapi(signedIn());
    worker.use(
      http.post(fapiUrl('/v1/me/external_accounts'), () =>
        HttpResponse.json({
          response: { object: 'external_account', verification: fapiVerification('saml', { status: 'unverified' }) },
          client: null,
        }),
      ),
    );
    await renderWithClerk(
      <MosaicProvider
        localization={{
          locale: 'fr-FR',
          overrides: {
            'errors.oauth_missing_verification_url': 'La connexion ne peut pas démarrer.',
          },
        }}
      >
        <UserProfileEnterpriseAccountsSection />
      </MosaicProvider>,
    );
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('La connexion ne peut pas démarrer.'));
  });

  it('preserves the section generic error override for empty API errors', async () => {
    serveFapi(signedIn());
    worker.use(
      http.post(fapiUrl('/v1/me/external_accounts'), () => HttpResponse.json({ errors: [] }, { status: 400 })),
    );
    await renderWithClerk(
      <MosaicProvider
        localization={{
          locale: 'fr-FR',
          overrides: {
            'errors.generic': 'Erreur globale.',
            'userProfileEnterpriseAccountsSection.errors.generic': 'La connexion a échoué. Réessayez.',
          },
        }}
      >
        <UserProfileEnterpriseAccountsSection />
      </MosaicProvider>,
    );
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('La connexion a échoué. Réessayez.'));
  });

  it.todo('challenges for session reverification before linking, resumes after success, and allows cancellation');
});
