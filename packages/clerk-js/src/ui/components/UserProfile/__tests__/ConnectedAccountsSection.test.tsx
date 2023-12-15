import type { ExternalAccountResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { ConnectedAccountsSection } from '../ConnectedAccountsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withUser({});
});

//TODO-RETHEME
describe.skip('ConnectedAccountsSection ', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<ConnectedAccountsSection />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<ConnectedAccountsSection />, { wrapper });

    screen.getByRole('heading', { name: /add connected account/i });
  });

  it('shows the "connect account" button', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<ConnectedAccountsSection />, { wrapper });

    expect(screen.getByText(/connect google account/i).closest('button')).not.toBeNull();
  });

  describe('Actions', () => {
    it('calls the appropriate function upon pressing the "connect" button', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.clerk.user?.createExternalAccount.mockResolvedValue({} as ExternalAccountResource);
      const { userEvent } = render(<ConnectedAccountsSection />, { wrapper });

      await userEvent.click(screen.getByText(/connect google account/i));
      expect(fixtures.clerk.user?.createExternalAccount).toHaveBeenCalledWith({
        redirectUrl: window.location.href,
        strategy: 'oauth_google',
        additionalScopes: [],
      });
    });
  });

  describe('Form buttons', () => {
    it('navigates to the root page when pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { userEvent } = render(<ConnectedAccountsSection />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });
  });
});

//TODO-RETHEME
describe.skip('RemoveConnectedAccountPage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.router.params.id = 'id';
    render(<ConnectedAccountsSection />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper, fixtures } = await createFixtures(initConfig);

    fixtures.router.params.id = 'id';
    render(<ConnectedAccountsSection />, { wrapper });

    screen.getByRole('heading', { name: /remove connected account/i });
  });

  describe('User information', () => {
    it('references the external account of the user in the message', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      render(<ConnectedAccountsSection />, { wrapper });

      screen.getByText(/google/i);
      screen.getByText(/will be removed/i);
    });
  });

  describe('Form buttons', () => {
    it('navigates to the root page when pressing cancel', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      const { userEvent } = render(<ConnectedAccountsSection />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('calls the appropriate function upon pressing continue', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.router.params.id = 'id';
      fixtures.clerk.user?.externalAccounts[0].destroy.mockResolvedValue();
      const { userEvent } = render(<ConnectedAccountsSection />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(fixtures.clerk.user?.externalAccounts[0].destroy).toHaveBeenCalled();
    });
  });
});
