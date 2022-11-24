import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { RootPage } from '../RootPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('RootPage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.dev'] });
    });
    fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

    render(<RootPage />, { wrapper });
  });

  describe('Sections', () => {
    it('shows the bigger sections', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.dev'] });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<RootPage />, { wrapper });
      screen.getAllByText(/Account/i);
      screen.getAllByText(/Security/i);
    });

    it('shows the profile section along with the identifier of the user and has a button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.dev'], first_name: 'George', last_name: 'Clerk' });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<RootPage />, { wrapper });
      screen.getByText(/Profile/i);
      const button = screen.getByText('George Clerk');
      expect(button.closest('button')).not.toBeNull();
    });

    it('shows the profile section along with the identifier of the user and has a button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.dev'], first_name: 'George', last_name: 'Clerk' });
      });
      fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

      render(<RootPage />, { wrapper });
      screen.getByText(/Profile/i);
      const button = screen.getByText('George Clerk');
      expect(button.closest('button')).not.toBeNull();
    });

    it('shows the email addresses section with the email addresses of the user and has appropriate buttons', async () => {
      const emails = ['test@clerk.dev', 'test2@clerk.dev'];
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
      screen.getByText(/Email addresses/i);
      const emailButtons: HTMLElement[] = [];
      emails.forEach(email => {
        emailButtons.push(screen.getByText(email));
      });
      emailButtons.forEach(emailButton => {
        expect(emailButton.closest('button')).not.toBeNull();
      });
    });
  });
});
