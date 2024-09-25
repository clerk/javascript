import type { SamlAccountJSON } from '@clerk/types';
import { describe, it } from '@jest/globals';

import { render, screen, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
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

    it('shows the enterprise accounts of the user', async () => {
      const emailAddress = 'george@jungle.com';
      const firstName = 'George';
      const lastName = 'Clerk';

      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withSaml();
        f.withUser({
          email_addresses: [emailAddress],
          saml_accounts: [
            {
              id: 'samlacc_foo',
              provider: 'saml_okta',
              email_address: emailAddress,
              first_name: firstName,
              last_name: lastName,
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

    describe('with `disable_additional_identifications`', () => {
      const emailAddress = 'george@jungle.com';
      const phoneNumber = '+301234567890';
      const firstName = 'George';
      const lastName = 'Clerk';

      const samlAccount: SamlAccountJSON = {
        id: 'samlacc_foo',
        provider: 'saml_okta',
        email_address: emailAddress,
        first_name: firstName,
        last_name: lastName,
        saml_connection: {
          id: 'samlc_foo',
          active: true,
          disable_additional_identifications: true,
          allow_idp_initiated: true,
          allow_subdomains: true,
          domain: 'foo.com',
          name: 'Foo',
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
          object: 'saml_connection',
          provider: 'saml_okta',
          sync_user_attributes: true,
        },
        active: true,
        object: 'saml_account',
        provider_user_id: '',
      };

      it('shows only the enterprise accounts of the user', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPhoneNumber();
          f.withSocialProvider({ provider: 'google' });
          f.withSaml();
          f.withUser({
            email_addresses: [emailAddress],
            saml_accounts: [samlAccount],
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
          f.withSaml();
          f.withUser({
            email_addresses: [emailAddress],
            phone_numbers: [phoneNumber],
            external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
            saml_accounts: [samlAccount],
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
