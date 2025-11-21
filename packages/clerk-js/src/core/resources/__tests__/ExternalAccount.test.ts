import { describe, expect, it, vi } from 'vitest';

import { BaseResource } from '@/core/resources/Base';

import { ExternalAccount } from '../internal';

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
