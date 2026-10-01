import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { type FakeFapiSeed, fapiUrl, holdRequests, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiExternalAccount,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileConnectedAccountsSection } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section';

const google = fapiExternalAccount({ id: 'idn_google', provider: 'google', username: 'jdoe' });
const github = fapiExternalAccount({ id: 'idn_github', provider: 'github' });
const disconnectedGoogle = fapiExternalAccount({
  id: 'idn_google',
  provider: 'google',
  verification: fapiVerification({
    status: 'unverified',
    strategy: 'google_one_tap',
    error: { code: 'external_account_missing_refresh_token', message: 'Missing token', long_message: 'Missing token' },
  }),
});

function signedIn(accounts = [google], overrides: FakeFapiSeed = {}) {
  return {
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', external_accounts: accounts }) })]),
    environment: fapiEnvironment({
      user_settings: {
        social: {
          oauth_google: {
            enabled: true,
            required: false,
            authenticatable: true,
            strategy: 'oauth_google',
            name: 'Google',
            logo_url: null,
          },
          oauth_github: {
            enabled: true,
            required: false,
            authenticatable: true,
            strategy: 'oauth_github',
            name: 'GitHub',
            logo_url: null,
          },
        },
      },
    }),
    ...overrides,
  };
}

async function renderSection(accounts = [google], overrides: FakeFapiSeed = {}) {
  const fapi = serveFapi(signedIn(accounts, overrides));
  const view = await renderWithClerk(<UserProfileConnectedAccountsSection />);
  return { ...view, fapi };
}

async function openRemoval(user: ReturnType<typeof userEvent.setup>, provider: string) {
  await user.click(screen.getByRole('button', { name: `Manage ${provider}` }));
  await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
  return screen.getByRole('alertdialog');
}

