import { describe, it } from '@jest/globals';
import React from 'react';

import { render } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { EnterpriseAccountsSection } from '../EnterpriseAccountsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const withoutEnterpriseConnection = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withSocialProvider({ provider: 'github' });
  f.withUser({
    external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
  });
});

const withOAuthBuiltInEnterpriseConnection = createFixtures.config(f => {
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
        provider: 'google',
        enterprise_connection: {
          object: 'enterprise_connection',
          provider: 'google',
          name: 'FooCorp',
          id: 'ent_123',
          active: true,
          allow_idp_initiated: false,
          allow_subdomains: false,
          disable_additional_identifications: false,
          sync_user_attributes: false,
          domain: 'foocorp.com',
          created_at: 123,
          updated_at: 123,
          logo_public_url: null,
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

const withOAuthCustomEnterpriseConnection = createFixtures.config(f => {
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
          logo_public_url: null,
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
          name: 'FooCorp',
          id: 'ent_123',
          active: true,
          allow_idp_initiated: false,
          allow_subdomains: false,
          disable_additional_identifications: false,
          sync_user_attributes: false,
          domain: 'foocorp.com',
          created_at: 123,
          updated_at: 123,
          logo_public_url: null,
          protocol: 'saml',
        },
        verification: {
          status: 'verified',
          strategy: 'saml',
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
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(withoutEnterpriseConnection);

    const { getByText } = render(<EnterpriseAccountsSection />, { wrapper });

    getByText(/^Enterprise accounts/i);
  });

  describe('with oauth built-in', () => {
    it('renders connection', async () => {
      const { wrapper } = await createFixtures(withOAuthBuiltInEnterpriseConnection);

      const { getByText, getByRole } = render(<EnterpriseAccountsSection />, { wrapper });

      getByText(/^Enterprise accounts/i);
      getByText(/google/i);
      getByRole('img', { name: /google/i });
      getByText(/test@clerk.com/i);
    });
  });

  describe('with oauth custom', () => {
    it('renders connection', async () => {
      const { wrapper } = await createFixtures(withOAuthCustomEnterpriseConnection);

      const { getByText } = render(<EnterpriseAccountsSection />, { wrapper });

      getByText(/^Enterprise accounts/i);
      getByText(/roblox/i);
      getByText('R', { exact: true });
      getByText(/test@clerk.com/i);
    });
  });

  describe('with saml', () => {
    it('renders connection', async () => {
      const { wrapper } = await createFixtures(withSamlEnterpriseConnection);

      const { getByText, getByRole } = render(<EnterpriseAccountsSection />, { wrapper });

      getByText(/^Enterprise accounts/i);
      getByText(/okta workforce/i);
      getByRole('img', { name: /okta workforce/i });
      getByText(/test@clerk.com/i);
    });
  });
});
