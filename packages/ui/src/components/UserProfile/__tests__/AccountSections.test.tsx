import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { clearFetchCache } from '../../../hooks';
import {
  AccountConnectedAccounts,
  AccountEmails,
  AccountEnterpriseAccounts,
  AccountPhone,
  AccountUsername,
  AccountWeb3,
} from '../AccountSections';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('AccountSections — self-gating visibility', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  describe('AccountUsername', () => {
    it('renders when username is enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withUser({ email_addresses: ['test@clerk.com'], username: 'testuser' });
      });

      render(<AccountUsername />, { wrapper });
      screen.getByText('testuser');
    });

    it('returns null when username is disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { container } = render(<AccountUsername />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });

  describe('AccountEmails', () => {
    it('renders email list when enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUser({ email_addresses: ['a@clerk.com', 'b@clerk.com'] });
      });

      render(
        <CardStateProvider>
          <AccountEmails />
        </CardStateProvider>,
        { wrapper },
      );
      screen.getByText('a@clerk.com');
      screen.getByText('b@clerk.com');
    });

    it('returns null when email is disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { container } = render(<AccountEmails />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });

  describe('AccountPhone', () => {
    it('renders phone list when enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withUser({ email_addresses: ['test@clerk.com'], phone_numbers: ['+11111111111'] });
      });

      render(
        <CardStateProvider>
          <AccountPhone />
        </CardStateProvider>,
        { wrapper },
      );
      expect(screen.getAllByText(/phone number/i).length).toBeGreaterThan(0);
    });

    it('returns null when phone is disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { container } = render(<AccountPhone />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });

  describe('AccountConnectedAccounts', () => {
    it('renders when social providers are enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withUser({
          email_addresses: ['test@clerk.com'],
          external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
        });
      });

      render(<AccountConnectedAccounts />, { wrapper });
      screen.getByText(/connected accounts/i);
    });

    it('returns null when no social providers are enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { container } = render(<AccountConnectedAccounts />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });

  describe('AccountEnterpriseAccounts', () => {
    it('renders when enterprise SSO is enabled and the user has an active enterprise account', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEnterpriseSso();
        f.withUser({
          email_addresses: ['test@clerk.com'],
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
                logo_public_url: null,
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

      render(<AccountEnterpriseAccounts />, { wrapper });
      screen.getByText(/enterprise accounts/i);
    });

    it('returns null when enterprise SSO is disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { container } = render(<AccountEnterpriseAccounts />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });

  describe('AccountWeb3', () => {
    it('renders when web3_wallet is enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withWeb3Wallet();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(<AccountWeb3 />, { wrapper });
      screen.getByText(/web3 wallets/i);
    });

    it('returns null when web3_wallet is disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { container } = render(<AccountWeb3 />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });
});
