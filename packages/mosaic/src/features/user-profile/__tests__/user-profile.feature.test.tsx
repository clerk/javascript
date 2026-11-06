import { act, screen, waitFor, within } from '@testing-library/react';
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

  it('passes additional OAuth scopes to connected accounts', async () => {
    serveFapi(signedIn());
    await renderWithClerk(<UserProfile additionalOAuthScopes={{ google: ['calendar'] }} />);
    const user = userEvent.setup();

    await openMenu(user, screen.getByRole('button', { name: 'Manage Google' }));
    expect(screen.getByRole('menuitem', { name: 'Reconnect' })).toBeEnabled();
  });
});

describe('UserProfile with an active organization', () => {
  const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });

  function serveWithOrganization({
    permissions = ['org:sys_memberships:read'],
    userAPIKeysEnabled = false,
    orgAPIKeysEnabled = false,
    activeOrganizationId = acme.id,
  }: {
    permissions?: string[];
    userAPIKeysEnabled?: boolean;
    orgAPIKeysEnabled?: boolean;
    activeOrganizationId?: string | null;
  } = {}) {
    const memberships = [fapiMembership(acme, { permissions })];
    const user = fapiUser({ id: 'user_1', organization_memberships: memberships });
    return serveFapi({
      environment: fapiEnvironment({
        api_keys_settings: { user_api_keys_enabled: userAPIKeysEnabled, orgs_api_keys_enabled: orgAPIKeysEnabled },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user, last_active_organization_id: activeOrganizationId })]),
      memberships,
    });
  }

  function tabsDescribedBy(description: string) {
    return screen
      .getAllByRole('tab')
      .filter(tab => tab.getAttribute('aria-describedby') !== null)
      .filter(tab => document.getElementById(tab.getAttribute('aria-describedby') ?? '')?.textContent === description)
      .map(tab => tab.textContent);
  }

  it('lists the organization pages under Organization after the account pages', async () => {
    serveWithOrganization();
    await renderWithClerk(<UserProfile />);
    expect(tabsDescribedBy('Account')).toEqual(['Account', 'Security']);
    expect(tabsDescribedBy('Organization')).toEqual(['General', 'Members']);
  });

  it('lists only the organization pages the user may see', async () => {
    serveWithOrganization({ permissions: [] });
    await renderWithClerk(<UserProfile />);
    expect(tabsDescribedBy('Organization')).toEqual(['General']);
  });

  it.each([
    { hide: true, tabs: ['General'] },
    { hide: false, tabs: ['General', 'API Keys'] },
  ])('lists the organization API keys only when they are not hidden: $hide', async ({ hide, tabs }) => {
    serveWithOrganization({ orgAPIKeysEnabled: true, permissions: ['org:sys_api_keys:read'] });
    await renderWithClerk(<UserProfile organizationProfileProps={{ apiKeysProps: { hide } }} />);
    expect(tabsDescribedBy('Organization')).toEqual(tabs);
  });

  it('sends the user to afterLeaveOrganizationUrl after leaving the organization', async () => {
    const fapi = serveWithOrganization();
    const { navigate } = await renderWithClerk(
      <UserProfile organizationProfileProps={{ afterLeaveOrganizationUrl: '/organizations' }} />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: 'General', description: 'Organization' }));
    const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Leave organization' }), {
      role: 'alertdialog',
    });

    await user.type(within(dialog).getByRole('textbox'), 'Acme');
    await user.click(within(dialog).getByRole('button', { name: 'Leave organization' }));

    await waitFor(() => expect(fapi.memberships).toHaveLength(0));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/organizations'));
  });

  it('lists only the account pages when not combined', async () => {
    serveWithOrganization();
    await renderWithClerk(<UserProfile combined={false} />);
    expect(tabNames()).toEqual(['Account', 'Security']);
  });

  it('lists only the account pages without an active organization', async () => {
    serveWithOrganization({ activeOrganizationId: null });
    await renderWithClerk(<UserProfile />);
    expect(tabNames()).toEqual(['Account', 'Security']);
  });

  it('switches to an organization page from the navigation', async () => {
    serveWithOrganization();
    await renderWithClerk(<UserProfile />);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Members', description: 'Organization' }));
    expect(screen.getByRole('tab', { name: 'Members', description: 'Organization' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeVisible();
  });

  it('opens the organization page that shares an account page name', async () => {
    serveWithOrganization();
    await renderWithClerk(
      <UserProfile
        organizationProfileProps={{
          customPages: [{ path: 'security', label: 'Security', content: <p>Organization security</p> }],
        }}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'Security', description: 'Organization' }));
    expect(screen.getByText('Organization security')).toBeVisible();
  });

  it('skips an account page whose path is an organization page id', async () => {
    serveWithOrganization();
    await renderWithClerk(
      <UserProfile
        customPages={[{ path: 'organization/general', label: 'Imposter', content: <p>Imposter content</p> }]}
      />,
    );

    expect(tabNames()).toEqual(['Account', 'Security', 'General', 'Members']);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'General', description: 'Organization' }));
    expect(screen.getByRole('tab', { name: 'General', description: 'Organization' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.queryByText('Imposter content')).not.toBeInTheDocument();
  });

  it('passes the organization options to its pages', async () => {
    serveWithOrganization();
    await renderWithClerk(
      <UserProfile
        organizationProfileProps={{
          customPages: [{ path: 'audit', label: 'Audit log', content: <p>Audit content</p> }],
          pageOrder: ['audit'],
        }}
      />,
    );
    expect(tabsDescribedBy('Organization')).toEqual(['Audit log', 'General', 'Members']);
  });

  it('keeps the shown page after the open organization page leaves the navigation', async () => {
    const globex = fapiOrganization({ id: 'org_2', name: 'Globex' });
    const memberships = [
      fapiMembership(acme, { permissions: ['org:sys_memberships:read'] }),
      fapiMembership(globex, { permissions: [] }),
    ];
    const user = fapiUser({ id: 'user_1', organization_memberships: memberships });
    serveFapi({
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user, last_active_organization_id: acme.id })]),
      memberships,
    });
    const { clerk } = await renderWithClerk(<UserProfile />);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Members', description: 'Organization' }));

    await act(() => clerk.setActive({ organization: globex.id }));
    await waitFor(() => expect(tabsDescribedBy('Organization')).toEqual(['General']));
    await act(() => clerk.setActive({ organization: acme.id }));
    await waitFor(() => expect(tabsDescribedBy('Organization')).toEqual(['General', 'Members']));

    expect(screen.getByRole('tab', { name: 'Account', description: 'Account' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('stays on the organization page when the next organization lists it too', async () => {
    const globex = fapiOrganization({ id: 'org_2', name: 'Globex' });
    const memberships = [
      fapiMembership(acme, { permissions: ['org:sys_memberships:read'] }),
      fapiMembership(globex, { permissions: ['org:sys_memberships:read'] }),
    ];
    const user = fapiUser({ id: 'user_1', organization_memberships: memberships });
    serveFapi({
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user, last_active_organization_id: acme.id })]),
      memberships,
    });
    const { clerk } = await renderWithClerk(<UserProfile />);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Members', description: 'Organization' }));

    await act(() => clerk.setActive({ organization: globex.id }));
    await waitFor(() => expect(clerk.organization?.id).toBe(globex.id));

    expect(screen.getByRole('tab', { name: 'Members', description: 'Organization' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
