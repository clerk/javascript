import { UserJSON } from '@clerk/types';

import { BaseResource } from './internal';
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
    BaseResource._fetch = jest.fn().mockReturnValue(Promise.resolve({ response: externalAccountJSON }));

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
      body: {
        redirect_url: 'https://www.example.com',
        strategy: 'oauth_dropbox',
      },
    });
  });

  it('creates a web3 wallet', async () => {
    const targetWeb3Wallet = '0x0000000000000000000000000000000000000000';
    const web3WalletJSON = {
      object: 'web3_wallet',
      web3_wallet: targetWeb3Wallet,
    };

    // @ts-ignore
    BaseResource._fetch = jest.fn().mockReturnValue(Promise.resolve({ response: web3WalletJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.createWeb3Wallet({ web3Wallet: targetWeb3Wallet });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/web3_wallets/',
      body: {
        web3_wallet: targetWeb3Wallet,
      },
    });
  });

  it('denotes if has a verified email address', () => {
    const userWithUnverifiedEmail = new User({
      email_addresses: [
        {
          emailAddress: 'unverified@clerk.dev',
          verification: null,
        },
      ],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    expect(userWithUnverifiedEmail.hasVerifiedEmailAddress).toEqual(false);

    const userWithVerifiedEmail = new User({
      email_addresses: [
        {
          emailAddress: 'unverified@clerk.dev',
          verification: {
            status: 'verified',
          },
        },
      ],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    expect(userWithVerifiedEmail.hasVerifiedEmailAddress).toEqual(true);
  });

  it('denotes if has a verified phone number', () => {
    const userWithUnverifiedPhone = new User({
      email_addresses: [],
      phone_numbers: [
        {
          phoneNumber: '+306900000000',
          verification: {
            status: 'unverified',
          },
        },
      ],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    expect(userWithUnverifiedPhone.hasVerifiedPhoneNumber).toEqual(false);

    const userWithVerifiedPhone = new User({
      email_addresses: [],
      phone_numbers: [
        {
          phoneNumber: '+306900000000',
          verification: {
            status: 'verified',
          },
        },
      ],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    expect(userWithVerifiedPhone.hasVerifiedPhoneNumber).toEqual(true);
  });

  it('creates a new TOTP secret for the user', async () => {
    const totpJSON = {
      id: 'totp_foo',
      object: 'totp',
      secret: 'BANANA',
      uri: 'otpauth://totp/Cyberdyne%20%28development%29:vin@diesel.family?algorithm=SHA1&digits=6&issuer=Cyberdyne+%28development%29&period=30&secret=BANANA',
      verified: false,
      createdAt: 1659607590792,
      updatedAt: 1659607590792,
    };

    // @ts-ignore
    BaseResource._fetch = jest.fn().mockReturnValue(Promise.resolve({ response: totpJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.createTOTP();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/totp',
    });
  });

  it('verifies a TOTP secret', async () => {
    const totpJSON = {
      id: 'totp_foo',
      object: 'totp',
      verified: true,
      createdAt: 1659607590792,
      updatedAt: 1659607590792,
    };

    // @ts-ignore
    BaseResource._fetch = jest.fn().mockReturnValue(Promise.resolve({ response: totpJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.verifyTOTP({ code: '123456' });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/totp/attempt_verification',
      body: { code: '123456' },
    });
  });

  it('disables TOTP for a user', async () => {
    const deletedObjectJSON = {
      object: 'externaltotp_account',
      id: 'totp_foo',
      deleted: true,
    };

    // @ts-ignore
    BaseResource._fetch = jest.fn().mockReturnValue(Promise.resolve({ response: deletedObjectJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.disableTOTP();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'DELETE',
      path: '/me/totp',
    });
  });

  it('creates backup codes', async () => {
    const backupCodeJSON = {
      object: 'backup_code',
      id: 'bcode_1234',
      codes: ['1234', '5678'],
    };

    // @ts-ignore
    BaseResource._fetch = jest.fn().mockReturnValue(Promise.resolve({ response: backupCodeJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.createBackupCode();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/backup_codes/',
    });
  });

  it('sets the right fullname', () => {
    expect(new User({ first_name: 'Firstname' } as unknown as UserJSON).fullName).toBe('Firstname');
    expect(new User({ last_name: 'Lastname' } as unknown as UserJSON).fullName).toBe('Lastname');
    expect(new User({ first_name: 'Firstname', last_name: 'Lastname' } as unknown as UserJSON).fullName).toBe(
      'Firstname Lastname',
    );
    expect(new User({} as unknown as UserJSON).fullName).toBe(null);
  });
});
