import { describe, it } from '@jest/globals';
import React from 'react';

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

    it('shows the email addresses section with the email addresses of the user', async () => {
      const emails = ['test@clerk.com', 'test2@clerk.com'];
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUser({
          email_addresses: emails,
          first_name: 'George',
          last_name: 'Clerk',
        });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<AccountPage />, { wrapper });
      screen.getByText(/Email addresses/i);
      const emailTexts: HTMLElement[] = [];
      emails.forEach(email => {
        emailTexts.push(screen.getByText(email));
      });
    });

    it('shows the phone numbers section with the phone numbers of the user and has appropriate buttons', async () => {
      const numbers = ['+30 691 1111111', '+30 692 2222222'];
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withUser({
          phone_numbers: numbers,
          first_name: 'George',
          last_name: 'Clerk',
        });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<AccountPage />, { wrapper });
      screen.getByText(/Phone numbers/i);
      const numberButtons: HTMLElement[] = [];
      numbers.forEach(number => {
        numberButtons.push(screen.getByText(number));
      });
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
