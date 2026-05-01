import type { EnterpriseConnectionJSON, UserJSON } from '@clerk/shared/types';
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

  it('creates an enterprise connection', async () => {
    const enterpriseConnectionJSON = {
      id: 'ec_new',
      object: 'enterprise_connection' as const,
      name: 'New SSO',
      active: true,
      provider: 'saml_okta',
      logo_public_url: null,
      domains: ['acme.com'],
      organization_id: null,
      sync_user_attributes: true,
      disable_additional_identifications: false,
      allow_organization_account_linking: false,
      custom_attributes: [],
      oauth_config: null,
      saml_connection: null,
      created_at: 1234567890,
      updated_at: 1234567890,
    };

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: enterpriseConnectionJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    const conn = await user.createEnterpriseConnection({
      provider: 'saml_okta',
      name: 'New SSO',
      organizationId: 'org_1',
      saml: { idpEntityId: 'https://idp.example.com' },
    });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/enterprise_connections',
      body: {
        provider: 'saml_okta',
        name: 'New SSO',
        organization_id: 'org_1',
        saml: { idp_entity_id: 'https://idp.example.com' },
      },
    });

    expect(conn.id).toBe('ec_new');
    expect(conn.name).toBe('New SSO');
  });

  it('updates an enterprise connection', async () => {
    const enterpriseConnectionJSON = {
      id: 'ec_123',
      object: 'enterprise_connection' as const,
      name: 'Updated',
      active: false,
      provider: 'saml_okta',
      logo_public_url: null,
      domains: ['acme.com'],
      organization_id: null,
      sync_user_attributes: true,
      disable_additional_identifications: false,
      allow_organization_account_linking: false,
      custom_attributes: [],
      oauth_config: null,
      saml_connection: null,
      created_at: 1234567890,
      updated_at: 1234567900,
    };

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: enterpriseConnectionJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.updateEnterpriseConnection('ec_123', {
      name: 'Updated',
      active: false,
      syncUserAttributes: true,
    });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'PATCH',
      path: '/me/enterprise_connections/ec_123',
      body: {
        name: 'Updated',
        active: false,
        sync_user_attributes: true,
      },
    });
  });

  it('preserves `saml.attributeMapping` and `saml.customAttributes` keys when creating an enterprise connection', async () => {
    BaseResource._fetch = vi.fn().mockReturnValue(
      Promise.resolve({
        response: {
          id: 'ec_new',
          object: 'enterprise_connection' as const,
          name: 'New SSO',
          active: true,
          provider: 'saml_okta',
          logo_public_url: null,
          domains: [],
          organization_id: null,
          sync_user_attributes: true,
          disable_additional_identifications: false,
          allow_organization_account_linking: false,
          custom_attributes: [],
          oauth_config: null,
          saml_connection: null,
          created_at: 1,
          updated_at: 1,
        },
      }),
    );

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.createEnterpriseConnection({
      provider: 'saml_okta',
      name: 'New SSO',
      saml: {
        idpEntityId: 'https://idp.example.com',
        attributeMapping: {
          emailAddress: 'mail',
          firstName: 'givenName',
          'custom:role': 'role',
        },
      },
    });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/enterprise_connections',
      body: {
        provider: 'saml_okta',
        name: 'New SSO',
        saml: {
          idp_entity_id: 'https://idp.example.com',
          attribute_mapping: {
            emailAddress: 'mail',
            firstName: 'givenName',
            'custom:role': 'role',
          },
        },
      },
    });
  });

  it('preserves `customAttributes` and `saml.attributeMapping` keys when updating an enterprise connection', async () => {
    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(
      Promise.resolve({
        response: {
          id: 'ec_123',
          object: 'enterprise_connection' as const,
          name: 'Updated',
          active: true,
          provider: 'saml_okta',
          logo_public_url: null,
          domains: [],
          organization_id: null,
          sync_user_attributes: true,
          disable_additional_identifications: false,
          allow_organization_account_linking: false,
          custom_attributes: [],
          oauth_config: null,
          saml_connection: null,
          created_at: 1,
          updated_at: 2,
        },
      }),
    );

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.updateEnterpriseConnection('ec_123', {
      customAttributes: {
        MyClaim: 'x',
        CustomValue: 'y',
        nestedCamelKey: { innerCamelKey: 'z' },
      },
      saml: {
        attributeMapping: {
          emailAddress: 'mail',
          firstName: 'givenName',
        },
      },
    });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'PATCH',
      path: '/me/enterprise_connections/ec_123',
      body: {
        custom_attributes: {
          MyClaim: 'x',
          CustomValue: 'y',
          nestedCamelKey: { innerCamelKey: 'z' },
        },
        saml: {
          attribute_mapping: {
            emailAddress: 'mail',
            firstName: 'givenName',
          },
        },
      },
    });
  });

  it('deletes an enterprise connection', async () => {
    const deletedJSON = {
      object: 'enterprise_connection',
      id: 'ec_123',
      deleted: true,
    };

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: deletedJSON }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    const result = await user.deleteEnterpriseConnection('ec_123');

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'DELETE',
      path: '/me/enterprise_connections/ec_123',
    });

    expect(result.id).toBe('ec_123');
    expect(result.deleted).toBe(true);
  });

  it('creates an enterprise connection test run', async () => {
    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: { url: 'https://example.com/test' } }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    const init = await user.createEnterpriseConnectionTestRun('ec_123');

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/enterprise_connections/ec_123/test_runs',
    });

    expect(init.url).toBe('https://example.com/test');
  });

  it('lists enterprise connection test runs', async () => {
    const paginated = {
      data: [
        {
          object: 'enterprise_connection_test_run' as const,
          id: 'run_1',
          status: 'success',
          connection_type: 'saml' as const,
          created_at: 1700000000000,
        },
      ],
      total_count: 1,
    };

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: paginated }));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    const result = await user.getEnterpriseConnectionTestRuns('ec_123', {
      initialPage: 1,
      pageSize: 10,
      status: ['pending', 'success'],
    });

    // @ts-ignore
    const call = BaseResource._fetch.mock.calls[0][0];
    expect(call.method).toBe('GET');
    expect(call.path).toBe('/me/enterprise_connections/ec_123/test_runs');
    expect(call.search.get('limit')).toBe('10');
    expect(call.search.get('offset')).toBe('0');
    expect(call.search.getAll('status')).toEqual(['pending', 'success']);

    expect(result.total_count).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('run_1');
    expect(result.data[0].connectionType).toBe('saml');
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
