import { describe, it } from '@jest/globals';
import React from 'react';

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

    it('shows the connected accounts of the user and has appropriate buttons', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withUser({
          external_accounts: [{ provider: 'google', email_address: 'testgoogle@clerk.com' }],
          first_name: 'George',
          last_name: 'Clerk',
        });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<AccountPage />, { wrapper });
      screen.getByText(/Connected Accounts/i);
      screen.getByText(/testgoogle@clerk.com/i);
      const externalAccountButton = screen.getByText(/google/i);
      expect(externalAccountButton.closest('button')).not.toBeNull();
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
