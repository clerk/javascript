import { ClerkAPIResponseError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import { createDeferredPromise } from '@clerk/shared/utils';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileConnectedAccountsSection } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section';

let isLoaded: boolean;
let externalAccounts: Record<string, unknown>[];
let enterpriseAccounts: unknown[];
let social: Record<string, unknown>;
let transport: { getRedirectUrl: () => string; open: ReturnType<typeof vi.fn> } | null;
let createExternalAccount: ReturnType<typeof vi.fn>;
let reload: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({
      isLoaded,
      isSignedIn: isLoaded,
      user: isLoaded
        ? {
            id: 'user_1',
            externalAccounts,
            verifiedExternalAccounts: externalAccounts.filter(a => (a.verification as any)?.status === 'verified'),
            unverifiedExternalAccounts: externalAccounts.filter(a => (a.verification as any)?.status !== 'verified'),
            enterpriseAccounts,
            createExternalAccount,
            reload,
          }
        : undefined,
    }),
    useClerk: () => ({
      __internal_environment: {
        userSettings: { social, enterpriseSSO: { enabled: enterpriseAccounts.length > 0 } },
      },
      __internal_oauthTransport: transport,
      __internal_getOption: () => undefined,
      navigate,
    }),
  };
});

function oauth(strategy: string) {
  return { enabled: true, strategy, name: strategy, logo_url: null };
}

function externalAccount(overrides: Record<string, unknown> & { id: string; provider: string }) {
  return {
    approvedScopes: 'email',
    username: '',
    emailAddress: `${overrides.provider}@example.com`,
    verification: { status: 'verified', strategy: `oauth_${overrides.provider}`, error: null },
    destroy: vi.fn(() => Promise.resolve()),
    reauthorize: vi.fn(),
    ...overrides,
  };
}

function verificationResponse(url = 'https://accounts.example/authorize') {
  return { verification: { externalVerificationRedirectURL: new URL(url) } };
}

function renderSection(props: Parameters<typeof UserProfileConnectedAccountsSection>[0] = {}) {
  return render(
    <MosaicProvider>
      <UserProfileConnectedAccountsSection {...props} />
    </MosaicProvider>,
  );
}

async function openRemoval(user: ReturnType<typeof userEvent.setup>, provider: string) {
  await user.click(screen.getByRole('button', { name: `Manage ${provider}` }));
  await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
  return screen.getByRole('alertdialog');
}

