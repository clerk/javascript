import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { openDialog } from '../../../__tests__/feature/dialog';
import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { openMenu } from '../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useModal } from '../../../modals/use-modal';
import { useVirtualEntries } from '../../../routing/virtual-store';
import { UserProfile } from '../user-profile';
import { userProfileModal } from '../user-profile.modal';
import { signedIn } from '../user-profile-connected-accounts-section/__tests__/user-profile-connected-accounts.fixtures';

function serve({ userAPIKeysEnabled = false } = {}) {
  return serveFapi({
    environment: fapiEnvironment({ api_keys_settings: { user_api_keys_enabled: userAPIKeysEnabled } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
  });
}

beforeAll(() => page.viewport(1280, 800));

function tabNames() {
  return screen.getAllByRole('tab').map(tab => tab.textContent);
}

function Entry({ base }: { base: string }) {
  return <output data-testid='entry'>{JSON.stringify(useVirtualEntries().get(base) ?? null)}</output>;
}

const entry = () => JSON.parse(screen.getByTestId('entry').textContent ?? 'null');

function OpenProfile({ page }: { page?: string }) {
  const profile = useModal(userProfileModal);
  return (
    <>
      <button onClick={() => profile.open(page === undefined ? undefined : { page })}>Open profile</button>
      <button onClick={() => profile.close()}>Close profile</button>
    </>
  );
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
    await renderWithClerk(<UserProfile apiKeysProps={{ showDescription: true }} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'API Keys' }));
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

  it('keeps the root page at the base and writes the segments legacy used', async () => {
    serve({ userAPIKeysEnabled: true });
    await renderWithClerk(
      <>
        <UserProfile />
        <Entry base='/user' />
      </>,
    );
    const user = userEvent.setup();
    expect(entry()).toBeNull();

    await user.click(screen.getByRole('tab', { name: 'API Keys' }));
    expect(entry()).toEqual(['api-keys']);

    await user.click(screen.getByRole('tab', { name: 'Account' }));
    expect(entry()).toEqual([]);
  });

  it('opens as a modal on the requested page, writing the segment legacy used', async () => {
    serve({ userAPIKeysEnabled: true });
    await renderWithClerk(
      <>
        <OpenProfile page='apiKeys' />
        <Entry base='/modal/user' />
      </>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Open profile' }));
    const dialog = await screen.findByRole('dialog');

    expect(await within(dialog).findByRole('tab', { name: 'API Keys' })).toHaveAttribute('aria-selected', 'true');
    expect(entry()).toEqual(['api-keys']);
  });

  it('opens as a modal on the first page when the requested page is unavailable', async () => {
    serve({ userAPIKeysEnabled: false });
    await renderWithClerk(
      <>
        <OpenProfile page='apiKeys' />
        <Entry base='/modal/user' />
      </>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Open profile' }));
    const dialog = await screen.findByRole('dialog');

    expect(await within(dialog).findByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(within(dialog).queryByRole('tab', { name: 'API Keys' })).not.toBeInTheDocument();
    await waitFor(() => expect(entry()).toEqual([]));
  });

  it('opens as a modal on the root page with an empty entry', async () => {
    serve();
    await renderWithClerk(
      <>
        <OpenProfile page='account' />
        <Entry base='/modal/user' />
      </>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Open profile' }));
    const dialog = await screen.findByRole('dialog');

    expect(await within(dialog).findByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(entry()).toEqual([]));
  });

  it('clears the modal entry when a profile closes, so it reopens on the first page', async () => {
    serve();
    await renderWithClerk(
      <>
        <OpenProfile page='security' />
        <Entry base='/modal/user' />
      </>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Open profile' }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('button', { name: 'Close profile' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(entry()).toBeNull();
  });

  it('starts on the first page again after it was unmounted', async () => {
    serve();
    const { rerender } = await renderWithClerk(<UserProfile key='first' />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'Security' }));
    rerender(<p>Elsewhere</p>);
    rerender(<UserProfile key='second' />);

    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeVisible();
  });

  it('falls back to the first page when the current page disappears', async () => {
    serve({ userAPIKeysEnabled: true });
    const { rerender } = await renderWithClerk(<UserProfile />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'API Keys' }));
    expect(screen.getByRole('tab', { name: 'API Keys' })).toHaveAttribute('aria-selected', 'true');

    rerender(<UserProfile apiKeysProps={{ hide: true }} />);

    await waitFor(() => expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true'));
    expect(tabNames()).toEqual(['Account', 'Security']);
  });

  it('routes two profiles on one page independently when they have different bases', async () => {
    serve();
    await renderWithClerk(
      <>
        <UserProfile path='/first' />
        <UserProfile path='/second' />
      </>,
    );
    const user = userEvent.setup();
    const [first, second] = screen.getAllByRole('navigation', { name: 'User profile' }).map(nav => within(nav));

    await user.click(first.getByRole('tab', { name: 'Security' }));

    expect(first.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(second.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
  });

  it("adds the provider's account pages", async () => {
    serve();
    await renderWithClerk(<UserProfile />, undefined, undefined, undefined, {
      userProfileProps: { customPages: [{ path: 'usage', label: 'Usage', content: <p>Usage</p> }] },
      organizationProfileProps: { customPages: [{ path: 'audit', label: 'Audit log', content: <p>Audit</p> }] },
    });
    expect(tabNames()).toEqual(['Account', 'Security', 'Usage']);
  });

  it('passes additional OAuth scopes to connected accounts', async () => {
    serveFapi(signedIn());
    await renderWithClerk(<UserProfile additionalOAuthScopes={{ google: ['calendar'] }} />);
    const user = userEvent.setup();

    await openMenu(user, screen.getByRole('button', { name: 'Manage Google' }));
    expect(screen.getByRole('menuitem', { name: 'Reconnect' })).toBeEnabled();
  });
});

describe('UserProfile with an active organization', () => {
  it('lists only the account pages', async () => {
    const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });
    const memberships = [fapiMembership(acme)];
    const user = fapiUser({ id: 'user_1', organization_memberships: memberships });
    serveFapi({
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user, last_active_organization_id: acme.id })]),
      memberships,
    });
    await renderWithClerk(<UserProfile />);
    expect(tabNames()).toEqual(['Account', 'Security']);
  });
});
