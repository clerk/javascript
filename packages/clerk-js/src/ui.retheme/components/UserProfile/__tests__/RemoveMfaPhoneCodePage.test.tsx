import { describe, it } from '@jest/globals';
import React from 'react';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { RemoveMfaPhoneCodePage } from '../RemoveResourcePage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withPhoneNumber();
  f.withUser({ phone_numbers: [{ phone_number: '+306911111111', id: 'id' }] });
});

describe('RemoveMfaPhoneCodePage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<RemoveMfaPhoneCodePage />, { wrapper });
  });

  it('shows the title and phone number', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.router.params.id = 'id';
    render(<RemoveMfaPhoneCodePage />, { wrapper });

    screen.getByRole('heading', { name: /remove two-step verification/i });
    screen.getByText(/\+306911111111/);
  });

  describe('Form buttons', () => {
    it('navigates to the root page when pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      const { userEvent } = render(<RemoveMfaPhoneCodePage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('calls the appropriate function upon pressing continue', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      //@ts-expect-error
      fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor = jest.fn().mockResolvedValue({});
      const { userEvent } = render(<RemoveMfaPhoneCodePage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(fixtures.clerk.user?.phoneNumbers[0].setReservedForSecondFactor).toHaveBeenCalledWith({ reserved: false });
    });
  });
});
