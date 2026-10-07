import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiExternalAccount,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileConnectedAccountsSection } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section';
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
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
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

  it('shows a verification-required Reconnect error and permits another attempt', async () => {
    const { clerk } = await renderSection([disconnectedGoogle]);
    const navigate = vi.spyOn(clerk, 'navigate').mockImplementation(() => Promise.resolve());
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = userEvent.setup();

    await startReconnect(user, 'Google');
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
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ google: ['email', 'calendar'] }} />,
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
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ google: ['calendar'] }} />,
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
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ google: ['email', 'calendar'] }} />,
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
      <UserProfileConnectedAccountsSection additionalOAuthScopes={{ google: ['calendar'] }} />,
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
