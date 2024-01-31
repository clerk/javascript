import type { ExternalAccountResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import { act, waitFor } from '@testing-library/react';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { ConnectedAccountsSection } from '../ConnectedAccountsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const withoutConnections = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withSocialProvider({ provider: 'github' });
  f.withUser({});
});

const withSomeConnections = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withSocialProvider({ provider: 'github' });
  f.withUser({
    external_accounts: [{ provider: 'google', email_address: 'test@clerk.com' }],
  });
});

const withConnections = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withSocialProvider({ provider: 'github' });
  f.withUser({
    external_accounts: [
      { provider: 'google', email_address: 'test@clerk.com' },
      { provider: 'github', email_address: 'test@clerk.com' },
    ],
  });
});

describe('ConnectedAccountsSection ', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(withoutConnections);

    const { getByText, getByRole } = render(<ConnectedAccountsSection />, { wrapper });

    getByText(/^Connected accounts/i);
    getByRole('button', { name: /connect account/i });
  });

  it('renders the component with some enabled connections', async () => {
    const { wrapper } = await createFixtures(withSomeConnections);

    const { getByText, getByRole } = render(<ConnectedAccountsSection />, { wrapper });

    getByText(/^Connected accounts/i);
    getByText(/google/i);
    getByText(/test@clerk.com/i);
    getByRole('button', { name: /connect account/i });
  });

  it('renders the component with all enabled connections', async () => {
    const { wrapper } = await createFixtures(withConnections);

    const { getByText, getAllByText, queryByRole } = render(<ConnectedAccountsSection />, { wrapper });

    getByText(/^Connected accounts/i);

    getByText(/github/i);
    getByText(/google/i);
    getAllByText(/test@clerk.com/i);
    expect(queryByRole('button', { name: /connect account/i })).not.toBeInTheDocument();
  });

  describe('Add connection', () => {
    it('calls the appropriate function upon pressing the "connect" button', async () => {
      const { wrapper, fixtures } = await createFixtures(withoutConnections);

      fixtures.clerk.user?.createExternalAccount.mockResolvedValue({} as ExternalAccountResource);
      const { userEvent, getByText } = render(<ConnectedAccountsSection />, { wrapper });

      await userEvent.click(getByText(/connect account/i));
      await waitFor(() => getByText('Google'));
      await userEvent.click(getByText(/Google/i));
      expect(fixtures.clerk.user?.createExternalAccount).toHaveBeenCalledWith({
        redirectUrl: window.location.href,
        strategy: 'oauth_google',
        additionalScopes: [],
      });
    });
  });

  describe('Remove connection', () => {
    it('Renders remove screen and references the external account of the user in the message', async () => {
      const { wrapper } = await createFixtures(withConnections);
      const { userEvent, getByText, getByRole } = render(<ConnectedAccountsSection />, { wrapper });

      const item = getByText(/github/i);
      const menuButton = item.parentElement?.parentElement?.parentElement?.parentElement?.children?.[1];
      await act(async () => {
        await userEvent.click(menuButton!);
      });
      getByRole('menuitem', { name: /remove/i });
      await userEvent.click(getByRole('menuitem', { name: /remove/i }));
      await waitFor(() => getByRole('heading', { name: /Remove connected account/i }));

      getByText('GitHub will be removed from this account.');
      getByText(
        'You will no longer be able to use this connected account and any dependent features will no longer work.',
      );
    });

    it('removes a connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withConnections);
      fixtures.clerk.user?.externalAccounts[1].destroy.mockResolvedValue();
      const { userEvent, getByText, getByRole, queryByRole } = render(<ConnectedAccountsSection />, { wrapper });

      const item = getByText(/github/i);
      const menuButton = item.parentElement?.parentElement?.parentElement?.parentElement?.children?.[1];
      await act(async () => {
        await userEvent.click(menuButton!);
      });
      getByRole('menuitem', { name: /remove/i });
      await userEvent.click(getByRole('menuitem', { name: /remove/i }));
      await waitFor(() => getByRole('heading', { name: /Remove connected account/i }));

      await userEvent.click(getByRole('button', { name: /save/i }));
      expect(fixtures.clerk.user?.externalAccounts[1].destroy).toHaveBeenCalled();

      await waitFor(() =>
        expect(queryByRole('heading', { name: /Remove connected account/i })).not.toBeInTheDocument(),
      );
    });

    it('hides screen when when pressing cancel', async () => {
      const { wrapper } = await createFixtures(withConnections);
      const { userEvent, getByText, getByRole, queryByRole } = render(<ConnectedAccountsSection />, { wrapper });

      const item = getByText(/github/i);
      const menuButton = item.parentElement?.parentElement?.parentElement?.parentElement?.children?.[1];
      await act(async () => {
        await userEvent.click(menuButton!);
      });
      getByRole('menuitem', { name: /remove/i });
      await userEvent.click(getByRole('menuitem', { name: /remove/i }));
      await waitFor(() => getByRole('heading', { name: /Remove connected account/i }));
      await userEvent.click(screen.getByRole('button', { name: /cancel$/i }));
      expect(queryByRole('heading', { name: /Remove connected account/i })).not.toBeInTheDocument();
    });
  });
});
