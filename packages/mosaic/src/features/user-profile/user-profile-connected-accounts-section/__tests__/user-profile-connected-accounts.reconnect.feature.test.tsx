import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { demandReverificationOnce, holdRequests, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiExternalAccount,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../../__tests__/feature/fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileProvider } from '../../user-profile.provider';
import { UserProfileConnectedAccountsSection } from '../user-profile-connected-accounts-section';
import {
  deferred,
  disconnectedGoogle,
  github,
  google,
  renderSection,
  signedIn,
  startReconnect,
} from './user-profile-connected-accounts.fixtures';

describe('connected accounts', () => {
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
    await openMenu(user, screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Try again' }));

    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    expect(body.get('strategy')).toBe('oauth_google');
    request.release();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize'));
  });

  it('recreates a disconnected account', async () => {
    serveFapi(signedIn([disconnectedGoogle]));
    const { clerk } = await renderWithClerk(<UserProfileConnectedAccountsSection />);
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    await startReconnect(user, 'Google');

    await waitFor(() => expect(request.requests).toHaveLength(1));
    const body = new URLSearchParams(await request.requests[0]?.text());
    expect(body.get('strategy')).toBe('oauth_google');
    request.release();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize'));
  });

  it('reports an unavailable recovery when the account changes during redirect preparation', async () => {
    serveFapi(signedIn([disconnectedGoogle]));
    const redirect = deferred<string>();
    const open = vi.fn(() => Promise.resolve({ callbackUrl: 'https://app.example/callback' }));
    const { clerk } = await renderWithClerk(<UserProfileConnectedAccountsSection />, {
      __internal_oauthTransport: { getRedirectUrl: () => redirect.promise, open },
    });
    const user = userEvent.setup();
    await startReconnect(user, 'Google');
    const account = clerk.user?.externalAccounts[0];
    if (!account) {
      throw new Error('Expected Google account');
    }
    account.verification = null;
    await act(async () => {
      redirect.resolve('https://app.example/callback');
      await redirect.promise;
    });
    expect(await screen.findByText('This connected account is no longer available.')).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it('preserves modal state when reconnecting', async () => {
    serveFapi(signedIn([disconnectedGoogle]));
    await renderWithClerk(
      <UserProfileProvider mode='modal'>
        <UserProfileConnectedAccountsSection />
      </UserProfileProvider>,
    );
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    await startReconnect(user, 'Google');
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
      <UserProfileProvider additionalOAuthScopes={{ google: ['email', 'calendar'] }}>
        <UserProfileConnectedAccountsSection />
      </UserProfileProvider>,
    );
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts/idn_google/reauthorize');
    const user = userEvent.setup();

    await startReconnect(user, 'Google');
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
      <UserProfileProvider additionalOAuthScopes={{ google: ['calendar'] }}>
        <UserProfileConnectedAccountsSection />
      </UserProfileProvider>,
    );
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts/idn_google/reauthorize');
    const user = userEvent.setup();

    await startReconnect(user, 'Google');
    await waitFor(() => expect(request.requests).toHaveLength(1));
    request.fail('oauth_error', 'Calendar access was denied.');
    expect(await screen.findByText('Calendar access was denied.')).toBeInTheDocument();

    serveFapi(signedIn([google]));
    await startReconnect(user, 'Google');
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/consent'));
  });

  it('persists reauthorization without granting scopes before callback completion', async () => {
    const fapi = serveFapi(signedIn([google, github]));
    const callback = deferred<{ callbackUrl: string }>();
    const open = vi.fn(() => callback.promise);
    const { clerk } = await renderWithClerk(
      <UserProfileProvider additionalOAuthScopes={{ google: ['email', 'calendar'] }}>
        <UserProfileConnectedAccountsSection />
      </UserProfileProvider>,
      {
        __internal_oauthTransport: { getRedirectUrl: () => 'https://app.example/callback', open },
      },
    );
    const user = userEvent.setup();
    await startReconnect(user, 'Google');
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
    await openMenu(user, screen.getByRole('button', { name: 'Manage Google' }));
    expect(screen.getByRole('menuitem', { name: 'Remove' })).toBeEnabled();
    expect(screen.queryByRole('menuitem', { name: 'Reconnect' })).toBeNull();
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
      <UserProfileProvider additionalOAuthScopes={{ google: ['calendar'] }}>
        <UserProfileConnectedAccountsSection />
      </UserProfileProvider>,
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
    await startReconnect(user, 'Google');
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

  it('allows another connection when reauthorizing an account fails to navigate', async () => {
    serveFapi(signedIn([google]));
    const { clerk } = await renderWithClerk(
      <UserProfileProvider additionalOAuthScopes={{ google: ['calendar'] }}>
        <UserProfileConnectedAccountsSection />
      </UserProfileProvider>,
    );
    const navigate = vi.spyOn(clerk, 'navigate').mockRejectedValueOnce(new Error('Navigation failed'));
    const user = userEvent.setup();

    await startReconnect(user, 'Google');
    await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
    const githubButton = screen.getByRole('button', { name: 'Connect GitHub' });
    await waitFor(() => expect(githubButton).toBeEnabled());
    navigate.mockResolvedValue(undefined);
    await user.click(githubButton);
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(2));
  });

  it.todo('keeps the provider visibly pending when Try again replaces its failed account with a Connect row');
});

