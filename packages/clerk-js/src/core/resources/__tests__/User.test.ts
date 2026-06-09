import type { EnterpriseConnectionJSON, UserJSON } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('creates an external account with enterprise connection id', async () => {
    const externalAccountJSON = {
      object: 'external_account',
      provider: 'saml_okta',
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
      enterpriseConnectionId: 'ec_123',
      redirectUrl: 'https://www.example.com',
    });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/external_accounts',
      body: {
        strategy: undefined,
        redirect_url: 'https://www.example.com',
        additional_scope: undefined,
        enterprise_connection_id: 'ec_123',
      },
    });
  });

  it('fetches enterprise connections', async () => {
    const enterpriseConnectionsJSON: EnterpriseConnectionJSON[] = [
      {
        id: 'ec_123',
        object: 'enterprise_connection',
        name: 'Acme Corp SSO',
        active: true,
        allow_organization_account_linking: true,
        provider: 'saml_okta',
        logo_public_url: null,
        domains: ['acme.com'],
        organization_id: null,
        sync_user_attributes: true,
        disable_additional_identifications: false,
        custom_attributes: [],
        oauth_config: null,
        saml_connection: {
          id: 'saml_123',
          name: 'Acme Corp SSO',
          active: true,
          idp_entity_id: 'https://idp.acme.com/entity',
          idp_sso_url: 'https://idp.acme.com/sso',
          idp_certificate: 'MIICertificatePlaceholder',
          idp_metadata_url: 'https://idp.acme.com/metadata',
          idp_metadata: '',
          acs_url: 'https://clerk.example.com/v1/saml/acs',
          sp_entity_id: 'https://clerk.example.com',
          sp_metadata_url: 'https://clerk.example.com/v1/saml/metadata',
          allow_subdomains: false,
          allow_idp_initiated: false,
          force_authn: false,
        },
        created_at: 1234567890,
        updated_at: 1234567890,
      },
    ];

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: enterpriseConnectionsJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    const connections = await user.getEnterpriseConnections();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'GET',
      path: '/me/enterprise_connections',
    });

    expect(connections).toHaveLength(1);
    expect(connections[0].name).toBe('Acme Corp SSO');
    expect(connections[0].allowOrganizationAccountLinking).toBe(true);
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

  it('.updateMetadata triggers a PATCH to /me/metadata with stringified unsafe_metadata', async () => {
    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: {} }));

    const user = new User({} as unknown as UserJSON);
    await user.updateMetadata({ unsafeMetadata: { theme: 'dark', nested: { level: 1 } } });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'PATCH',
      path: '/me/metadata',
      body: {
        unsafeMetadata: JSON.stringify({ theme: 'dark', nested: { level: 1 } }),
      },
    });
  });

  it('.updateMetadata sends an explicit null patch when a key is being removed', async () => {
    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: {} }));

    const user = new User({} as unknown as UserJSON);
    await user.updateMetadata({ unsafeMetadata: { theme: null as unknown as undefined } });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'PATCH',
      path: '/me/metadata',
      body: {
        unsafeMetadata: JSON.stringify({ theme: null }),
      },
    });
  });

  describe('.update with metadata routing', () => {
    beforeEach(() => {
      // @ts-ignore
      BaseResource.clerk = { publishableKey: 'pk_test_foo' };
    });

    it('calls PATCH /me only when no unsafeMetadata is provided', async () => {
      // @ts-ignore
      BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: {} }));

      const user = new User({} as unknown as UserJSON);
      await user.update({ firstName: 'Jane' });

      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/me',
        body: { firstName: 'Jane' },
      });
    });

    it('routes only-metadata updates to /me/metadata as an RFC 7396 merge patch', async () => {
      // Server still reflects the locally-cached state; the reload returns
      // the same metadata, so the diff is computed identically.
      // @ts-ignore
      BaseResource._fetch = vi.fn().mockImplementation((opts: any) => {
        if (opts.method === 'GET') {
          return Promise.resolve({
            response: { unsafe_metadata: { theme: 'dark', layout: 'compact' } },
          });
        }
        return Promise.resolve({ response: {} });
      });

      // Seed current state: { theme: 'dark', layout: 'compact' }. Desired
      // state drops `layout` and changes `theme` — the merge patch must
      // null-delete `layout` to preserve replace semantics.
      const user = new User({
        unsafe_metadata: { theme: 'dark', layout: 'compact' },
      } as unknown as UserJSON);

      await user.update({ unsafeMetadata: { theme: 'light' } });

      // Two calls now: a GET /me reload to refresh the diff baseline, then
      // PATCH /me/metadata with the computed patch.
      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledTimes(2);
      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ method: 'GET', path: '/me' }),
        expect.anything(),
      );
      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenNthCalledWith(2, {
        method: 'PATCH',
        path: '/me/metadata',
        body: {
          unsafeMetadata: JSON.stringify({ theme: 'light', layout: null }),
        },
      });
    });

    it('reloads before diffing so server-side mutations are not lost', async () => {
      // The local cache thinks unsafeMetadata is { a: 1 }, but the server
      // has actually drifted to { a: 1, b: 2 }. Without the pre-diff reload
      // the SDK would compute mergePatch({ a: 1 }, { a: 99 }) = { a: 99 }
      // and `b` would survive on the server, silently violating the
      // caller's intended replace semantics.
      // @ts-ignore
      BaseResource._fetch = vi.fn().mockImplementation((opts: any) => {
        if (opts.method === 'GET') {
          return Promise.resolve({
            response: { unsafe_metadata: { a: 1, b: 2 } },
          });
        }
        return Promise.resolve({ response: {} });
      });

      const user = new User({
        unsafe_metadata: { a: 1 },
      } as unknown as UserJSON);

      await user.update({ unsafeMetadata: { a: 99 } });

      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledTimes(2);
      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenNthCalledWith(2, {
        method: 'PATCH',
        path: '/me/metadata',
        body: {
          // The patch null-deletes `b` because the reload surfaced it as a
          // key the server has and the desired state does not.
          unsafeMetadata: JSON.stringify({ a: 99, b: null }),
        },
      });
    });

    it('splits mixed calls: PATCH /me for non-metadata, then PATCH /me/metadata for metadata', async () => {
      const calls: Array<{ method: string; path: string | undefined }> = [];
      // @ts-ignore
      BaseResource._fetch = vi.fn().mockImplementation((opts: any) => {
        calls.push({ method: opts.method, path: opts.path });
        return Promise.resolve({ response: {} });
      });

      const user = new User({
        unsafe_metadata: { foo: 'old' },
      } as unknown as UserJSON);

      await user.update({
        firstName: 'Jane',
        unsafeMetadata: { foo: 'new', bar: 'added' },
      });

      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledTimes(2);
      expect(calls[0]).toEqual({ method: 'PATCH', path: '/me' });
      expect(calls[1]).toEqual({ method: 'PATCH', path: '/me/metadata' });

      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenNthCalledWith(1, {
        method: 'PATCH',
        path: '/me',
        body: { firstName: 'Jane' },
      });
      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenNthCalledWith(2, {
        method: 'PATCH',
        path: '/me/metadata',
        body: {
          unsafeMetadata: JSON.stringify({ foo: 'new', bar: 'added' }),
        },
      });
    });

    it('makes only a reload call when desired metadata equals current (no PUT)', async () => {
      // The pre-diff reload always runs, but if the fresh server state
      // matches `desired` the computed patch is empty and we skip the PUT.
      // @ts-ignore
      BaseResource._fetch = vi.fn().mockImplementation((opts: any) => {
        if (opts.method === 'GET') {
          return Promise.resolve({
            response: { unsafe_metadata: { theme: 'dark' } },
          });
        }
        return Promise.resolve({ response: {} });
      });

      const user = new User({
        unsafe_metadata: { theme: 'dark' },
      } as unknown as UserJSON);

      await user.update({ unsafeMetadata: { theme: 'dark' } });

      // Exactly one call: the reload. No PATCH /me/metadata.
      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: '/me' }),
        expect.anything(),
      );
    });

    it('logs a deprecation warning when unsafeMetadata is passed to update()', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore
      BaseResource._fetch = vi.fn().mockImplementation((opts: any) => {
        if (opts.method === 'GET') {
          return Promise.resolve({ response: { unsafe_metadata: {} } });
        }
        return Promise.resolve({ response: {} });
      });

      const user = new User({} as unknown as UserJSON);
      await user.update({ unsafeMetadata: { theme: 'dark' } });

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('user.update({ unsafeMetadata })'));

      warnSpy.mockRestore();
    });

    it('does not log a deprecation warning when unsafeMetadata is not passed to update()', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore
      BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: {} }));

      const user = new User({} as unknown as UserJSON);
      await user.update({ firstName: 'Jane' });

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('does not log a deprecation warning for production publishable keys', async () => {
      // @ts-ignore
      BaseResource.clerk = { publishableKey: 'pk_live_foo' };
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore
      BaseResource._fetch = vi.fn().mockImplementation((opts: any) => {
        if (opts.method === 'GET') {
          return Promise.resolve({ response: { unsafe_metadata: {} } });
        }
        return Promise.resolve({ response: {} });
      });

      const user = new User({} as unknown as UserJSON);
      await user.update({ unsafeMetadata: { theme: 'dark' } });

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
