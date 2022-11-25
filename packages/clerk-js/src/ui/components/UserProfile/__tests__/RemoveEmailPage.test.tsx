import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { RemoveEmailPage } from '../RemoveResourcePage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const defaultFixtures = f => {
  f.withEmailAddress();
  f.withUser({ email_addresses: [{ email_address: 'test@clerk.dev', id: 'id' }] });
};

describe('RemoveEmailPage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      defaultFixtures(f);
    });

    fixtures.router.params.id = 'id';
    render(<RemoveEmailPage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      defaultFixtures(f);
    });

    fixtures.router.params.id = 'id';
    render(<RemoveEmailPage />, { wrapper });

    screen.getByRole('heading', { name: /remove email address/i });
  });

  describe('User information', () => {
    it('references the email of the user in the message', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        defaultFixtures(f);
      });

      fixtures.router.params.id = 'id';
      render(<RemoveEmailPage />, { wrapper });

      screen.getByText(/test@clerk.dev/);
    });
  });

  describe('Form buttons', () => {
    it('navigates to the previous page when pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        defaultFixtures(f);
      });

      fixtures.router.params.id = 'id';
      const { userEvent } = render(<RemoveEmailPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('calls the appropriate function upon pressing continue', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        defaultFixtures(f);
      });

      fixtures.router.params.id = 'id';
      //@ts-expect-error
      fixtures.clerk.user!.emailAddresses[0].destroy = jest.fn().mockResolvedValue({});
      const { userEvent } = render(<RemoveEmailPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(fixtures.clerk.user?.emailAddresses[0].destroy).toHaveBeenCalled();
    });
  });
});
