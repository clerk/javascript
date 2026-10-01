import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserProfileConnectedAccountsModel } from './user-profile-connected-accounts-section.model';

type TestAccount = {
  id: string;
  provider: string;
  approvedScopes: string;
  verification: { status: string; strategy: string; error: null } | null;
  destroy: ReturnType<typeof vi.fn>;
};

type TestUser = {
  id: string;
  enterpriseAccounts: never[];
  externalAccounts: TestAccount[];
  verifiedExternalAccounts: TestAccount[];
  unverifiedExternalAccounts: TestAccount[];
  createExternalAccount: ReturnType<typeof vi.fn>;
  reload: ReturnType<typeof vi.fn>;
};

function createUser(id: string): TestUser {
  const github: TestAccount = {
    id: 'idn_github',
    provider: 'github',
    approvedScopes: 'email',
    verification: { status: 'verified', strategy: 'oauth_github', error: null },
    destroy: vi.fn(),
  };
  return {
    id,
    enterpriseAccounts: [],
    externalAccounts: [github],
    verifiedExternalAccounts: [github],
    unverifiedExternalAccounts: [],
    createExternalAccount: vi.fn(() =>
      Promise.resolve({
        verification: { externalVerificationRedirectURL: new URL('https://accounts.example/authorize') },
      }),
    ),
    reload: vi.fn(() => Promise.resolve()),
  };
}

let user: TestUser | null;
let transport: { getRedirectUrl: () => Promise<string>; open: ReturnType<typeof vi.fn> } | undefined;
let socialEnabled: boolean;

const clerk = {
  get user() {
    return user;
  },
  get __internal_oauthTransport() {
    return transport;
  },
  navigate: vi.fn(() => Promise.resolve()),
};

vi.mock('@clerk/shared/react', () => ({
  useClerk: () => clerk,
  useUser: () => ({ isLoaded: true, user }),
}));

vi.mock('../../../hooks/useMosaicEnvironment', () => ({
  useMosaicEnvironment: () => ({
    userSettings: {
      social: {
        oauth_github: { enabled: socialEnabled, strategy: 'oauth_github', name: 'GitHub' },
        oauth_google: { enabled: socialEnabled, strategy: 'oauth_google', name: 'Google' },
      },
      enterpriseSSO: { enabled: false },
    },
  }),
}));

beforeEach(() => {
  user = createUser('user_1');
  transport = undefined;
  socialEnabled = true;
  clerk.navigate.mockClear();
});

afterEach(cleanup);

function ready(model: ReturnType<typeof useUserProfileConnectedAccountsModel>) {
  if (model.status !== 'ready') {
    throw new Error('expected ready model');
  }
  return model;
}

describe('useUserProfileConnectedAccountsModel', () => {
  it('explains why the section is hidden', () => {
    user = null;
    expect(renderHook(() => useUserProfileConnectedAccountsModel({})).result.current).toEqual({
      status: 'hidden',
      reason: 'no_user',
    });

    user = createUser('user_1');
    socialEnabled = false;
    expect(renderHook(() => useUserProfileConnectedAccountsModel({})).result.current).toEqual({
      status: 'hidden',
      reason: 'unavailable',
    });
  });

  it.each(['signed out', 'different user'])('rejects captured actions after %s', async change => {
    const original = user;
    if (!original) {
      throw new Error('expected user');
    }
    const model = ready(renderHook(() => useUserProfileConnectedAccountsModel({})).result.current);

    user = change === 'signed out' ? null : createUser('user_2');

    await expect(model.connect('oauth_google')).rejects.toMatchObject({ code: 'unavailable' });
    await expect(model.reconnect('idn_github')).rejects.toMatchObject({ code: 'unavailable' });
    await expect(model.remove('idn_github')).rejects.toMatchObject({ code: 'unavailable' });
    expect(original.createExternalAccount).not.toHaveBeenCalled();
    expect(original.externalAccounts[0].destroy).not.toHaveBeenCalled();
  });

  it('does not reload a user who changed while the OAuth popup was open', async () => {
    const original = user;
    if (!original) {
      throw new Error('expected user');
    }
    transport = {
      getRedirectUrl: () => Promise.resolve('https://app.example/profile'),
      open: vi.fn(() => {
        user = createUser('user_2');
        return Promise.resolve({ callbackUrl: 'https://app.example/callback?rotating_token_nonce=nonce' });
      }),
    };
    const model = ready(renderHook(() => useUserProfileConnectedAccountsModel({})).result.current);

    await expect(model.connect('oauth_google')).rejects.toMatchObject({ code: 'unavailable' });
    expect(original.reload).not.toHaveBeenCalled();
  });

  it('rejects a missing verification URL with a typed error', async () => {
    user?.createExternalAccount.mockResolvedValue({ verification: null });
    const model = ready(renderHook(() => useUserProfileConnectedAccountsModel({})).result.current);

    await expect(model.connect('oauth_google')).rejects.toMatchObject({ code: 'missing_verification_url' });
  });

  it('rejects a strategy that is not enabled', async () => {
    const model = ready(renderHook(() => useUserProfileConnectedAccountsModel({})).result.current);

    await expect(model.connect('oauth_facebook')).rejects.toMatchObject({ code: 'unavailable' });
    expect(user?.createExternalAccount).not.toHaveBeenCalled();
  });

  it('rejects removal of an account that no longer exists', async () => {
    const model = ready(renderHook(() => useUserProfileConnectedAccountsModel({})).result.current);

    await expect(model.remove('idn_missing')).rejects.toMatchObject({ code: 'unavailable' });
  });
});
