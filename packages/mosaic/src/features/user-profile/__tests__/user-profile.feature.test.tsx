import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { openDialog } from '../../../__tests__/feature/dialog';
import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { openMenu } from '../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfile } from '../user-profile';
import { signedIn } from '../user-profile-connected-accounts-section/__tests__/user-profile-connected-accounts.fixtures';

function serve({ userAPIKeysEnabled = false } = {}) {
  return serveFapi({
    environment: fapiEnvironment({ api_keys_settings: { user_api_keys_enabled: userAPIKeysEnabled } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_alice0000000000000000000000' }) })]),
  });
}

beforeAll(() => page.viewport(1280, 800));

function tabNames() {
  return screen.getAllByRole('tab').map(tab => tab.textContent);
}

describe('UserProfile', () => {
  it('shows the fallback while Clerk loads, then the account page', async () => {
    serve();
    const environment = holdRequests('get', '/v1/environment');
    const rendering = renderWithClerk(<UserProfile fallback={<p>Loading profile</p>} />);
    expect(await screen.findByText('Loading profile')).toBeVisible();
    environment.release();
    await rendering;
    expect(screen.queryByText('Loading profile')).toBeNull();
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeVisible();
  });

  it('renders nothing when signed out', async () => {
    const fapi = serve();
    fapi.client = fapiClient();
    await renderWithClerk(<UserProfile fallback={<p>Loading profile</p>} />);
    expect(screen.queryByRole('navigation', { name: 'User profile' })).toBeNull();
    expect(screen.queryByText('Loading profile')).toBeNull();
  });

  it.each([
    { userAPIKeysEnabled: false, tabs: ['Account', 'Security'] },
    { userAPIKeysEnabled: true, tabs: ['Account', 'Security', 'API Keys'] },
  ])(
    'lists API keys only when user API keys are enabled: $userAPIKeysEnabled',
    async ({ userAPIKeysEnabled, tabs }) => {
      serve({ userAPIKeysEnabled });
      await renderWithClerk(<UserProfile />);
      expect(tabNames()).toEqual(tabs);
    },
  );

  it.each([
    { hide: true, tabs: ['Account', 'Security'] },
    { hide: false, tabs: ['Account', 'Security', 'API Keys'] },
  ])('lists API keys only when they are not hidden: $hide', async ({ hide, tabs }) => {
    serve({ userAPIKeysEnabled: true });
    await renderWithClerk(<UserProfile apiKeysProps={{ hide }} />);
    expect(tabNames()).toEqual(tabs);
  });

  it('passes the API keys options to the API keys page', async () => {
    serve({ userAPIKeysEnabled: true });
    await renderWithClerk(
      <UserProfile
        defaultPage='apiKeys'
        apiKeysProps={{ showDescription: true }}
      />,
    );
    const user = userEvent.setup();

    await screen.findByText('API keys loaded');
    const dialog = await openDialog(user, screen.getByRole('button', { name: 'Create API key' }), {
      name: 'Add new API key',
    });
    expect(within(dialog).getByRole('textbox', { name: 'Description' })).toBeVisible();
  });

  it('switches pages from the navigation', async () => {
    serve({ userAPIKeysEnabled: true });
    await renderWithClerk(<UserProfile />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'Security' }));
    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'Security' })).toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'API Keys' }));
    expect(screen.getByRole('heading', { level: 3, name: 'API Keys' })).toBeVisible();
  });

  it('adds custom pages in the requested order and opens on the first', async () => {
    serve();
    await renderWithClerk(
      <UserProfile
        customPages={[{ path: 'usage', label: 'Usage', content: <p>Usage this month</p> }]}
        pageOrder={['usage', 'account']}
      />,
    );
    expect(tabNames()).toEqual(['Usage', 'Account', 'Security']);
    expect(screen.getByRole('tab', { name: 'Usage' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Usage this month')).toBeVisible();
  });

  it('opens on the default page without reordering the navigation', async () => {
    serve();
    await renderWithClerk(<UserProfile defaultPage='security' />);
    expect(tabNames()).toEqual(['Account', 'Security']);
    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'Security' })).toBeVisible();
  });

  it('opens on the first page when the default page is unavailable', async () => {
    serve({ userAPIKeysEnabled: false });
    await renderWithClerk(<UserProfile defaultPage='apiKeys' />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
  });

  it('passes additional OAuth scopes to connected accounts', async () => {
    serveFapi(signedIn());
    await renderWithClerk(<UserProfile additionalOAuthScopes={{ google: ['calendar'] }} />);
    const user = userEvent.setup();

    await openMenu(user, screen.getByRole('button', { name: 'Manage Google' }));
    expect(screen.getByRole('menuitem', { name: 'Reconnect' })).toBeEnabled();
  });
});
