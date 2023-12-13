import type { PhoneNumberResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { MfaPage } from '../MfaPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
  f.withUser({ phone_numbers: [{ phone_number: '+306911111111', id: 'id' }] });
});

describe('MfaPage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<MfaPage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<MfaPage />, { wrapper });

    screen.getAllByText('Add SMS code verification');
  });

  describe('Actions', () => {
    it('shows the phone number of the user with a button', async () => {
      const { wrapper } = await createFixtures(initConfig);

      render(<MfaPage />, { wrapper });

      const phoneNumberEl = screen.getByText('+30 691 1111111');
      expect(phoneNumberEl.closest('button')).not.toBeNull();
    });

    it('shows the "add a phone number" button', async () => {
      const { wrapper } = await createFixtures(initConfig);

      render(<MfaPage />, { wrapper });

      const phoneNumberEl = screen.getByText(/add a phone number/i);
      expect(phoneNumberEl.closest('button')).not.toBeNull();
    });

    it('navigates to the root page upon clicking cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { userEvent } = render(<MfaPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toBeCalledWith('/');
    });

    it('renders the "add a phone number" page upon clicking the button', async () => {
      const { wrapper } = await createFixtures(initConfig);

      const { userEvent } = render(<MfaPage />, { wrapper });

      await userEvent.click(screen.getByText(/add a phone number/i));
      screen.getByLabelText(/phone number/i);
    });

    it('renders the "enabled" page upon clicking the button', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      //@ts-expect-error
      fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor = jest
        .fn()
        .mockResolvedValue({} as PhoneNumberResource);
      const { userEvent } = render(<MfaPage />, { wrapper });

      await userEvent.click(screen.getByText(/\+30 691 1111111/i));
      expect(await screen.findByText(/enabled/i)).toBeInTheDocument();
      expect(fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor).toHaveBeenCalledWith({ reserved: true });
    });
  });
});
