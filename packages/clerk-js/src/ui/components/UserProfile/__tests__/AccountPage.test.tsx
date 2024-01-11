import { describe, it } from '@jest/globals';

import { render, screen, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { AccountPage } from '../AccountPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('AccountPage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

    render(<AccountPage />, { wrapper });
  });

  describe('Sections', () => {
    // TODO-RETHEME: Revise the test when the UI is done
    it.skip('shows the profile section along with the identifier of the user and has a button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'George', last_name: 'Clerk' });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<AccountPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
      screen.getByText(/Profile details/i);
      const button = screen.getByText('George Clerk');
      expect(button.closest('button')).not.toBeNull();
    });

    // TODO-RETHEME: Revise the test when the UI is done
    it.skip('shows the profile section along with the identifier of the user and has a button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'George', last_name: 'Clerk' });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<AccountPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
      screen.getByText(/Profile details/i);
      const button = screen.getByText('George Clerk');
      expect(button.closest('button')).not.toBeNull();
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
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withUser({
          external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
          first_name: 'George',
          last_name: 'Clerk',
        });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<AccountPage />, { wrapper });
      screen.getByText(/Connected Accounts/i);
      screen.getByText(/test@clerk.com/i);
      screen.getByText(/google/i);
    });

    it('shows the enterprise accounts of the user', async () => {
      const emailAddress = 'george@jungle.com';
      const firstName = 'George';
      const lastName = 'Clerk';

      const { wrapper, fixtures } = await createFixtures(f => {
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
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<AccountPage />, { wrapper });
      screen.getByText(/Enterprise Accounts/i);
      screen.getByText(/Okta Workforce/i);
    });
  });
});