describe('UserProfileConnectedAccountsSection', () => {
  beforeEach(() => {
    isLoaded = true;
    externalAccounts = [];
    enterpriseAccounts = [];
    social = { oauth_google: oauth('oauth_google'), oauth_github: oauth('oauth_github') };
    transport = null;
    createExternalAccount = vi.fn(() => Promise.resolve(verificationResponse()));
    reload = vi.fn(() => Promise.resolve());
    navigate = vi.fn(() => Promise.resolve());
  });

  it('renders the fallback until the user has loaded', () => {
    isLoaded = false;
    renderSection({ fallback: <p>Loading accounts</p> });
    expect(screen.getByText('Loading accounts')).toBeInTheDocument();
  });

  it('renders nothing when no social provider is enabled', () => {
    social = {};
    const { container } = renderSection();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders connected accounts from the user and offers the remaining providers', () => {
    externalAccounts = [externalAccount({ id: 'idn_google', provider: 'google', username: 'jdoe' })];
    renderSection();

    expect(screen.getByRole('heading', { name: 'Connected accounts' })).toBeInTheDocument();
    expect(screen.getByText('jdoe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Google' })).not.toBeInTheDocument();
  });

  it('hides Connect when an enterprise connection disables additional identifications', () => {
    externalAccounts = [externalAccount({ id: 'idn_google', provider: 'google' })];
    enterpriseAccounts = [{ active: true, enterpriseConnection: { disableAdditionalIdentifications: true } }];
    renderSection();

    expect(screen.getByRole('button', { name: 'Manage Google' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Connect/ })).not.toBeInTheDocument();
  });

  it('connects with the current URL and requested scopes, then navigates to the provider', async () => {
    const user = userEvent.setup();
    renderSection({ additionalOAuthScopes: { github: ['repo'] } });

    await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));

    await waitFor(() =>
      expect(createExternalAccount).toHaveBeenCalledWith({
        strategy: 'oauth_github',
        redirectUrl: window.location.href,
        additionalScopes: ['repo'],
      }),
    );
    expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize');
  });

  it('keeps Connect pending and ignores repeat clicks while the request runs', async () => {
    const deferred = createDeferredPromise();
    createExternalAccount = vi.fn(() => deferred.promise);
    const user = userEvent.setup();
    renderSection();

    const connect = screen.getByRole('button', { name: 'Connect GitHub' });
    await user.click(connect);
    await user.click(connect);
    await user.click(screen.getByRole('button', { name: 'Connect Google' }));

    expect(createExternalAccount).toHaveBeenCalledOnce();
    expect(connect).toHaveAttribute('aria-busy', 'true');

    deferred.resolve(verificationResponse());
    await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
  });

  it('shows the API error on the provider row and re-enables Connect', async () => {
    createExternalAccount = vi.fn(() =>
      Promise.reject(
        new ClerkAPIResponseError('failed', {
          data: [{ code: 'oauth_error', message: 'failed', long_message: 'GitHub is unavailable right now.' }],
          status: 422,
        }),
      ),
    );
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));

    expect(await screen.findByText('GitHub is unavailable right now.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).not.toHaveAttribute('aria-busy', 'true');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows a generic error when the provider returns no verification URL', async () => {
    createExternalAccount = vi.fn(() => Promise.resolve({ verification: null }));
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('opens the transport and reloads the user with the callback nonce', async () => {
    transport = {
      getRedirectUrl: () => 'myapp://sso-callback',
      open: vi.fn(() => Promise.resolve({ callbackUrl: 'myapp://sso-callback?rotating_token_nonce=abc' })),
    };
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Connect GitHub' }));

    await waitFor(() => expect(reload).toHaveBeenCalledWith({ rotatingTokenNonce: 'abc' }));
    expect(createExternalAccount).toHaveBeenCalledWith(
      expect.objectContaining({ redirectUrl: 'myapp://sso-callback' }),
    );
    expect(transport.open).toHaveBeenCalledWith(new URL('https://accounts.example/authorize'));
    expect(navigate).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Connect GitHub' })).not.toHaveAttribute('aria-busy', 'true'),
    );
  });

  it('recreates an account that needs reconnecting', async () => {
    externalAccounts = [
      externalAccount({
        id: 'idn_google',
        provider: 'google',
        verification: {
          status: 'unverified',
          strategy: 'google_one_tap',
          error: { code: 'external_account_missing_refresh_token', longMessage: 'Missing token' },
        },
      }),
    ];
    const user = userEvent.setup();
    renderSection();

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));

    await waitFor(() =>
      expect(createExternalAccount).toHaveBeenCalledWith({
        strategy: 'oauth_google',
        redirectUrl: window.location.href,
        additionalScopes: [],
      }),
    );
    expect(navigate).toHaveBeenCalledWith('https://accounts.example/authorize');
  });

  it('reauthorizes an account missing requested scopes', async () => {
    const google = externalAccount({
      id: 'idn_google',
      provider: 'google',
      approvedScopes: 'email',
      reauthorize: vi.fn(() => Promise.resolve(verificationResponse('https://accounts.example/consent'))),
    });
    externalAccounts = [google];
    const user = userEvent.setup();
    renderSection({ additionalOAuthScopes: { google: ['email', 'calendar'] } });

    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reconnect' }));

    await waitFor(() =>
      expect(google.reauthorize).toHaveBeenCalledWith({
        additionalScopes: ['email', 'calendar'],
        redirectUrl: window.location.href,
      }),
    );
    expect(createExternalAccount).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('https://accounts.example/consent');
  });

  it('removes the selected account and closes the confirmation', async () => {
    const google = externalAccount({ id: 'idn_google', provider: 'google' });
    const github = externalAccount({ id: 'idn_github', provider: 'github' });
    externalAccounts = [google, github];
    const user = userEvent.setup();
    renderSection();

    const dialog = await openRemoval(user, 'GitHub');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(github.destroy).toHaveBeenCalledOnce());
    expect(google.destroy).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('keeps the confirmation open with the API message when removal is rejected', async () => {
    const google = externalAccount({
      id: 'idn_google',
      provider: 'google',
      destroy: vi.fn(() =>
        Promise.reject(
          new ClerkAPIResponseError('failed', {
            data: [
              {
                code: 'last_identification',
                message: 'failed',
                long_message: 'You cannot remove your last sign-in method.',
              },
            ],
            status: 403,
          }),
        ),
      ),
    });
    externalAccounts = [google];
    const user = userEvent.setup();
    renderSection();

    const dialog = await openRemoval(user, 'Google');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('You cannot remove your last sign-in method.');
  });
});
