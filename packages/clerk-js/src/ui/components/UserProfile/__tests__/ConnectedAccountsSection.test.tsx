import type { ExternalAccountResource } from '@clerk/shared/types';
import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

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

const withReconnectableConnection = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withUser({
    external_accounts: [
      {
        provider: 'google',
        email_address: 'test@clerk.com',
        verification: {
          error: {
            code: 'external_account_missing_refresh_token',
            message: '',
          },
        } as any,
      },
    ],
  });
});

const withReconnectableConnectionAdditionalScopes = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withUser({
    external_accounts: [
      {
        provider: 'google',
        email_address: 'test@clerk.com',
        approved_scopes: 'some_approved_scope',
      },
    ],
  });
});

const withNonReconnectableConnection = createFixtures.config(f => {
  f.withSocialProvider({ provider: 'google' });
  f.withUser({
    external_accounts: [
      {
        provider: 'google',
        email_address: 'test@clerk.com',
        verification: {
          error: {
            code: 'any_other_error',
            message: 'Remove and',
            long_message: 'Remove and try again.',
          },
        } as any,
      },
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

  describe('Recover from issues', () => {
    it('Missing refresh token needs reconnection', async () => {
      const { wrapper, fixtures } = await createFixtures(withReconnectableConnection);

      fixtures.clerk.user?.createExternalAccount.mockResolvedValue({
        verification: {},
      } as any);

      const { userEvent, getByText, getByRole } = render(<ConnectedAccountsSection />, { wrapper });

      const item = getByText(/google/i);

      // Still displays a remove button
      const menuButton = item.parentElement?.parentElement?.parentElement?.parentElement?.children?.[1];
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove/i });
      // Close the menu
      await userEvent.click(getByText('Connected accounts'));

      getByText('This account has been disconnected.');
      getByRole('button', { name: /reconnect/i });
      await userEvent.click(getByRole('button', { name: /reconnect/i }));
      expect(fixtures.clerk.user?.createExternalAccount).toHaveBeenCalled();
    });

    it('Additional scopes need reconnection', async () => {
      const { wrapper, fixtures, props } = await createFixtures(withReconnectableConnectionAdditionalScopes);

      props.setProps({
        componentName: 'UserProfile',
        additionalOAuthScopes: {
          google: ['some_scope'],
        },
      });

      fixtures.clerk.user?.externalAccounts[0].reauthorize.mockResolvedValue({
        verification: {},
      } as any);

      const { userEvent, getByText, getByRole } = render(<ConnectedAccountsSection />, { wrapper });

      const item = getByText(/google/i);

      // Still displays a remove button
      const menuButton = item.parentElement?.parentElement?.parentElement?.parentElement?.children?.[1];
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove/i });
      // Close the menu
      await userEvent.click(getByText('Connected accounts'));

      getByText('This account has been disconnected.');
      getByRole('button', { name: /reconnect/i });
      await userEvent.click(getByRole('button', { name: /reconnect/i }));
      expect(fixtures.clerk.user?.externalAccounts[0].reauthorize).toHaveBeenCalled();
    });

    it('Unrecoverable errors', async () => {
      const { wrapper } = await createFixtures(withNonReconnectableConnection);
      const { userEvent, getByText, getByRole, queryByRole } = render(<ConnectedAccountsSection />, { wrapper });

      const item = getByText(/google/i);

      // Still displays a remove button
      const menuButton = item.parentElement?.parentElement?.parentElement?.parentElement?.children?.[1];
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove/i });
      // Close the menu
      await userEvent.click(getByText('Connected accounts'));

      getByText('Remove and try again.');
      expect(queryByRole('button', { name: /reconnect/i })).not.toBeInTheDocument();
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
      const { userEvent, getByText, getByRole } = render(<ConnectedAccountsSection />, { wrapper });

      const item = getByText(/github/i);
      const menuButton = item.parentElement?.parentElement?.parentElement?.parentElement?.children?.[1];
      await act(async () => {
        await userEvent.click(menuButton!);
      });
      getByRole('menuitem', { name: /remove/i });
      await userEvent.click(getByRole('menuitem', { name: /remove/i }));
      await waitFor(() => getByRole('heading', { name: /Remove connected account/i }), { timeout: 500 });

      await userEvent.click(getByRole('button', { name: /remove/i }));
      expect(fixtures.clerk.user?.externalAccounts[1].destroy).toHaveBeenCalled();
    });

    it('hides screen when when pressing cancel', async () => {
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

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

      // The cancel button should be clickable
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Handles opening/closing actions', () => {
    it('closes remove account form when connect account action is clicked', async () => {
      const { wrapper } = await createFixtures(withSomeConnections);
      const { userEvent, getByText, getByRole, queryByRole } = render(<ConnectedAccountsSection />, { wrapper });

      const item = getByText(/google/i);
      const menuButton = item.parentElement?.parentElement?.parentElement?.parentElement?.children?.[1];
      await act(async () => {
        await userEvent.click(menuButton!);
      });
      getByRole('menuitem', { name: /remove/i });
      await userEvent.click(getByRole('menuitem', { name: /remove/i }));
      await waitFor(() => getByRole('heading', { name: /remove connected account/i }));

      await expect(queryByRole('heading', { name: /remove connected account/i })).toBeInTheDocument();

      await userEvent.click(getByRole('button', { name: /connect account/i }));

      await waitFor(() =>
        expect(queryByRole('heading', { name: /remove connected account/i })).not.toBeInTheDocument(),
      );
    });
  });
});
