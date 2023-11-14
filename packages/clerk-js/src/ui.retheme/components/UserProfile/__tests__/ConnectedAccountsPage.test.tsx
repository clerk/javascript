import type { ExternalAccountResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { ConnectedAccountsPage } from '../ConnectedAccountsPage';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withUser({});
});

describe('ConnectedAccountsPage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<ConnectedAccountsPage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<ConnectedAccountsPage />, { wrapper });

    screen.getByRole('heading', { name: /add connected account/i });
  });

  it('shows the "connect account" button', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<ConnectedAccountsPage />, { wrapper });

    expect(screen.getByText(/connect google account/i).closest('button')).not.toBeNull();
  });

  describe('Actions', () => {
    it('calls the appropriate function upon pressing the "connect" button', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.clerk.user?.createExternalAccount.mockResolvedValue({} as ExternalAccountResource);
      const { userEvent } = render(<ConnectedAccountsPage />, { wrapper });

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

      const { userEvent } = render(<ConnectedAccountsPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });
  });
});