describe('connected accounts', () => {
  it('shows the fallback while Clerk loads', async () => {
    serveFapi(signedIn());
    const client = holdRequests('get', '/v1/client');
    const rendering = renderWithClerk(<UserProfileConnectedAccountsSection fallback={<p>Loading accounts</p>} />);

    await waitFor(() => expect(client.requests).toHaveLength(1));
    expect(screen.getByText('Loading accounts')).toBeInTheDocument();
    client.release();
    await rendering;
    expect(screen.getByRole('heading', { name: 'Connected accounts' })).toBeInTheDocument();
  });

  it('shows connected accounts and offers remaining providers', async () => {
    await renderSection();

    expect(screen.getByRole('heading', { name: 'Connected accounts' })).toBeInTheDocument();
    expect(screen.getByText('jdoe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Google' })).toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('hides the section when no social provider is enabled', async () => {
    await renderSection([], { environment: fapiEnvironment() });
    expect(screen.queryByRole('heading', { name: 'Connected accounts' })).toBeNull();
  });

  it('hides Connect when an enterprise connection blocks new identifications', async () => {
    const enterprise = fapiEnterpriseAccount({ id: 'sso_account_1' });
    const user = fapiUser({ id: 'user_1', external_accounts: [google], enterprise_accounts: [enterprise] });
    const environment = signedIn().environment;
    await renderSection([google], {
      client: fapiClient([fapiSession({ id: 'sess_1', user })]),
      environment: {
        ...environment,
        user_settings: {
          ...environment.user_settings,
          enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false },
        },
      },
    });

    expect(screen.getByRole('button', { name: 'Manage Google' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Connect/ })).toBeNull();
  });

  it('shows a provider verification error', async () => {
    const failed = fapiExternalAccount({
      id: 'idn_google',
      provider: 'google',
      verification: fapiVerification({
        status: 'unverified',
        strategy: 'oauth_google',
        error: { code: 'provider_error', message: 'Provider error', long_message: 'Provider error' },
      }),
    });
    await renderSection([failed]);

    expect(screen.getByText('Provider error')).toBeInTheDocument();
  });

  it('retries a canceled connection from its row instead of offering Connect again', async () => {
    const canceled = fapiExternalAccount({
      id: 'idn_google',
      provider: 'google',
      verification: fapiVerification({
        status: 'unverified',
        strategy: 'oauth_google',
        error: {
          code: 'oauth_access_denied',
          message: 'Access denied',
          long_message: 'You did not grant access to your Google account',
        },
      }),
    });
    const { clerk } = await renderSection([canceled]);
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    expect(screen.getByText('You did not grant access to your Google account')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Google' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Try again' }));

    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    expect(body.get('strategy')).toBe('oauth_google');
    request.release();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize'));
  });

  it('sends requested scopes and the current URL to connect', async () => {
    serveFapi(signedIn([]));
    const { clerk } = await renderWithClerk(
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ github: ['repo'] }} />,
    );
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    expect(body.get('strategy')).toBe('oauth_github');
    expect(body.get('redirect_url')).toBe(window.location.href);
    expect(body.get('additional_scope')).toBe('repo');
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toHaveAttribute('aria-busy', 'true');

    request.release();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize'));
  });

  it('shows a failed connection and allows retrying', async () => {
    const { clerk } = await renderSection([]);
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('oauth_error', 'GitHub is unavailable right now.');

    expect(await screen.findByText('GitHub is unavailable right now.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toBeEnabled();
    serveFapi(signedIn([]));
    await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize'));
  });

  it('keeps only the chosen Connect action pending', async () => {
    await renderSection([]);
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();
    const githubButton = screen.getByRole('button', { name: 'Connect GitHub' });

    await user.click(githubButton);
    await waitFor(() => expect(request.requests).toHaveLength(1));
    await user.click(screen.getByRole('button', { name: 'Connect Google' }));
    expect(request.requests).toHaveLength(1);
    expect(githubButton).toHaveAttribute('aria-busy', 'true');
    request.fail();
  });

  it('shows a verification-required Connect error', async () => {
    await renderSection([]);
    const request = holdRequests('post', '/v1/me/external_accounts');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('session_reverification_required', 'Verify your session.');
    expect(await screen.findByText('Verify your session.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toBeEnabled();
  });

  it('shows the OAuth error when FAPI returns no verification URL', async () => {
    serveFapi(signedIn([]));
    worker.use(
      http.post(fapiUrl('/v1/me/external_accounts'), () =>
        HttpResponse.json({
          response: fapiExternalAccount({
            id: 'idn_github',
            provider: 'github',
            verification: fapiVerification({ status: 'unverified', strategy: 'oauth_github' }),
          }),
          client: null,
        }),
      ),
    );
    await renderWithClerk(<UserProfileConnectedAccountsSection />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    expect(await screen.findByText('OAuth flow did not receive a verification URL.')).toBeInTheDocument();
  });

  it('preserves modal state when connecting', async () => {
    serveFapi(signedIn([]));
    await renderWithClerk(<UserProfileConnectedAccountsSection mode='modal' />);
    const request = holdRequests('post', '/v1/me/external_accounts');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    const encoded = new URL(body.get('redirect_url') || '').searchParams.get('__clerk_modal_state');
    expect(encoded).toBeTruthy();
    expect(JSON.parse(window.atob(encoded || ''))).toMatchObject({
      componentName: 'UserProfile',
      socialProvider: 'github',
    });
    request.fail();
  });

  it('opens the OAuth transport and reloads the user with the callback nonce', async () => {
    serveFapi(signedIn([]));
    const open = vi.fn(() => Promise.resolve({ callbackUrl: 'myapp://sso-callback?rotating_token_nonce=abc' }));
    await renderWithClerk(<UserProfileConnectedAccountsSection />, {
      __internal_oauthTransport: { getRedirectUrl: () => 'myapp://sso-callback', open },
    });
    const request = holdRequests('get', '/v1/me');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(open).toHaveBeenCalledWith(new URL('https://accounts.example/authorize')));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    expect(new URL(request.requests[0]?.url || '').searchParams.get('rotating_token_nonce')).toBe('abc');
    request.release();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Connect GitHub' })).not.toHaveAttribute('aria-busy', 'true'),
    );
  });

  it('recreates a disconnected account', async () => {
    serveFapi(signedIn([disconnectedGoogle]));
    const { clerk } = await renderWithClerk(<UserProfileConnectedAccountsSection />);
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));

    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    expect(body.get('strategy')).toBe('oauth_google');
    request.release();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize'));
  });

  it('shows a verification-required Reconnect error and permits another attempt', async () => {
    const { clerk } = await renderSection([disconnectedGoogle]);
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('session_reverification_required', 'Verify your session.');
    expect(await screen.findByText('Verify your session.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    expect(screen.getByRole('menuitem', { name: 'Reconnect' })).toBeEnabled();
    serveFapi(signedIn([disconnectedGoogle]));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize'));
  });

  it('preserves modal state when reconnecting', async () => {
    serveFapi(signedIn([disconnectedGoogle]));
    await renderWithClerk(<UserProfileConnectedAccountsSection mode='modal' />);
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    const encoded = new URL(body.get('redirect_url') || '').searchParams.get('__clerk_modal_state');
    expect(encoded).toBeTruthy();
    expect(JSON.parse(window.atob(encoded || ''))).toMatchObject({ componentName: 'UserProfile' });
    request.fail();
  });

  it('reauthorizes a connected account when it lacks requested scopes', async () => {
    serveFapi(signedIn([google]));
    const { clerk } = await renderWithClerk(
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ google: ['email', 'calendar'] }} />,
    );
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts/idn_google/reauthorize');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    expect(new URL(request.requests[0]?.url || '').searchParams.get('_method')).toBe('PATCH');
    expect(body.getAll('additional_scope')).toEqual(['email', 'calendar']);
    request.release();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/consent'));
  });

  it('shows a failed reauthorization and allows another attempt', async () => {
    serveFapi(signedIn([google]));
    const { clerk } = await renderWithClerk(
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ google: ['calendar'] }} />,
    );
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts/idn_google/reauthorize');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('oauth_error', 'Calendar access was denied.');
    expect(await screen.findByText('Calendar access was denied.')).toBeInTheDocument();

    serveFapi(signedIn([google]));
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/consent'));
  });

  it('removes the selected account and closes the confirmation', async () => {
    const { fapi } = await renderSection([google, github]);
    const user = userEvent.setup();
    const dialog = await openRemoval(user, 'GitHub');

    expect(dialog).toHaveAccessibleName('Remove connected account');
    expect(screen.queryByRole('textbox')).toBeNull();
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.external_accounts.map(account => account.id)).toEqual(['idn_google']);
  });

  it('returns focus to the account menu when removal is canceled', async () => {
    await renderSection();
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Manage Google' });

    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Remove' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('keeps removal pending until the request completes', async () => {
    const { fapi } = await renderSection([google, github]);
    const request = holdRequests('post', '/v1/me/external_accounts/idn_github');
    const user = userEvent.setup();
    const dialog = await openRemoval(user, 'GitHub');

    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    expect(within(dialog).getByRole('button', { name: 'Remove' })).toHaveAttribute('aria-busy', 'true');
    expect(fapi.client.sessions[0]?.user.external_accounts).toHaveLength(2);

    request.release();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.external_accounts).toHaveLength(1);
  });

  it('keeps the confirmation open on a removal error and allows retrying', async () => {
    await renderSection([google]);
    const request = holdRequests('post', '/v1/me/external_accounts/idn_google');
    const user = userEvent.setup();
    const dialog = await openRemoval(user, 'Google');

    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('last_identification', 'You cannot remove your last sign-in method.');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('You cannot remove your last sign-in method.');

    serveFapi(signedIn([google]));
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('keeps the confirmation open when removal needs reverification', async () => {
    await renderSection([google]);
    const request = holdRequests('post', '/v1/me/external_accounts/idn_google');
    const dialog = await openRemoval(userEvent.setup(), 'Google');

    await userEvent.setup().click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('session_reverification_required', 'Verify your session.');
    expect(await within(dialog).findByText('Verify your session.')).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName('Remove connected account');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(within(dialog).queryByRole('textbox')).toBeNull();
    expect(within(dialog).queryByLabelText('Password')).toBeNull();
    expect(within(dialog).getByRole('button', { name: 'Remove' })).not.toHaveAttribute('aria-busy', 'true');
  });

  it('targets the account selected after canceling another removal', async () => {
    const { fapi } = await renderSection([google, github]);
    const user = userEvent.setup();

    const first = await openRemoval(user, 'Google');
    expect(first).toHaveAccessibleDescription(/Google will be removed/);
    await user.click(within(first).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());

    const second = await openRemoval(user, 'GitHub');
    expect(second).toHaveAccessibleDescription(/GitHub will be removed/);
    await user.click(within(second).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.client.sessions[0]?.user.external_accounts.map(account => account.id)).toEqual(['idn_google']);
  });

  it('focuses the next account and then Connect as accounts are removed', async () => {
    await renderSection([google, github]);
    const user = userEvent.setup();

    const first = await openRemoval(user, 'Google');
    await user.click(within(first).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage GitHub' })).toHaveFocus());

    const second = await openRemoval(user, 'GitHub');
    await user.click(within(second).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Connect GitHub' })).toHaveFocus());
  });
});
