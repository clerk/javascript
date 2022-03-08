import { ExternalAccountJSON, UserJSON, VerificationJSON } from '@clerk/types';
import { BaseResource, ExternalAccount } from 'core/resources/internal';

import { User } from './User';

describe('User', () => {

  it('creates an external account', async () => {
    const externalAccountJSON = {
      object: 'external_account',
      provider: 'dropbox',
      verification: {
        external_verification_redirect_url: 'https://www.example.com',
      },
    };

    // @ts-ignore
    BaseResource._fetch = jest.fn().mockReturnValue(
      Promise.resolve({ response: externalAccountJSON }),
    );

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.createExternalAccount({ strategy: 'oauth_dropbox', redirect_url: 'https://www.example.com' });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/external_accounts',
      body:
        {
          redirect_url: 'https://www.example.com',
          strategy: 'oauth_dropbox',
        }
    });
  });

});
