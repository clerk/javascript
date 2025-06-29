import { describe, expect, it, vi } from 'vitest';

import { BaseResource, ExternalAccount } from '../internal';

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
        approved_scopes: ['email', 'profile'],
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
          status: 'verified',
          strategy: 'oauth_google',
          external_verification_redirect_url: 'https://accounts.google.com/oauth/authorize',
        },
      },
      '/me/external_accounts',
    );

    const snapshot = {
      id: externalAccount.id,
      provider: externalAccount.provider,
      providerUserId: externalAccount.providerUserId,
      approvedScopes: externalAccount.approvedScopes,
      emailAddress: externalAccount.emailAddress,
      firstName: externalAccount.firstName,
      lastName: externalAccount.lastName,
      imageUrl: externalAccount.imageUrl,
      username: externalAccount.username,
      label: externalAccount.label,
      createdAt: externalAccount.createdAt?.getTime(),
      updatedAt: externalAccount.updatedAt?.getTime(),
      verification: externalAccount.verification
        ? {
            status: externalAccount.verification.status,
            strategy: externalAccount.verification.strategy,
          }
        : null,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for minimal external account', () => {
    const externalAccount = new ExternalAccount(
      {
        object: 'external_account',
        id: 'external_minimal',
        provider: 'github',
        provider_user_id: 'github_user_456',
        approved_scopes: [],
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
      },
      '/me/external_accounts',
    );

    const snapshot = {
      id: externalAccount.id,
      provider: externalAccount.provider,
      providerUserId: externalAccount.providerUserId,
      approvedScopes: externalAccount.approvedScopes,
      emailAddress: externalAccount.emailAddress,
      firstName: externalAccount.firstName,
      lastName: externalAccount.lastName,
      imageUrl: externalAccount.imageUrl,
      username: externalAccount.username,
      label: externalAccount.label,
      verification: externalAccount.verification,
    };

    expect(snapshot).toMatchSnapshot();
  });
});
