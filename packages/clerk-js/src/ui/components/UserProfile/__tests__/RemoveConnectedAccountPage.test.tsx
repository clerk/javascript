import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { RemoveConnectedAccountPage } from '../RemoveResourcePage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withUser({ external_accounts: [{ provider: 'google', id: 'id' }] });
});

describe('RemoveConnectedAccountPage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.router.params.id = 'id';
    render(<RemoveConnectedAccountPage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.router.params.id = 'id';
    render(<RemoveConnectedAccountPage />, { wrapper });

    screen.getByRole('heading', { name: /remove connected account/i });
  });

  describe('User information', () => {
    it('references the external account of the user in the message', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      render(<RemoveConnectedAccountPage />, { wrapper });

      screen.getByText(/google/i);
      screen.getByText(/will be removed/i);
    });
  });

  describe('Form buttons', () => {
    it('navigates to the root page when pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      const { userEvent } = render(<RemoveConnectedAccountPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('calls the appropriate function upon pressing continue', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      fixtures.clerk.user?.externalAccounts[0].destroy.mockResolvedValue();
      const { userEvent } = render(<RemoveConnectedAccountPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(fixtures.clerk.user?.externalAccounts[0].destroy).toHaveBeenCalled();
    });
  });
});