describe('reconnect reverification', () => {
  async function renderDisconnectedNeedingReverification() {
    serveFapi(signedIn([disconnectedGoogle], { verification: { secrets: { password: 'hunter2' } } }));
    const view = await renderWithClerk(<UserProfileConnectedAccountsSection />);
    const navigate = vi.spyOn(view.clerk, 'navigate').mockImplementation(() => Promise.resolve());
    demandReverificationOnce('/v1/me/external_accounts');
    return { navigate };
  }

  const manageGoogle = () => screen.getByRole('button', { name: 'Manage Google' });

  it('verifies the session before recreating a disconnected account, then continues to the provider', async () => {
    const { navigate } = await renderDisconnectedNeedingReverification();
    const user = userEvent.setup();

    await startReconnect(user, 'Google');
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await user.keyboard('hunter2{Enter}');

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('lets the user cancel verification quietly and retry the reconnect', async () => {
    const { navigate } = await renderDisconnectedNeedingReverification();
    const user = userEvent.setup();

    await startReconnect(user, 'Google');
    await screen.findByText('Enter your current password to continue');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
    await waitFor(() => expect(manageGoogle()).toHaveFocus());

    await startReconnect(user, 'Google');
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize'));
  });

  it('keeps the verification dialog open while retrying and reports an ordinary retry error', async () => {
    const { navigate } = await renderDisconnectedNeedingReverification();
    const user = userEvent.setup();

    await startReconnect(user, 'Google');
    await screen.findByText('Enter your current password to continue');
    const dialog = screen.getByRole('dialog');
    const replay = holdRequests('post', '/v1/me/external_accounts');
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveFocus());
    await user.keyboard('hunter2{Enter}');
    await waitFor(() => expect(replay.requests).toHaveLength(1));

    expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
    await user.keyboard('{Escape}');
    expect(dialog).toBeVisible();

    replay.fail('action_blocked', 'Unable to reconnect.');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent("This action couldn't be completed."));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('waits for a verification factor before opening the reconnect dialog', async () => {
    await renderDisconnectedNeedingReverification();
    const start = holdRequests('post', '/v1/client/sessions/:id/verify');
    const user = userEvent.setup();

    await startReconnect(user, 'Google');
    await waitFor(() => expect(start.requests).toHaveLength(1));
    expect(screen.queryByRole('dialog')).toBeNull();

    start.release();
    expect(await screen.findByText('Enter your current password to continue')).toBeVisible();
  });
});
