import type { OAuthProvider } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import {
  allowsIdentificationCreation,
  getEnabledOAuthStrategies,
  getRecovery,
  getRetry,
  projectConnectedAccounts,
} from './user-profile-connected-accounts-section.model';

type AccountInput = {
  id: string;
  provider: OAuthProvider;
  status?: 'verified' | 'unverified';
  errorCode?: string;
  longMessage?: string;
  strategy?: string;
  approvedScopes?: string;
  username?: string;
  emailAddress?: string;
};

function account({
  id,
  provider,
  status = 'verified',
  errorCode,
  longMessage,
  strategy,
  approvedScopes = 'email',
  username = '',
  emailAddress = '',
}: AccountInput) {
  return {
    id,
    provider,
    approvedScopes,
    username,
    emailAddress,
    verification: {
      status,
      strategy: strategy ?? `oauth_${provider}`,
      error: errorCode ? { code: errorCode, longMessage: longMessage ?? errorCode } : null,
    },
  };
}

function userWith(
  accounts: ReturnType<typeof account>[],
  enterpriseAccounts: Parameters<typeof allowsIdentificationCreation>[0]['enterpriseAccounts'] = [],
) {
  return {
    verifiedExternalAccounts: accounts.filter(a => a.verification?.status === 'verified'),
    unverifiedExternalAccounts: accounts.filter(a => a.verification?.status !== 'verified'),
    enterpriseAccounts,
  };
}

function social(...strategies: string[]): Parameters<typeof getEnabledOAuthStrategies>[0] {
  return Object.fromEntries(
    strategies.map(strategy => [
      strategy,
      {
        enabled: true,
        strategy,
        name: strategy.startsWith('oauth_custom_') ? 'Custom Provider' : strategy,
        logo_url: strategy.startsWith('oauth_custom_') ? 'https://img.example/custom.png' : null,
      },
    ]),
  );
}

describe('projectConnectedAccounts', () => {
  it('is hidden when no social provider is enabled', () => {
    expect(projectConnectedAccounts({ user: userWith([]), social: {}, allowCreation: true })).toEqual({
      status: 'hidden',
    });
  });

  it('resolves empty rows when creation is disallowed and no accounts remain', () => {
    expect(
      projectConnectedAccounts({ user: userWith([]), social: social('oauth_google'), allowCreation: false }),
    ).toEqual({
      status: 'ready',
      accounts: [],
      availableProviders: [],
    });
  });

  it('stays visible when creation is disallowed but a pending account exists', () => {
    const projection = projectConnectedAccounts({
      user: userWith([account({ id: 'idn_1', provider: 'google', status: 'unverified' })]),
      social: social('oauth_google'),
      allowCreation: false,
    });
    expect(projection).toEqual({ status: 'ready', accounts: [], availableProviders: [] });
  });

  it('lists verified accounts first, then failed unverified ones, and omits pending ones', () => {
    const projection = projectConnectedAccounts({
      user: userWith([
        account({ id: 'idn_failed', provider: 'github', status: 'unverified', errorCode: 'form_identifier_exists' }),
        account({ id: 'idn_pending', provider: 'apple', status: 'unverified' }),
        account({ id: 'idn_verified', provider: 'google' }),
      ]),
      social: social('oauth_google', 'oauth_github', 'oauth_apple'),
      allowCreation: true,
    });
    expect(projection.status === 'ready' && projection.accounts.map(a => a.id)).toEqual(['idn_verified', 'idn_failed']);
  });

  it('prefers the username over the email address as the identifier', () => {
    const projection = projectConnectedAccounts({
      user: userWith([
        account({ id: 'idn_1', provider: 'github', username: 'octo', emailAddress: 'octo@example.com' }),
        account({ id: 'idn_2', provider: 'google', emailAddress: 'g@example.com' }),
      ]),
      social: social('oauth_google', 'oauth_github'),
      allowCreation: true,
    });
    expect(projection.status === 'ready' && projection.accounts.map(a => a.identifier)).toEqual([
      'octo',
      'g@example.com',
    ]);
  });

  it('offers enabled providers that have no account row, keyed by strategy', () => {
    const projection = projectConnectedAccounts({
      user: userWith([
        account({ id: 'idn_google', provider: 'google' }),
        account({ id: 'idn_github', provider: 'github', status: 'unverified', errorCode: 'oauth_access_denied' }),
        account({ id: 'idn_acme', provider: 'custom_acme', status: 'unverified' }),
      ]),
      social: social('oauth_google', 'oauth_github', 'oauth_custom_acme'),
      allowCreation: true,
    });
    expect(projection.status === 'ready' && projection.availableProviders.map(p => p.id)).toEqual([
      'oauth_custom_acme',
    ]);
  });

  it('uses configured names and logos for custom providers', () => {
    const projection = projectConnectedAccounts({
      user: userWith([account({ id: 'idn_1', provider: 'custom_acme' })]),
      social: social('oauth_custom_acme'),
      allowCreation: true,
    });
    expect(projection.status === 'ready' && projection.accounts[0]).toMatchObject({
      provider: 'Custom Provider',
      iconUrl: 'https://img.example/custom.png',
    });
  });

  it('marks monochrome provider logos', () => {
    const projection = projectConnectedAccounts({
      user: userWith([]),
      social: social('oauth_github', 'oauth_google'),
      allowCreation: true,
    });
    expect(
      projection.status === 'ready' && projection.availableProviders.map(p => [p.id, Boolean(p.monochromeIcon)]),
    ).toEqual([
      ['oauth_github', true],
      ['oauth_google', false],
    ]);
  });

  it('offers no providers when creation is disallowed', () => {
    const projection = projectConnectedAccounts({
      user: userWith([account({ id: 'idn_1', provider: 'google' })]),
      social: social('oauth_google', 'oauth_github'),
      allowCreation: false,
    });
    expect(projection.status === 'ready' && projection.availableProviders).toEqual([]);
  });

  it('shows recovery errors as reconnect and other errors with their message', () => {
    const projection = projectConnectedAccounts({
      user: userWith([
        account({
          id: 'idn_reconnect',
          provider: 'google',
          status: 'unverified',
          errorCode: 'external_account_missing_refresh_token',
        }),
        account({
          id: 'idn_error',
          provider: 'github',
          status: 'unverified',
          errorCode: 'external_account_exists',
          longMessage: 'This account is already connected.',
        }),
      ]),
      social: social('oauth_google', 'oauth_github'),
      allowCreation: true,
    });
    expect(projection.status === 'ready' && projection.accounts).toMatchObject([
      { id: 'idn_reconnect', status: 'reconnect', verificationError: undefined },
      { id: 'idn_error', status: 'error', verificationError: 'This account is already connected.' },
    ]);
  });
});

