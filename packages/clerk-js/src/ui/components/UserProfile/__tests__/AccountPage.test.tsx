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
    it('open the profile section and can edit name', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Clerk', last_name: 'User' });
      });

      const { getByText, getByRole, userEvent, queryByText, queryByLabelText } = render(<AccountPage />, { wrapper });
      getByText('Clerk User');
      await userEvent.click(getByRole('button', { name: /edit profile/i }));
      await waitFor(() => getByText(/update profile/i));
      expect(queryByText('Clerk User')).not.toBeInTheDocument();
      expect(queryByLabelText(/first name/i)).toBeInTheDocument();
      expect(queryByLabelText(/last name/i)).toBeInTheDocument();

      expect(getByRole('button', { name: /save$/i })).toBeDisabled();
    });

    it('open the profile section and cannot edit name', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Clerk', last_name: 'User' });
      });

      const { getByText, getByRole, userEvent, queryByText, queryByLabelText } = render(<AccountPage />, { wrapper });
      getByText('Clerk User');
      await userEvent.click(getByRole('button', { name: /edit profile/i }));
      await waitFor(() => getByText(/update profile/i));
      expect(queryByText('Clerk User')).not.toBeInTheDocument();
      expect(queryByLabelText(/first name/i)).not.toBeInTheDocument();
      expect(queryByLabelText(/last name/i)).not.toBeInTheDocument();

      expect(getByRole('button', { name: /save$/i })).toBeDisabled();
    });

    it('hides email addresses section when disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          first_name: 'George',
          last_name: 'Clerk',
        });
      });

      const { queryByText } = render(<AccountPage />, { wrapper });
      expect(queryByText(/Email addresses/i)).not.toBeInTheDocument();
    });

    it('hides phone number section when disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          first_name: 'George',
          last_name: 'Clerk',
        });
      });

      const { queryByText } = render(<AccountPage />, { wrapper });
      expect(queryByText(/Phone numbers/i)).not.toBeInTheDocument();
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
  });
});
