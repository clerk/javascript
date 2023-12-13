import { describe, it } from '@jest/globals';
import React from 'react';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { RemovePhonePage } from '../RemoveResourcePage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withPhoneNumber();
  f.withUser({ phone_numbers: [{ phone_number: '+30 691 1111111', id: 'id' }] });
});

describe('RemovePhonePage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.router.params.id = 'id';
    render(<RemovePhonePage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.router.params.id = 'id';
    render(<RemovePhonePage />, { wrapper });

    screen.getByRole('heading', { name: /remove phone number/i });
  });

  describe('User information', () => {
    it('references the phone number of the user in the message', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      render(<RemovePhonePage />, { wrapper });

      screen.getByText(/\+30 691 1111111/);
    });
  });

  describe('Form buttons', () => {
    it('navigates to the root page when pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      const { userEvent } = render(<RemovePhonePage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('calls the appropriate function upon pressing continue', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      fixtures.clerk.user?.phoneNumbers[0].destroy.mockResolvedValue();
      const { userEvent } = render(<RemovePhonePage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(fixtures.clerk.user?.phoneNumbers[0].destroy).toHaveBeenCalled();
    });
  });
});
