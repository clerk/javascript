import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, holdRequests, serveFapi, worker } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiExternalAccount,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { MosaicProvider } from '../../../../mosaic-provider';
import { UserProfileProvider } from '../../user-profile.provider';
import { UserProfileConnectedAccountsSection } from '../user-profile-connected-accounts-section';
import {
  deferred,
  disconnectedGoogle,
  google,
  renderSection,
  signedIn,
  startReconnect,
} from './user-profile-connected-accounts.fixtures';

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

    expect(screen.getByRole('heading', { name: 'Account', level: 2 })).toBeVisible();
    expect(screen.getByRole('group', { name: 'Connected accounts' })).toBeVisible();
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

  it('offers enabled providers when no accounts are connected', async () => {
    await renderSection([]);

    expect(screen.getByRole('button', { name: 'Connect Google' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Manage/ })).toBeNull();
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
      verification: fapiVerification('oauth_google', {
        status: 'unverified',
        error: { code: 'provider_error', message: 'Provider error', long_message: 'Provider error' },
      }),
    });
    await renderSection([failed]);

    expect(screen.getByText('Provider error')).toBeInTheDocument();
  });

  it('sends requested scopes and the current URL to connect', async () => {
    serveFapi(signedIn([]));
    const { clerk } = await renderWithClerk(
      <UserProfileProvider additionalOAuthScopes={{ github: ['repo'] }}>
        <UserProfileConnectedAccountsSection />
      </UserProfileProvider>,
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
            verification: fapiVerification('oauth_github', { status: 'unverified' }),
          }),
          client: null,
        }),
      ),
    );
    await renderWithClerk(<UserProfileConnectedAccountsSection />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    expect(await screen.findByText('The connection could not start. Please try again.')).toBeInTheDocument();
  });

  it('preserves modal state when connecting', async () => {
    serveFapi(signedIn([]));
    await renderWithClerk(
      <UserProfileProvider mode='modal'>
        <UserProfileConnectedAccountsSection />
      </UserProfileProvider>,
    );
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

  it.each(['switch', 'sign out'] as const)('aborts Connect after %s during redirect preparation', async change => {
    const fapi = serveFapi(
      signedIn([], {
        client: fapiClient([
          fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', external_accounts: [] }) }),
          fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', external_accounts: [] }) }),
        ]),
      }),
    );
    const redirect = deferred<string>();
    const getRedirectUrl = vi.fn(() => redirect.promise);
    const open = vi.fn(() => Promise.resolve({ callbackUrl: 'https://app.example/callback' }));
    const { clerk } = await renderWithClerk(<UserProfileConnectedAccountsSection />, {
      __internal_oauthTransport: { getRedirectUrl, open },
    });
    const original = clerk.user;
    if (!original) {
      throw new Error('Expected signed-in user');
    }
    const create = vi.spyOn(original, 'createExternalAccount');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    expect(getRedirectUrl).toHaveBeenCalledOnce();
    await act(() => (change === 'switch' ? clerk.setActive({ session: 'sess_2' }) : clerk.signOut()));
    expect(clerk.user?.id).toBe(change === 'switch' ? 'user_2' : undefined);
    await act(async () => {
      redirect.resolve('https://app.example/callback');
      await redirect.promise;
    });
    expect(create).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    if (change === 'switch') {
      expect(fapi.client.sessions[1]?.user.external_accounts).toEqual([]);
    }
  });

  it('persists pending Connect and replaces a superseded provider attempt', async () => {
    const fapi = serveFapi(
      signedIn([
        google,
        fapiExternalAccount({
          id: 'idn_pending',
          provider: 'github',
          approved_scopes: '',
          verification: fapiVerification('oauth_github', { status: 'unverified' }),
        }),
      ]),
    );
    const callback = deferred<{ callbackUrl: string }>();
    const open = vi.fn(() => callback.promise);
    const { clerk } = await renderWithClerk(<UserProfileConnectedAccountsSection />, {
      __internal_oauthTransport: { getRedirectUrl: () => 'https://app.example/callback', open },
    });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    callback.resolve({ callbackUrl: 'https://app.example/callback' });
    await callback.promise;
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Connect GitHub' })).not.toHaveAttribute('aria-busy', 'true'),
    );
    const accounts = fapi.client.sessions[0]?.user.external_accounts;
    expect(accounts).toHaveLength(2);
    expect(accounts?.find(account => account.provider === 'github')).toMatchObject({
      approved_scopes: '',
      verification: { status: 'unverified' },
    });
    expect(accounts?.map(account => account.id)).not.toContain('idn_pending');
    expect(clerk.user?.externalAccounts.find(account => account.provider === 'github')?.id).not.toBe('idn_pending');
    expect(screen.getByRole('button', { name: 'Manage Google' })).toBeVisible();
  });

  it('does not open an OAuth response after the active user changes', async () => {
    serveFapi(
      signedIn([], {
        client: fapiClient([
          fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', external_accounts: [] }) }),
          fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', external_accounts: [] }) }),
        ]),
      }),
    );
    const response = deferred<Response>();
    let received = false;
    worker.use(
      http.post(fapiUrl('/v1/me/external_accounts'), () => {
        received = true;
        return response.promise;
      }),
    );
    const open = vi.fn(() => Promise.resolve({ callbackUrl: 'https://app.example/callback' }));
    const { clerk } = await renderWithClerk(<UserProfileConnectedAccountsSection />, {
      __internal_oauthTransport: { getRedirectUrl: () => 'https://app.example/callback', open },
    });
    const original = clerk.user;
    if (!original) {
      throw new Error('Expected original user');
    }
    const create = vi.spyOn(original, 'createExternalAccount');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(received).toBe(true));
    await act(() => clerk.setActive({ session: 'sess_2' }));
    const pending = fapiExternalAccount({
      id: 'idn_response',
      provider: 'github',
      verification: fapiVerification('oauth_github', {
        status: 'unverified',
        external_verification_redirect_url: 'https://accounts.example/authorize',
      }),
    });
    await act(async () => {
      response.resolve(HttpResponse.json({ response: pending, client: null }));
      await create.mock.results[0]?.value;
    });

    expect(open).not.toHaveBeenCalled();
    expect(clerk.user?.id).toBe('user_2');
  });

  it('does not reload after the user changes while the popup is open', async () => {
    serveFapi(
      signedIn([], {
        client: fapiClient([
          fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', external_accounts: [] }) }),
          fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', external_accounts: [] }) }),
        ]),
      }),
    );
    const callback = deferred<{ callbackUrl: string }>();
    const open = vi.fn(() => callback.promise);
    const { clerk } = await renderWithClerk(<UserProfileConnectedAccountsSection />, {
      __internal_oauthTransport: { getRedirectUrl: () => 'https://app.example/callback', open },
    });
    const original = clerk.user;
    if (!original) {
      throw new Error('Expected original user');
    }
    const reload = vi.spyOn(original, 'reload');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    await act(() => clerk.setActive({ session: 'sess_2' }));
    const current = clerk.user;
    if (!current) {
      throw new Error('Expected current user');
    }
    const currentReload = vi.spyOn(current, 'reload');
    await act(async () => {
      callback.resolve({ callbackUrl: 'https://app.example/callback' });
      await callback.promise;
    });
    expect(reload).not.toHaveBeenCalled();
    expect(currentReload).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toBeEnabled();
  });

  it('shows the connected account after explicit provider callback completion', async () => {
    const fapi = serveFapi(signedIn([]));
    const callback = deferred<{ callbackUrl: string }>();
    const open = vi.fn(() => callback.promise);
    const { clerk } = await renderWithClerk(
      <UserProfileProvider additionalOAuthScopes={{ github: ['repo'] }}>
        <UserProfileConnectedAccountsSection />
      </UserProfileProvider>,
      {
        __internal_oauthTransport: { getRedirectUrl: () => 'https://app.example/callback', open },
      },
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    fapi.client.sessions = fapi.client.sessions.map(session => ({
      ...session,
      user: {
        ...session.user,
        external_accounts: session.user.external_accounts.map(account => ({
          ...account,
          username: 'octocat',
          approved_scopes: 'email repo',
          verification: fapiVerification('oauth_github', { status: 'verified' }),
        })),
      },
    }));
    await act(async () => {
      callback.resolve({ callbackUrl: 'https://app.example/callback' });
      await callback.promise;
    });
    expect(await screen.findByRole('button', { name: 'Manage GitHub' })).toBeVisible();
    expect(screen.getByText('octocat')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Connect GitHub' })).toBeNull();
    expect(clerk.user?.externalAccounts[0]?.approvedScopes).toBe('email repo');
  });

  it.each([
    {
      name: 'connect',
      accounts: [],
      start: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));
      },
      otherProvider: 'Connect Google',
      pendingButtons: ['Connect GitHub'],
    },
    {
      name: 'reconnect by recreating a disconnected account',
      accounts: [disconnectedGoogle],
      start: (user: ReturnType<typeof userEvent.setup>) => startReconnect(user, 'Google'),
      otherProvider: 'Connect GitHub',
      pendingButtons: [],
    },
  ])(
    'releases $name pending when a redirect leaves the section mounted',
    async ({ accounts, start, otherProvider, pendingButtons }) => {
      const { clerk } = await renderSection(accounts);
      const navigation = deferred<void>();
      const navigate = vi.spyOn(clerk, 'navigate').mockResolvedValue(undefined).mockReturnValueOnce(navigation.promise);
      const user = userEvent.setup();

      await start(user);
      await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
      const otherButton = screen.getByRole('button', { name: otherProvider });
      expect(otherButton).toBeDisabled();
      for (const name of pendingButtons) {
        expect(screen.getByRole('button', { name })).toHaveAttribute('aria-busy', 'true');
      }

      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        await act(async () => {
          navigation.resolve(undefined);
          await navigation.promise;
        });
        await act(() => vi.advanceTimersByTimeAsync(1999));
        expect(otherButton).toBeDisabled();
        await act(() => vi.advanceTimersByTimeAsync(1));
        expect(otherButton).toBeEnabled();
        for (const name of pendingButtons) {
          expect(screen.getByRole('button', { name })).not.toHaveAttribute('aria-busy', 'true');
        }
      } finally {
        vi.useRealTimers();
      }

      await user.click(otherButton);
      await waitFor(() => expect(navigate).toHaveBeenCalledTimes(2));
    },
  );

  it.each([
    {
      name: 'connect',
      accounts: [],
      start: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));
      },
    },
    {
      name: 'reconnect by recreating a disconnected account',
      accounts: [disconnectedGoogle],
      start: (user: ReturnType<typeof userEvent.setup>) => startReconnect(user, 'Google'),
    },
  ])('allows another connection when $name navigation fails', async ({ accounts, start }) => {
    const { clerk } = await renderSection(accounts);
    const navigate = vi.spyOn(clerk, 'navigate').mockRejectedValueOnce(new Error('Navigation failed'));
    const user = userEvent.setup();

    await start(user);
    await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
    const githubButton = screen.getByRole('button', { name: 'Connect GitHub' });
    await waitFor(() => expect(githubButton).toBeEnabled());
    navigate.mockResolvedValue(undefined);
    await user.click(githubButton);
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(2));
  });

  it('shows a generic error when Connect navigation fails', async () => {
    const { clerk } = await renderSection([]);
    vi.spyOn(clerk, 'navigate').mockRejectedValueOnce(new Error('Navigation failed'));

    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('keeps pending and error state local to each mounted section', async () => {
    serveFapi(signedIn([]));
    await renderWithClerk(
      <>
        <div
          role='region'
          aria-label='First'
        >
          <UserProfileConnectedAccountsSection />
        </div>
        <div
          role='region'
          aria-label='Second'
        >
          <UserProfileConnectedAccountsSection />
        </div>
      </>,
    );
    const first = within(screen.getByRole('region', { name: 'First' }));
    const second = within(screen.getByRole('region', { name: 'Second' }));
    const request = holdRequests('post', '/v1/me/external_accounts');
    await userEvent.setup().click(first.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    expect(second.getByRole('button', { name: 'Connect GitHub' })).not.toHaveAttribute('aria-busy', 'true');
    request.fail('oauth_error', 'Provider unavailable');
    expect(await first.findByText('Provider unavailable')).toBeInTheDocument();
    expect(second.queryByText('Provider unavailable')).toBeNull();
  });

  it.each(['preparation', 'popup'] as const)('localizes an unknown %s failure', async stage => {
    serveFapi(signedIn([]));
    await renderWithClerk(
      <MosaicProvider
        localization={{ overrides: { 'userProfileConnectedAccounts.errors.generic': 'Try the connection again.' } }}
      >
        <UserProfileConnectedAccountsSection />
      </MosaicProvider>,
      {
        __internal_oauthTransport: {
          getRedirectUrl: () =>
            stage === 'preparation' ? Promise.reject(new Error('private failure')) : 'https://app.example/callback',
          open: () => Promise.reject(new Error('private failure')),
        },
      },
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    expect(await screen.findByText('Try the connection again.')).toBeInTheDocument();
    expect(screen.queryByText('private failure')).toBeNull();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).not.toHaveAttribute('aria-busy', 'true');
  });

  it('uses canonical localized API errors instead of server copy', async () => {
    serveFapi(signedIn([]));
    await renderWithClerk(
      <MosaicProvider
        localization={{
          locale: 'fr-FR',
          overrides: { 'errors.verification_invalid_strategy': 'Cette connexion est indisponible.' },
        }}
      >
        <UserProfileConnectedAccountsSection />
      </MosaicProvider>,
    );
    const request = holdRequests('post', '/v1/me/external_accounts');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('verification_invalid_strategy', 'Server copy');
    expect(await screen.findByText('Cette connexion est indisponible.')).toBeInTheDocument();
    expect(screen.queryByText('Server copy')).toBeNull();
  });

  it.todo('challenges and resumes connect, reconnect, and removal when session reverification is required');
});
