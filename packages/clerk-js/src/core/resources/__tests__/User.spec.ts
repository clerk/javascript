import type { UserJSON } from '@clerk/types';
import { describe, expect, it, vi } from 'vitest';

import { BaseResource } from '../internal';
import { User } from '../User';

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
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: externalAccountJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.createExternalAccount({
      strategy: 'oauth_dropbox',
      redirectUrl: 'https://www.example.com',
      additionalScopes: ['view'],
    });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/external_accounts',
      body: {
        redirect_url: 'https://www.example.com',
        strategy: 'oauth_dropbox',
        additional_scope: ['view'],
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
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: web3WalletJSON }));

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
          emailAddress: 'unverified@clerk.com',
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
          emailAddress: 'unverified@clerk.com',
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
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: totpJSON }));

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
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: totpJSON }));

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
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: deletedObjectJSON }));

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
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: backupCodeJSON }));

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

  describe('Set the right fullName', () => {
    const cases: Array<[string | null | undefined, string | null | undefined, string | null | undefined]> = [
      // firstName, lastName, fullName
      ['A', 'B', 'A B'],
      ['', 'B', 'B'],
      ['A', '', 'A'],
      ['', '', null],
      [null, '', null],
      [null, null, null],
      [undefined, undefined, null],
    ];

    it.each(cases)("firstName: '%s', lastName: '%s'  =>  fullName: '%s'", (first_name, last_name, fullName) => {
      const user = new User({
        first_name,
        last_name,
      } as unknown as UserJSON);
      expect(user.fullName).toBe(fullName);
    });
  });

  it('.updatePassword triggers a request to change password', async () => {
    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: {} }));

    const user = new User({} as unknown as UserJSON);
    const params = {
      currentPassword: 'current-password',
      newPassword: 'new-password',
    };
    await user.updatePassword(params);

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/change_password',
      body: params,
    });
  });

  it('.removePassword triggers a request to remove password', async () => {
    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: {} }));

    const user = new User({} as unknown as UserJSON);
    const params = {
      currentPassword: 'current-password',
    };
    await user.removePassword(params);

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/remove_password',
      body: params,
    });
  });
});

describe('User Snapshots', () => {
  it('should match snapshot for user instance structure', () => {
    const userJSON: UserJSON = {
      object: 'user',
      id: 'user_123',
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      image_url: 'https://example.com/avatar.jpg',
      has_image: true,
      primary_email_address_id: 'email_123',
      primary_phone_number_id: null,
      primary_web3_wallet_id: null,
      email_addresses: [
        {
          object: 'email_address',
          id: 'email_123',
          email_address: 'john@example.com',
          verification: {
            object: 'verification',
            id: 'verification_123',
            status: 'verified',
            strategy: 'email_code',
            attempts: 1,
            expire_at: 1735689600000,
            verified_at_client: null,
            error: null,
          },
          linked_to: [],
          created_at: 1735689500000,
          updated_at: 1735689600000,
        },
      ],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
      passkeys: [],
      saml_accounts: [],
      public_metadata: { role: 'user' },
      unsafe_metadata: { preferences: { theme: 'dark' } },
      created_at: 1735689500000,
      updated_at: 1735689600000,
      last_sign_in_at: 1735689550000,
      password_enabled: true,
      totp_enabled: false,
      backup_code_enabled: false,
      two_factor_enabled: false,
      banned: false,
      locked: false,
      lockout_expires_in_seconds: null,
      verification_attempts_remaining: 3,
      delete_self_enabled: true,
      create_organization_enabled: true,
      last_active_at: 1735689600000,
      profile_image_url: 'https://example.com/avatar.jpg',
      organization_memberships: [],
    };

    const user = new User(userJSON);

    const userSnapshot = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      username: user.username,
      imageUrl: user.imageUrl,
      hasImage: user.hasImage,
      primaryEmailAddressId: user.primaryEmailAddressId,
      primaryPhoneNumberId: user.primaryPhoneNumberId,
      primaryWeb3WalletId: user.primaryWeb3WalletId,
      passwordEnabled: user.passwordEnabled,
      totpEnabled: user.totpEnabled,
      backupCodeEnabled: user.backupCodeEnabled,
      twoFactorEnabled: user.twoFactorEnabled,
      banned: user.banned,
      locked: user.locked,
      createdAt: user.createdAt?.getTime(),
      updatedAt: user.updatedAt?.getTime(),
      lastSignInAt: user.lastSignInAt?.getTime(),
      lastActiveAt: user.lastActiveAt?.getTime(),
      publicMetadata: user.publicMetadata,
      unsafeMetadata: user.unsafeMetadata,
      emailAddresses: user.emailAddresses.map(email => ({
        id: email.id,
        emailAddress: email.emailAddress,
        verification: email.verification
          ? {
              status: email.verification.status,
              strategy: email.verification.strategy,
            }
          : null,
      })),
    };

    expect(userSnapshot).toMatchSnapshot();
  });

  it('should match snapshot for minimal user', () => {
    const userJSON: UserJSON = {
      object: 'user',
      id: 'user_minimal',
      first_name: null,
      last_name: null,
      username: null,
      image_url: null,
      has_image: false,
      primary_email_address_id: null,
      primary_phone_number_id: null,
      primary_web3_wallet_id: null,
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
      passkeys: [],
      saml_accounts: [],
      public_metadata: {},
      unsafe_metadata: {},
      created_at: 1735689600000,
      updated_at: 1735689600000,
      last_sign_in_at: null,
      password_enabled: false,
      totp_enabled: false,
      backup_code_enabled: false,
      two_factor_enabled: false,
      banned: false,
      locked: false,
      lockout_expires_in_seconds: null,
      verification_attempts_remaining: 3,
      delete_self_enabled: true,
      create_organization_enabled: false,
      last_active_at: null,
      profile_image_url: null,
      organization_memberships: [],
    };

    const user = new User(userJSON);

    const userSnapshot = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      username: user.username,
      imageUrl: user.imageUrl,
      hasImage: user.hasImage,
      passwordEnabled: user.passwordEnabled,
      totpEnabled: user.totpEnabled,
      backupCodeEnabled: user.backupCodeEnabled,
      twoFactorEnabled: user.twoFactorEnabled,
      banned: user.banned,
      locked: user.locked,
      createdAt: user.createdAt?.getTime(),
      updatedAt: user.updatedAt?.getTime(),
      lastSignInAt: user.lastSignInAt?.getTime(),
      lastActiveAt: user.lastActiveAt?.getTime(),
      publicMetadata: user.publicMetadata,
      unsafeMetadata: user.unsafeMetadata,
    };

    expect(userSnapshot).toMatchSnapshot();
  });
});
