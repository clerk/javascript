import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { EmailPage } from '../EmailPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withEmailAddress();
  f.withUser({ email_addresses: [{ email_address: 'test@clerk.com' }] });
});

describe('EmailPage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<EmailPage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<EmailPage />, { wrapper });

    screen.getByRole('heading', { name: /add email address/i });
  });

  describe('Inputs', () => {
    it('shows the input field for the new email address', async () => {
      const { wrapper } = await createFixtures(initConfig);

      render(<EmailPage />, { wrapper });

      screen.getByLabelText(/email address/i);
    });
  });

  describe('Form buttons', () => {
    it('navigates to the root page upon pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { userEvent } = render(<EmailPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('continue button is disabled by default', async () => {
      const { wrapper } = await createFixtures(initConfig);
      render(<EmailPage />, { wrapper });

      expect(screen.getByText(/continue/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
    });

    it('calls the appropriate function if continue is pressed', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);
      fixtures.clerk.user!.createEmailAddress.mockReturnValueOnce(Promise.resolve({} as any));
      const { userEvent } = render(<EmailPage />, { wrapper });

      await userEvent.type(screen.getByLabelText(/email address/i), 'test+2@clerk.com');
      await userEvent.click(screen.getByText(/continue/i));
      expect(fixtures.clerk.user?.createEmailAddress).toHaveBeenCalledWith({ email: 'test+2@clerk.com' });
    });
  });

  it.todo('Test for verification of added email');
});
