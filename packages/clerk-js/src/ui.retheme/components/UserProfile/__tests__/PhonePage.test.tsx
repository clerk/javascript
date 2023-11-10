import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { PhonePage } from '../PhonePage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withPhoneNumber();
  f.withUser({ email_addresses: ['test@clerk.com'] });
});

describe('PhonePage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<PhonePage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<PhonePage />, { wrapper });

    screen.getByRole('heading', { name: /add phone number/i });
  });

  describe('Inputs', () => {
    it('shows the input field for the new phone number', async () => {
      const { wrapper } = await createFixtures(initConfig);

      render(<PhonePage />, { wrapper });

      screen.getByLabelText(/phone number/i);
    });
  });

  describe('Form buttons', () => {
    it('navigates to the root page upon pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { userEvent } = render(<PhonePage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('continue button is disabled by default', async () => {
      const { wrapper } = await createFixtures(initConfig);
      render(<PhonePage />, { wrapper });

      expect(screen.getByText(/continue/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
    });

    it('calls the appropriate function if continue is pressed', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);
      fixtures.clerk.user?.createPhoneNumber.mockReturnValueOnce(Promise.resolve({} as any));
      const { userEvent } = render(<PhonePage />, { wrapper });

      await userEvent.type(screen.getByLabelText(/phone number/i), '6911111111');
      await userEvent.click(screen.getByText(/continue/i));
      expect(fixtures.clerk.user?.createPhoneNumber).toHaveBeenCalledWith({ phoneNumber: '+16911111111' }); //default is +1
    });
  });

  it.todo('Test for verification of added phone number');
});
