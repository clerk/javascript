import type { EnterpriseAccountJSON } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { AccountPage } from '../AccountPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('AccountPage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    render(<AccountPage />, { wrapper });
  });

  describe('Sections', () => {
    it('open the profile section and can update name', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Clerk', last_name: 'User' });
      });

      const { getByText, getByLabelText, getByRole, userEvent, queryByText, queryByLabelText } = render(
        <AccountPage />,
        { wrapper },
      );
      getByText('Clerk User');
      await userEvent.click(getByRole('button', { name: /update profile/i }));
      await waitFor(() => getByLabelText(/first name/i));
      expect(queryByText('Clerk User')).not.toBeInTheDocument();
      expect(queryByLabelText(/last name/i)).toBeInTheDocument();

      expect(getByRole('button', { name: /save$/i })).toBeDisabled();
    });

    it('open the profile section and cannot update name', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Clerk', last_name: 'User' });
      });

      const { getByText, getByRole, userEvent, queryByText, queryByLabelText } = render(<AccountPage />, { wrapper });
      getByText('Clerk User');
      await userEvent.click(getByRole('button', { name: /update profile/i }));
      await waitFor(() => getByRole('button', { name: /save/i }));
      expect(queryByText('Clerk User')).not.toBeInTheDocument();
      expect(queryByLabelText(/first name/i)).not.toBeInTheDocument();
      expect(queryByLabelText(/last name/i)).not.toBeInTheDocument();

      expect(getByRole('button', { name: /save$/i })).toBeDisabled();
    });

    it('hides section that are disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          first_name: 'George',
          last_name: 'Clerk',
        });
      });

      const { queryByText } = render(<AccountPage />, { wrapper });
      expect(queryByText(/Email addresses/i)).not.toBeInTheDocument();
      expect(queryByText(/Phone numbers/i)).not.toBeInTheDocument();
      expect(queryByText(/Connected Accounts/i)).not.toBeInTheDocument();
      expect(queryByText(/Enterprise Accounts/i)).not.toBeInTheDocument();
    });

    it('shows the connected accounts of the user', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withUser({
          external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
          first_name: 'George',
          last_name: 'Clerk',
        });
      });

      render(<AccountPage />, { wrapper });
      screen.getByText(/Connected Accounts/i);
      screen.getByText(/test@clerk.com/i);
      screen.getByText(/google/i);
    });

    describe('with active enterprise connection', () => {
      it('shows the enterprise accounts of the user', async () => {
        const emailAddress = 'george@jungle.com';
        const firstName = 'George';
        const lastName = 'Clerk';

        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withEnterpriseSso();
          f.withUser({
            email_addresses: [emailAddress],
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
            first_name: firstName,
            last_name: lastName,
          });
        });

        render(<AccountPage />, { wrapper });
        screen.getByText(/Enterprise Accounts/i);
        screen.getByText(/Okta Workforce/i);
      });
    });

    describe('with inactive enterprise connection', () => {
      it('does not show the enterprise accounts of the user', async () => {
        const emailAddress = 'george@jungle.com';
        const firstName = 'George';
        const lastName = 'Clerk';

        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withEnterpriseSso();
          f.withUser({
            email_addresses: [emailAddress],
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
            first_name: firstName,
            last_name: lastName,
          });
        });

        render(<AccountPage />, { wrapper });
        expect(screen.queryByText(/Enterprise Accounts/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Okta Workforce/i)).not.toBeInTheDocument();
      });
    });

    describe('with `disable_additional_identifications`', () => {
      const emailAddress = 'george@jungle.com';
      const phoneNumber = '+301234567890';
      const firstName = 'George';
      const lastName = 'Clerk';

      const enterpriseAccount: EnterpriseAccountJSON = {
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
          disable_additional_identifications: true,
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
      };

      it('shows only the enterprise accounts of the user', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPhoneNumber();
          f.withSocialProvider({ provider: 'google' });
          f.withEnterpriseSso();
          f.withUser({
            email_addresses: [emailAddress],
            enterprise_accounts: [enterpriseAccount],
            first_name: firstName,
            last_name: lastName,
          });
        });

        render(<AccountPage />, { wrapper });

        expect(screen.queryByText(/Add email address/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Phone numbers/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Connected Accounts/i)).not.toBeInTheDocument();
        screen.getByText(/Enterprise Accounts/i);
        screen.getByText(/Okta Workforce/i);
      });

      it('shows the enterprise accounts of the user, and the other sections, but hides the add button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPhoneNumber();
          f.withSocialProvider({ provider: 'google' });
          f.withEnterpriseSso();
          f.withUser({
            email_addresses: [emailAddress],
            phone_numbers: [phoneNumber],
            external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
            enterprise_accounts: [enterpriseAccount],
            first_name: firstName,
            last_name: lastName,
          });
        });

        render(<AccountPage />, { wrapper });

        screen.getByText(/Email addresses/i);
        screen.getByText(/Phone numbers/i);
        screen.getByText(/Connected Accounts/i);
        screen.getByText(/Enterprise Accounts/i);
        screen.getByText(/Okta Workforce/i);

        // Add buttons should be hidden
        expect(screen.queryByText(/Add email address/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Add phone number/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Connect account/i)).not.toBeInTheDocument();
      });
    });
  });
});
