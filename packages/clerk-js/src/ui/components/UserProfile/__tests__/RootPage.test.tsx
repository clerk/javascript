import type { SessionWithActivitiesResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen, waitFor } from '../../../../testUtils';
import { RootPage } from '../RootPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('RootPage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

    render(<RootPage />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
  });

  describe('Sections', () => {
    it('shows the bigger sections', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<RootPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
      screen.getAllByText(/Account/i);
      screen.getAllByText(/Security/i);
    });

    it('shows the profile section along with the identifier of the user and has a button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'George', last_name: 'Clerk' });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<RootPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
      screen.getByText(/Profile/i);
      const button = screen.getByText('George Clerk');
      expect(button.closest('button')).not.toBeNull();
    });

    it('shows the profile section along with the identifier of the user and has a button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'George', last_name: 'Clerk' });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<RootPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
      screen.getByText(/Profile/i);
      const button = screen.getByText('George Clerk');
      expect(button.closest('button')).not.toBeNull();
    });

    it('shows the email addresses section with the email addresses of the user and has appropriate buttons', async () => {
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

      render(<RootPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
      screen.getByText(/Email addresses/i);
      const emailButtons: HTMLElement[] = [];
      emails.forEach(email => {
        emailButtons.push(screen.getByText(email));
      });
      emailButtons.forEach(emailButton => {
        expect(emailButton.closest('button')).not.toBeNull();
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

      render(<RootPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
      screen.getByText(/Phone numbers/i);
      const numberButtons: HTMLElement[] = [];
      numbers.forEach(number => {
        numberButtons.push(screen.getByText(number));
      });
      numberButtons.forEach(numberButton => {
        expect(numberButton.closest('button')).not.toBeNull();
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

      render(<RootPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
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

      render(<RootPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
      screen.getByText(/Enterprise Accounts/i);
      screen.getByText(/Okta Workforce/i);
    });

    it('shows the active devices of the user and has appropriate buttons', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withUser({
          external_accounts: ['google'],
          first_name: 'George',
          last_name: 'Clerk',
        });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(
        Promise.resolve([
          {
            pathRoot: '/me/sessions',
            id: 'sess_2HyQfBh8wRJUbpvCtPNllWdsHFK',
            status: 'active',
            expireAt: '2022-12-01T01:55:44.636Z',
            abandonAt: '2022-12-24T01:55:44.636Z',
            lastActiveAt: '2022-11-24T12:11:49.328Z',
            latestActivity: {
              id: 'sess_activity_2HyQwElm529O5NDL1KNpJAGWVJZ',
              deviceType: 'Macintosh',
              browserName: 'Chrome',
              browserVersion: '107.0.0.0',
              country: 'Greece',
              city: 'Athens',
              isMobile: false,
            },
            actor: null,
          } as any as SessionWithActivitiesResource,
        ]),
      );

      render(<RootPage />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.user?.getSessions).toHaveBeenCalled());
      screen.getByText(/Active Devices/i);
      expect(await screen.findByText(/Chrome/i)).toBeInTheDocument();
      screen.getByText(/107.0.0.0/i);
      screen.getByText(/Athens/i);
      screen.getByText(/Greece/i);
      const externalAccountButton = await screen.findByText(/Macintosh/i);
      expect(externalAccountButton.closest('button')).not.toBeNull();
    });
  });
});
