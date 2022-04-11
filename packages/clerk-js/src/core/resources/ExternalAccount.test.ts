import { BaseResource, ExternalAccount } from 'core/resources/internal';

describe('External account', () => {
  it('destroy', async () => {
    const targetId = 'test_id';

    const deletedObjectJSON = {
      object: 'external_account',
      id: targetId,
      deleted: true,
    };

    // @ts-ignore
    BaseResource._fetch = jest.fn().mockReturnValue(Promise.resolve({ response: deletedObjectJSON }));

    const externalAccount = new ExternalAccount({ id: targetId }, '/me/external_accounts');
    await externalAccount.destroy();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'DELETE',
      path: `/me/external_accounts/${targetId}`,
    });
  });
});