describe('getRecovery', () => {
  it.each([
    'external_account_missing_refresh_token',
    'oauth_fetch_user_error',
    'oauth_token_exchange_error',
    'external_account_email_address_verification_required',
  ])('recreates the account for %s', code => {
    expect(getRecovery(account({ id: 'idn_1', provider: 'github', errorCode: code }), undefined)).toEqual({
      kind: 'create',
      strategy: 'oauth_github',
      additionalScopes: [],
    });
  });

  it('normalizes google one tap to the google strategy', () => {
    const recovery = getRecovery(
      account({ id: 'idn_1', provider: 'google', strategy: 'google_one_tap', errorCode: 'oauth_fetch_user_error' }),
      undefined,
    );
    expect(recovery).toMatchObject({ kind: 'create', strategy: 'oauth_google' });
  });

  it('reauthorizes with the full requested scope list when any scope is missing', () => {
    const recovery = getRecovery(account({ id: 'idn_1', provider: 'google', approvedScopes: 'email profile' }), {
      google: ['email', 'calendar'],
    });
    expect(recovery).toEqual({ kind: 'reauthorize', additionalScopes: ['email', 'calendar'] });
  });

  it('does not reauthorize when every requested scope is approved', () => {
    expect(
      getRecovery(account({ id: 'idn_1', provider: 'google', approvedScopes: 'email calendar' }), {
        google: ['calendar'],
      }),
    ).toBeNull();
  });

  it('does not offer recovery when scopes are missing and none were approved', () => {
    expect(
      getRecovery(account({ id: 'idn_1', provider: 'google', approvedScopes: '' }), { google: ['calendar'] }),
    ).toBeNull();
  });

  it('ignores unrecognized verification errors', () => {
    expect(getRecovery(account({ id: 'idn_1', provider: 'google', errorCode: 'oauth_access_denied' }), undefined)).toBe(
      null,
    );
  });
});

describe('getEnabledOAuthStrategies', () => {
  it('sorts known strategies, appends custom ones, and drops unknown ones', () => {
    expect(
      getEnabledOAuthStrategies(social('oauth_github', 'oauth_custom_acme', 'oauth_future', 'oauth_apple')),
    ).toEqual(['oauth_apple', 'oauth_github', 'oauth_custom_acme']);
  });
});

describe('allowsIdentificationCreation', () => {
  const enterpriseSSO = { enabled: true };

  it('blocks creation for an active enterprise connection that disables additional identifications', () => {
    const blocked = userWith([], [{ active: true, enterpriseConnection: { disableAdditionalIdentifications: true } }]);
    expect(allowsIdentificationCreation(blocked, enterpriseSSO)).toBe(false);
  });

  it('allows creation when the enterprise connection is inactive or enterprise SSO is off', () => {
    const inactive = userWith(
      [],
      [{ active: false, enterpriseConnection: { disableAdditionalIdentifications: true } }],
    );
    expect(allowsIdentificationCreation(inactive, enterpriseSSO)).toBe(true);

    const active = userWith([], [{ active: true, enterpriseConnection: { disableAdditionalIdentifications: true } }]);
    expect(allowsIdentificationCreation(active, { enabled: false })).toBe(true);
  });
});

describe('getRetry', () => {
  it('retries a failed connection with its strategy and missing scopes', () => {
    expect(
      getRetry(
        account({
          id: 'idn_1',
          provider: 'google',
          status: 'unverified',
          errorCode: 'oauth_access_denied',
          approvedScopes: '',
        }),
        { google: ['calendar'] },
      ),
    ).toEqual({ kind: 'create', strategy: 'oauth_google', additionalScopes: ['calendar'] });
  });

  it('does not retry an account without an error', () => {
    expect(getRetry(account({ id: 'idn_1', provider: 'google' }), undefined)).toBeNull();
  });
});
