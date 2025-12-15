import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { EnterpriseAccountsSection } from '../EnterpriseAccountsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const withoutEnterpriseConnection = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withSocialProvider({ provider: 'github' });
  f.withUser({
    external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
  });
});

const withInactiveEnterpriseConnection = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withSocialProvider({ provider: 'github' });
  f.withEnterpriseSso();
  f.withUser({
    enterprise_accounts: [
      {
        object: 'enterprise_account',
        active: false,
        first_name: 'Laura',
        last_name: 'Serafim',
        protocol: 'saml',
        provider_user_id: null,
        public_metadata: {},
        email_address: 'test@clerk.com',
        provider: 'saml_okta',
        enterprise_connection: {
          object: 'enterprise_connection',
          provider: 'saml_okta',
          name: 'Okta Workforce',
          id: 'ent_123',
          active: false,
          allow_idp_initiated: false,
          allow_subdomains: false,
          disable_additional_identifications: false,
          sync_user_attributes: false,
          domain: 'foocorp.com',
          created_at: 123,
          updated_at: 123,
          logo_public_url: 'https://img.clerk.com/static/okta.svg',
          protocol: 'saml',
        },
        verification: {
          status: 'verified',
          strategy: 'enterprise_sso',
          verified_at_client: 'foo',
          attempts: 0,
          error: {
            code: 'identifier_already_signed_in',
            long_message: "You're already signed in",
            message: "You're already signed in",
          },
          expire_at: 123,
          id: 'ver_123',
          object: 'verification',
        },
        id: 'eac_123',
      },
    ],
  });
});

const withOAuthBuiltInEnterpriseConnection = createFixtures.config(f => {
  f.withEnterpriseSso();
  f.withUser({
    enterprise_accounts: [
      {
        object: 'enterprise_account',
        active: true,
        first_name: 'Laura',
        last_name: 'Serafim',
        protocol: 'oauth',
        provider_user_id: null,
        public_metadata: {},
        email_address: 'test@clerk.com',
        provider: 'oauth_google',
        enterprise_connection: {
          object: 'enterprise_connection',
          provider: 'oauth_google',
          name: 'Google',
          id: 'ent_123',
          active: true,
          allow_idp_initiated: false,
          allow_subdomains: false,
          disable_additional_identifications: false,
          sync_user_attributes: false,
          domain: 'foocorp.com',
          created_at: 123,
          updated_at: 123,
          logo_public_url: 'https://img.clerk.com/static/google.svg',
          protocol: 'oauth',
        },
        verification: {
          status: 'verified',
          strategy: 'oauth_google',
          verified_at_client: 'foo',
          attempts: 0,
          error: {
            code: 'identifier_already_signed_in',
            long_message: "You're already signed in",
            message: "You're already signed in",
          },
          expire_at: 123,
          id: 'ver_123',
          object: 'verification',
        },
        id: 'eac_123',
      },
    ],
  });
});

const withOAuthCustomEnterpriseConnection = (logoPublicUrl: string | null) =>
  createFixtures.config(f => {
    f.withEnterpriseSso();
    f.withUser({
      enterprise_accounts: [
        {
          object: 'enterprise_account',
          active: true,
          first_name: 'Laura',
          last_name: 'Serafim',
          protocol: 'oauth',
          provider_user_id: null,
          public_metadata: {},
          email_address: 'test@clerk.com',
          provider: 'oauth_custom_roblox',
          enterprise_connection: {
            object: 'enterprise_connection',
            provider: 'oauth_custom_roblox',
            name: 'Roblox',
            id: 'ent_123',
            active: true,
            allow_idp_initiated: false,
            allow_subdomains: false,
            disable_additional_identifications: false,
            sync_user_attributes: false,
            domain: 'foocorp.com',
            created_at: 123,
            updated_at: 123,
            logo_public_url: logoPublicUrl,
            protocol: 'oauth',
          },
          verification: {
            status: 'verified',
            strategy: 'oauth_custom_roblox',
            verified_at_client: 'foo',
            attempts: 0,
            error: {
              code: 'identifier_already_signed_in',
              long_message: "You're already signed in",
              message: "You're already signed in",
            },
            expire_at: 123,
            id: 'ver_123',
            object: 'verification',
          },
          id: 'eac_123',
        },
      ],
    });
  });

