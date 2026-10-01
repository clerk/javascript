import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  projectEnterpriseAccounts,
  useUserProfileEnterpriseAccountsModel,
} from './user-profile-enterprise-accounts-section.model';

type TestUser = {
  id: string;
  enterpriseAccounts: never[];
  createExternalAccount: ReturnType<typeof vi.fn>;
};

function createUser(id: string): TestUser {
  return {
    id,
    enterpriseAccounts: [],
    createExternalAccount: vi.fn(() =>
      Promise.resolve({
        verification: { externalVerificationRedirectURL: new URL('https://idp.example/authorize') },
      }),
    ),
  };
}

let user: TestUser | null;
let enabled: boolean;

const clerk = {
  get user() {
    return user;
  },
  __internal_windowNavigate: vi.fn(),
};

vi.mock('@clerk/shared/react', () => ({
  useClerk: () => clerk,
  useUser: () => ({ isLoaded: true, user }),
  __internal_useUserEnterpriseConnections: () => ({
    data: [{ id: 'okta', name: 'Acme Okta', allowOrganizationAccountLinking: true }],
  }),
}));

vi.mock('../../../hooks/useMosaicEnvironment', () => ({
  useMosaicEnvironment: () => ({ userSettings: { enterpriseSSO: { enabled } } }),
}));

beforeEach(() => {
  user = createUser('user_1');
  enabled = true;
  clerk.__internal_windowNavigate.mockClear();
});

afterEach(cleanup);

function ready(model: ReturnType<typeof useUserProfileEnterpriseAccountsModel>) {
  if (model.status !== 'ready') {
    throw new Error('expected ready model');
  }
  return model;
}

describe('useUserProfileEnterpriseAccountsModel', () => {
  it('explains why the section is hidden', () => {
    user = null;
    expect(renderHook(() => useUserProfileEnterpriseAccountsModel()).result.current).toEqual({
      status: 'hidden',
      reason: 'no_user',
    });

    user = createUser('user_1');
    enabled = false;
    expect(renderHook(() => useUserProfileEnterpriseAccountsModel()).result.current).toEqual({
      status: 'hidden',
      reason: 'unavailable',
    });
  });

  it.each(['signed out', 'different user'])('rejects a captured connect after %s', async change => {
    const original = user;
    const model = ready(renderHook(() => useUserProfileEnterpriseAccountsModel()).result.current);

    user = change === 'signed out' ? null : createUser('user_2');

    await expect(model.connect('okta')).rejects.toMatchObject({ code: 'unavailable' });
    expect(original?.createExternalAccount).not.toHaveBeenCalled();
  });

  it('rejects a connection that is not offered', async () => {
    const model = ready(renderHook(() => useUserProfileEnterpriseAccountsModel()).result.current);

    await expect(model.connect('saml')).rejects.toMatchObject({ code: 'unavailable' });
    expect(user?.createExternalAccount).not.toHaveBeenCalled();
  });

  it('rejects a missing verification URL with a typed error', async () => {
    user?.createExternalAccount.mockResolvedValue({ verification: null });
    const model = ready(renderHook(() => useUserProfileEnterpriseAccountsModel()).result.current);

    await expect(model.connect('okta')).rejects.toMatchObject({ code: 'missing_verification_url' });
    expect(clerk.__internal_windowNavigate).not.toHaveBeenCalled();
  });
});

describe('projectEnterpriseAccounts', () => {
  const connection = (id: string, allowOrganizationAccountLinking = true) => ({
    id,
    name: id,
    allowOrganizationAccountLinking,
  });
  const account = (id: string, enterpriseConnectionId: string, active = true, error?: string) => ({
    id,
    emailAddress: `${id}@example.com`,
    enterpriseConnectionId,
    verification: error ? { error: { longMessage: error } } : null,
    enterpriseConnection: { active, name: enterpriseConnectionId, logoPublicUrl: null },
  });

  it('hides the section when enterprise SSO is disabled', () => {
    expect(projectEnterpriseAccounts({ enabled: false, accounts: [], connections: [connection('okta')] })).toEqual({
      status: 'hidden',
    });
  });

  it('hides the section when there is nothing to show', () => {
    expect(
      projectEnterpriseAccounts({ enabled: true, accounts: [], connections: [connection('saml', false)] }),
    ).toEqual({ status: 'hidden' });
  });

  it('shows active accounts and offers only unlinked, linkable connections', () => {
    const projection = projectEnterpriseAccounts({
      enabled: true,
      accounts: [account('ent_okta', 'okta'), account('ent_old', 'old', false)],
      connections: [connection('okta'), connection('azure'), connection('saml', false)],
    });
    expect(projection.status === 'ready' && projection.accounts.map(a => a.id)).toEqual(['ent_okta']);
    expect(projection.status === 'ready' && projection.connections.map(c => c.id)).toEqual(['azure']);
  });

  it('flags accounts whose verification failed', () => {
    const projection = projectEnterpriseAccounts({
      enabled: true,
      accounts: [account('ent_okta', 'okta', true, 'Verification failed')],
      connections: [],
    });
    expect(projection.status === 'ready' && projection.accounts[0]?.requiresAction).toBe(true);
  });
});
