import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createRef } from 'react';
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
import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileConnectedAccountsSection } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';

const google = fapiExternalAccount({ id: 'idn_google', provider: 'google', username: 'jdoe' });
const github = fapiExternalAccount({ id: 'idn_github', provider: 'github' });
const disconnectedGoogle = fapiExternalAccount({
  id: 'idn_google',
  provider: 'google',
  verification: fapiVerification('google_one_tap', {
    status: 'unverified',
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

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>(fulfill => {
    resolve = fulfill;
  });
  return { promise, resolve };
}

async function renderSection(accounts = [google], overrides: FakeFapiSeed = {}) {
  const fapi = serveFapi(signedIn(accounts, overrides));
  const titleRef = createRef<HTMLDivElement>();
  const view = await renderWithClerk(
    <UserProfileProfilePanelView
      name='Jane Doe'
      username=''
      emails={[]}
      phones={[]}
      titleRef={titleRef}
      connectedAccountsSlot={<UserProfileConnectedAccountsSection fallbackFocus={() => titleRef.current} />}
    />,
  );
  return { ...view, fapi, titleRef };
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

  it('retries a canceled connection from its row instead of offering Connect again', async () => {
    const canceled = fapiExternalAccount({
      id: 'idn_google',
      provider: 'google',
      verification: fapiVerification('oauth_google', {
        status: 'unverified',
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
            verification: fapiVerification('oauth_github', { status: 'unverified' }),
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
    const request = holdRequests('post', '/v1/me/external_accounts/idn_github');
    const user = userEvent.setup();
    const dialog = await openRemoval(user, 'GitHub');

    expect(dialog).toHaveAccessibleName('Remove connected account');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(request.requests).toHaveLength(0);
    expect(fapi.client.sessions[0]?.user.external_accounts).toHaveLength(2);
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.release();

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Manage GitHub' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Manage Google' })).toBeVisible();
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

  it('restores the profile title after removing the final enterprise-restricted account', async () => {
    const environment = signedIn().environment;
    const { titleRef } = await renderSection([google], {
      client: fapiClient([
        fapiSession({
          id: 'sess_1',
          user: fapiUser({
            id: 'user_1',
            external_accounts: [google],
            enterprise_accounts: [fapiEnterpriseAccount({ id: 'sso_1' })],
          }),
        }),
      ]),
      environment: {
        ...environment,
        user_settings: {
          ...environment.user_settings,
          enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false },
        },
      },
    });
    const user = userEvent.setup();
    const dialog = await openRemoval(user, 'Google');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.queryByRole('group', { name: 'Connected accounts' })).toBeNull();
    await waitFor(() => expect(titleRef.current).toHaveFocus());
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

  it('persists reauthorization without granting scopes before callback completion', async () => {
    const fapi = serveFapi(signedIn([google, github]));
    const callback = deferred<{ callbackUrl: string }>();
    const open = vi.fn(() => callback.promise);
    const { clerk } = await renderWithClerk(
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ google: ['email', 'calendar'] }} />,
      {
        __internal_oauthTransport: { getRedirectUrl: () => 'https://app.example/callback', open },
      },
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    const account = fapi.client.sessions[0]?.user.external_accounts.find(account => account.id === google.id);
    expect(account).toMatchObject({ approved_scopes: google.approved_scopes, verification: { status: 'unverified' } });
    expect(fapi.client.sessions[0]?.user.external_accounts.find(account => account.id === github.id)).toEqual(github);

    fapi.client.sessions = fapi.client.sessions.map(session => ({
      ...session,
      user: {
        ...session.user,
        external_accounts: session.user.external_accounts.map(item =>
          item.id === google.id
            ? {
                ...item,
                approved_scopes: 'email calendar',
                verification: fapiVerification('oauth_google', { status: 'verified' }),
              }
            : item,
        ),
      },
    }));
    await act(async () => {
      callback.resolve({ callbackUrl: 'https://app.example/callback' });
      await callback.promise;
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Google' })).toBeInTheDocument());
    expect(clerk.user?.externalAccounts.find(item => item.id === google.id)?.approvedScopes).toBe('email calendar');
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    expect(screen.queryByRole('menuitem', { name: 'Reconnect' })).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Remove' })).toBeEnabled();
  });

  it.each(['switch', 'sign out'] as const)('aborts Reconnect after %s during redirect preparation', async change => {
    const fapi = serveFapi(
      signedIn([google], {
        client: fapiClient([
          fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', external_accounts: [google] }) }),
          fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', external_accounts: [github] }) }),
        ]),
      }),
    );
    const redirect = deferred<string>();
    const getRedirectUrl = vi.fn(() => redirect.promise);
    const open = vi.fn(() => Promise.resolve({ callbackUrl: 'https://app.example/callback' }));
    const { clerk } = await renderWithClerk(
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ google: ['calendar'] }} />,
      {
        __internal_oauthTransport: { getRedirectUrl, open },
      },
    );
    const original = clerk.user?.externalAccounts[0];
    if (!original) {
      throw new Error('Expected Google account');
    }
    const reauthorize = vi.spyOn(original, 'reauthorize');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));
    expect(getRedirectUrl).toHaveBeenCalledOnce();
    await act(() => (change === 'switch' ? clerk.setActive({ session: 'sess_2' }) : clerk.signOut()));
    expect(clerk.user?.id).toBe(change === 'switch' ? 'user_2' : undefined);
    await act(async () => {
      redirect.resolve('https://app.example/callback');
      await redirect.promise;
    });
    expect(reauthorize).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    if (change === 'switch') {
      expect(fapi.client.sessions[1]?.user.external_accounts).toEqual([github]);
    }
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
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ github: ['repo'] }} />,
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

  it('releases the redirect hold and permits another connection', async () => {
    const { clerk } = await renderSection([]);
    const navigate = vi.spyOn(clerk, 'navigate').mockResolvedValue(undefined);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toHaveAttribute('aria-busy', 'true');
    await waitFor(
      () => expect(screen.getByRole('button', { name: 'Connect GitHub' })).not.toHaveAttribute('aria-busy', 'true'),
      { timeout: 2500 },
    );
    await user.click(screen.getByRole('button', { name: 'Connect Google' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(2));
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
      <MosaicProvider localization={{ overrides: { 'errors.form_password_incorrect': 'Localized account error.' } }}>
        <UserProfileConnectedAccountsSection />
      </MosaicProvider>,
    );
    const request = holdRequests('post', '/v1/me/external_accounts');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('form_password_incorrect', 'Server copy');
    expect(await screen.findByText('Localized account error.')).toBeInTheDocument();
    expect(screen.queryByText('Server copy')).toBeNull();
  });

  it.each(['switch', 'sign out'] as const)('closes a stale removal confirmation after %s', async change => {
    const fapi = serveFapi(
      signedIn([google], {
        client: fapiClient([
          fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', external_accounts: [google] }) }),
          fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2', external_accounts: [github] }) }),
        ]),
      }),
    );
    const { clerk } = await renderWithClerk(<UserProfileConnectedAccountsSection />);
    const original = clerk.user?.externalAccounts[0];
    if (!original) {
      throw new Error('Expected original account');
    }
    const destroy = vi.spyOn(original, 'destroy');
    await openRemoval(userEvent.setup(), 'Google');
    await act(() => (change === 'switch' ? clerk.setActive({ session: 'sess_2' }) : clerk.signOut()));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(clerk.user?.id).toBe(change === 'switch' ? 'user_2' : undefined);
    expect(destroy).not.toHaveBeenCalled();
    if (change === 'switch') {
      expect(fapi.client.sessions[0]?.user.external_accounts).toEqual([google]);
      expect(fapi.client.sessions[1]?.user.external_accounts).toEqual([github]);
      expect(screen.getByRole('button', { name: 'Manage GitHub' })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('group', { name: 'Connected accounts' })).toBeNull();
    }
  });

  it.todo('challenges and resumes connect, reconnect, and removal when session reverification is required');
});