const withSamlEnterpriseConnection = createFixtures.config(f => {
  f.withEnterpriseSso();
  f.withUser({
    enterprise_accounts: [
      {
        object: 'enterprise_account',
        active: true,
        first_name: 'Laura',
        last_name: 'Serafim',
        protocol: 'saml',
        provider_user_id: null,
        public_metadata: {},
        email_address: 'test@clerk.com',
        provider: 'saml_okta',
        enterprise_connection: {
          object: 'enterprise_connection',
          provider: 'saml_okta',
          name: 'Okta Workforce',
          id: 'ent_123',
          active: true,
          allow_idp_initiated: false,
          allow_subdomains: false,
          disable_additional_identifications: false,
          sync_user_attributes: false,
          domain: 'foocorp.com',
          created_at: 123,
          updated_at: 123,
          logo_public_url: 'https://img.clerk.com/static/okta.svg',
          protocol: 'saml',
        },
        verification: {
          status: 'verified',
          strategy: 'enterprise_sso',
          verified_at_client: 'foo',
          attempts: 0,
          error: {
            code: 'identifier_already_signed_in',
            long_message: "You're already signed in",
            message: "You're already signed in",
          },
          expire_at: 123,
          id: 'ver_123',
          object: 'verification',
        },
        id: 'eac_123',
      },
    ],
  });
});

describe('EnterpriseAccountsSection ', () => {
  describe('without enterprise accounts', () => {
    it('does not render the component', async () => {
      const { wrapper } = await createFixtures(withoutEnterpriseConnection);

      const { queryByText } = render(<EnterpriseAccountsSection />, { wrapper });

      expect(queryByText(/^Enterprise accounts/i)).not.toBeInTheDocument();
    });
  });

  describe('with inactive enterprise accounts accounts', () => {
    it('does not render the component', async () => {
      const { wrapper } = await createFixtures(withInactiveEnterpriseConnection);

      const { queryByText } = render(<EnterpriseAccountsSection />, { wrapper });

      expect(queryByText(/^Enterprise accounts/i)).not.toBeInTheDocument();
    });
  });

  describe('with oauth built-in', () => {
    it('renders connection', async () => {
      const { wrapper } = await createFixtures(withOAuthBuiltInEnterpriseConnection);

      const { getByText, getByRole } = render(<EnterpriseAccountsSection />, { wrapper });

      getByText(/^Enterprise accounts/i);
      getByText(/google/i);
      const img = getByRole('img', { name: /google/i });
      expect(img.getAttribute('src')).toBe('https://img.clerk.com/static/google.svg?width=160');
      getByText(/test@clerk.com/i);
    });
  });

  describe('with oauth custom', () => {
    describe('with logo', () => {
      it('renders connection with logo', async () => {
        const mockLogoUrl = 'https://mycdn.com/satic/foo.png';

        const { wrapper } = await createFixtures(withOAuthCustomEnterpriseConnection(mockLogoUrl));

        const { getByText, getByRole } = render(<EnterpriseAccountsSection />, { wrapper });

        getByText(/^Enterprise accounts/i);
        getByText(/roblox/i);
        const img = getByRole('img', { name: /roblox/i });
        expect(img.getAttribute('src')).toContain(mockLogoUrl);
        getByText(/test@clerk.com/i);
      });
    });

    describe('without logo', () => {
      it('renders connection with initial icon', async () => {
        const { wrapper } = await createFixtures(withOAuthCustomEnterpriseConnection(null));

        const { getByText } = render(<EnterpriseAccountsSection />, { wrapper });

        getByText(/^Enterprise accounts/i);
        getByText(/roblox/i);
        getByText('R', { exact: true });
        getByText(/test@clerk.com/i);
      });
    });
  });

  describe('with saml', () => {
    it('renders connection', async () => {
      const { wrapper } = await createFixtures(withSamlEnterpriseConnection);

      const { getByText, getByRole } = render(<EnterpriseAccountsSection />, { wrapper });

      getByText(/^Enterprise accounts/i);
      getByText(/okta workforce/i);
      const img = getByRole('img', { name: /okta/i });
      expect(img.getAttribute('src')).toBe('https://img.clerk.com/static/okta.svg?width=160');
      getByText(/test@clerk.com/i);
    });
  });
});
