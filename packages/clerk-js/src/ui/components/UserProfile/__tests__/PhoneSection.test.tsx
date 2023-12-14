import { describe, it } from '@jest/globals';
import React from 'react';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { PhoneSection } from '../PhoneSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withPhoneNumber();
  f.withUser({ email_addresses: ['test@clerk.com'] });
});

//TODO-RETHEME
describe.skip('PhoneForm', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<PhoneSection />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<PhoneSection />, { wrapper });

    screen.getByRole('heading', { name: /add phone number/i });
  });

  describe('Inputs', () => {
    it('shows the input field for the new phone number', async () => {
      const { wrapper } = await createFixtures(initConfig);

      render(<PhoneSection />, { wrapper });

      screen.getByLabelText(/phone number/i);
    });
  });

  describe('Form buttons', () => {
    it('navigates to the root page upon pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { userEvent } = render(<PhoneSection />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('continue button is disabled by default', async () => {
      const { wrapper } = await createFixtures(initConfig);
      render(<PhoneSection />, { wrapper });

      expect(screen.getByText(/continue/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
    });

    it('calls the appropriate function if continue is pressed', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);
      fixtures.clerk.user?.createPhoneNumber.mockReturnValueOnce(Promise.resolve({} as any));
      const { userEvent } = render(<PhoneSection />, { wrapper });

      await userEvent.type(screen.getByLabelText(/phone number/i), '6911111111');
      await userEvent.click(screen.getByText(/continue/i));
      expect(fixtures.clerk.user?.createPhoneNumber).toHaveBeenCalledWith({ phoneNumber: '+16911111111' }); //default is +1
    });
  });

  it.todo('Test for verification of added phone number');
});

//TODO-RETHEME
describe.skip('RemovePhoneForm', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.router.params.id = 'id';
    render(<PhoneSection />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.router.params.id = 'id';
    render(<PhoneSection />, { wrapper });

    screen.getByRole('heading', { name: /remove phone number/i });
  });

  describe('User information', () => {
    it('references the phone number of the user in the message', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      render(<PhoneSection />, { wrapper });

      screen.getByText(/\+30 691 1111111/);
    });
  });

  describe('Form buttons', () => {
    it('navigates to the root page when pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      const { userEvent } = render(<PhoneSection />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('calls the appropriate function upon pressing continue', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      fixtures.clerk.user?.phoneNumbers[0].destroy.mockResolvedValue();
      const { userEvent } = render(<PhoneSection />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(fixtures.clerk.user?.phoneNumbers[0].destroy).toHaveBeenCalled();
    });
  });
});
