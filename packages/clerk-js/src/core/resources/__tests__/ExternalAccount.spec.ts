import { describe, expect, it, vi } from 'vitest';

import { BaseResource, ExternalAccount } from '../internal';

const FIXED_DATE = new Date('2025-01-01T00:00:00.000Z');

describe('External account', () => {
  it('reauthorize', async () => {
    const targetId = 'test_id';

    const externalAccountJSON = {
      object: 'external_account',
      id: targetId,
    };

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: externalAccountJSON }));

    const externalAccount = new ExternalAccount({ id: targetId }, '/me/external_accounts');
    await externalAccount.reauthorize({ additionalScopes: ['read', 'write'], redirectUrl: 'https://test.com' });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'PATCH',
      path: `/me/external_accounts/${targetId}/reauthorize`,
      body: {
        additional_scope: ['read', 'write'],
        redirect_url: 'https://test.com',
      },
    });
  });

  it('destroy', async () => {
    const targetId = 'test_id';

    const deletedObjectJSON = {
      object: 'external_account',
      id: targetId,
      deleted: true,
    };

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: deletedObjectJSON }));

    const externalAccount = new ExternalAccount({ id: targetId }, '/me/external_accounts');
    await externalAccount.destroy();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'DELETE',
      path: `/me/external_accounts/${targetId}`,
    });
  });
});

describe('ExternalAccount Snapshots', () => {
  it('should match snapshot for external account structure', () => {
    const externalAccount = new ExternalAccount(
      {
        object: 'external_account',
        id: 'external_123',
        provider: 'google',
        provider_user_id: 'google_user_123',
        approved_scopes: 'email,profile',
        email_address: 'user@gmail.com',
        first_name: 'John',
        last_name: 'Doe',
        image_url: 'https://lh3.googleusercontent.com/avatar.jpg',
        username: null,
        public_metadata: { source: 'oauth' },
        label: null,
        created_at: 1735689600000,
        updated_at: 1735689600000,
        verification: {
          object: 'verification',
          id: 'verification_123',
          status: 'verified',
          strategy: 'oauth_google',
          external_verification_redirect_url: 'https://accounts.google.com/oauth/authorize',
          verified_at_client: null,
          error: null,
          attempts: 1,
          expire_at: 1735689700000,
          nonce: null,
          message: null,
        },
      } as any,
      '/me/external_accounts',
    );

    expect(externalAccount).toMatchSnapshot();
  });

  it('should match snapshot for minimal external account', () => {
    const externalAccount = new ExternalAccount(
      {
        object: 'external_account',
        id: 'external_minimal',
        provider: 'github',
        provider_user_id: 'github_user_456',
        approved_scopes: '',
        email_address: null,
        first_name: null,
        last_name: null,
        image_url: null,
        username: 'githubuser',
        public_metadata: {},
        label: null,
        created_at: 1735689600000,
        updated_at: 1735689600000,
        verification: null,
      } as any,
      '/me/external_accounts',
    );

    expect(externalAccount).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    const externalAccount = new ExternalAccount(
      {
        object: 'external_account',
        id: 'external_snapshot',
        provider: 'google',
        provider_user_id: 'google_user_789',
        approved_scopes: 'email,profile,openid',
        email_address: 'snapshot@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        image_url: 'https://example.com/avatar.jpg',
        username: 'janesmith',
        public_metadata: {
          source: 'oauth',
          department: 'engineering',
          verified: true,
        },
        label: 'Work Account',
        created_at: 1735689500000,
        updated_at: 1735689600000,
        verification: {
          object: 'verification',
          id: 'verification_snapshot',
          status: 'verified',
          strategy: 'oauth_google',
          external_verification_redirect_url: 'https://accounts.google.com/oauth/authorize',
          attempts: 1,
          expire_at: 1735689800000,
          verified_at_client: null,
          error: null,
          nonce: null,
          message: null,
        },
      } as any,
      '/me/external_accounts',
    );

    expect(externalAccount.__internal_toSnapshot()).toMatchSnapshot();

    vi.useRealTimers();
  });
});
