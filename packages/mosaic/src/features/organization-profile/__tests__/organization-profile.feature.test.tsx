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
import { renderWithClerk } from '../../../__tests__/feature/render';
import { OrganizationProfile } from '../organization-profile';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme', slug: 'acme' });

function serve({
  permissions = ['org:sys_memberships:read'],
  orgAPIKeysEnabled = false,
  activeOrganizationId = acme.id,
}: { permissions?: string[]; orgAPIKeysEnabled?: boolean; activeOrganizationId?: string | null } = {}) {
  const memberships = [fapiMembership(acme, { permissions })];
  const user = fapiUser({ id: 'user_1', first_name: 'Alice', organization_memberships: memberships });
  return serveFapi({
    environment: fapiEnvironment({
      api_keys_settings: { user_api_keys_enabled: false, orgs_api_keys_enabled: orgAPIKeysEnabled },
    }),
    client: fapiClient([fapiSession({ id: 'sess_1', user, last_active_organization_id: activeOrganizationId })]),
    memberships,
  });
}

beforeAll(() => page.viewport(1280, 800));

function profileNav() {
  return within(screen.getByRole('navigation', { name: 'Organization' }));
}

function tabNames() {
  return profileNav()
    .getAllByRole('tab')
    .map(tab => tab.textContent);
}

describe('OrganizationProfile', () => {
  it('shows the fallback while Clerk loads, then the general page', async () => {
    serve();
    const environment = holdRequests('get', '/v1/environment');
    const rendering = renderWithClerk(<OrganizationProfile fallback={<p>Loading profile</p>} />);
    expect(await screen.findByText('Loading profile')).toBeVisible();
    environment.release();
    await rendering;
    expect(screen.queryByText('Loading profile')).toBeNull();
    expect(profileNav().getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'General' })).toBeVisible();
  });

  it('renders nothing without an active organization', async () => {
    serve({ activeOrganizationId: null });
    await renderWithClerk(<OrganizationProfile fallback={<p>Loading profile</p>} />);
    expect(screen.queryByRole('navigation', { name: 'Organization' })).toBeNull();
    expect(screen.queryByText('Loading profile')).toBeNull();
  });

  it('renders nothing when signed out', async () => {
    const fapi = serve();
    fapi.client = fapiClient();
    await renderWithClerk(<OrganizationProfile fallback={<p>Loading profile</p>} />);
    expect(screen.queryByRole('navigation', { name: 'Organization' })).toBeNull();
    expect(screen.queryByText('Loading profile')).toBeNull();
  });

  it.each([
    { permissions: [], tabs: ['General', 'Logs'] },
    { permissions: ['org:sys_memberships:read'], tabs: ['General', 'Members', 'Logs'] },
    { permissions: ['org:sys_memberships:manage'], tabs: ['General', 'Members', 'Logs'] },
  ])('lists members only with a memberships permission: $permissions', async ({ permissions, tabs }) => {
    serve({ permissions });
    await renderWithClerk(<OrganizationProfile />);
    expect(tabNames()).toEqual(tabs);
  });

  it.each([
    { orgAPIKeysEnabled: false, permissions: ['org:sys_api_keys:read'], tabs: ['General', 'Logs'] },
    { orgAPIKeysEnabled: true, permissions: [], tabs: ['General', 'Logs'] },
    { orgAPIKeysEnabled: true, permissions: ['org:sys_api_keys:read'], tabs: ['General', 'API Keys', 'Logs'] },
  ])(
    'lists API keys only when organization API keys are enabled and permitted: $orgAPIKeysEnabled $permissions',
    async ({ orgAPIKeysEnabled, permissions, tabs }) => {
      serve({ orgAPIKeysEnabled, permissions });
      await renderWithClerk(<OrganizationProfile />);
      expect(tabNames()).toEqual(tabs);
    },
  );

  it.each([
    { hide: true, tabs: ['General', 'Logs'] },
    { hide: false, tabs: ['General', 'API Keys', 'Logs'] },
  ])('lists API keys only when they are not hidden: $hide', async ({ hide, tabs }) => {
    serve({ orgAPIKeysEnabled: true, permissions: ['org:sys_api_keys:read'] });
    await renderWithClerk(<OrganizationProfile apiKeysProps={{ hide }} />);
    expect(tabNames()).toEqual(tabs);
  });

  it('passes the API keys options to the API keys page', async () => {
    serve({ orgAPIKeysEnabled: true, permissions: ['org:sys_api_keys:read', 'org:sys_api_keys:manage'] });
    await renderWithClerk(
      <OrganizationProfile
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
    serve({ orgAPIKeysEnabled: true, permissions: ['org:sys_memberships:read', 'org:sys_api_keys:read'] });
    await renderWithClerk(<OrganizationProfile />);
    const user = userEvent.setup();

    await user.click(profileNav().getByRole('tab', { name: 'Members' }));
    expect(profileNav().getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeVisible();

    await user.click(profileNav().getByRole('tab', { name: 'API Keys' }));
    expect(screen.getByRole('heading', { level: 3, name: 'API Keys' })).toBeVisible();
  });

  it('adds custom pages in the requested order and opens on the first', async () => {
    serve();
    await renderWithClerk(
      <OrganizationProfile
        customPages={[{ path: 'usage', label: 'Usage', content: <p>Usage this month</p> }]}
        pageOrder={['usage', 'general']}
      />,
    );
    expect(tabNames()).toEqual(['Usage', 'General', 'Members', 'Logs']);
    expect(profileNav().getByRole('tab', { name: 'Usage' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Usage this month')).toBeVisible();
  });

  it('opens on the default page without reordering the navigation', async () => {
    serve();
    await renderWithClerk(<OrganizationProfile defaultPage='members' />);
    expect(tabNames()).toEqual(['General', 'Members', 'Logs']);
    expect(profileNav().getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeVisible();
  });

  it('opens on the first page when the default page is unavailable', async () => {
    serve({ orgAPIKeysEnabled: false });
    await renderWithClerk(<OrganizationProfile defaultPage='apiKeys' />);
    expect(profileNav().getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
  });

  it('sends the user to afterLeaveOrganizationUrl after leaving from the general page', async () => {
    const fapi = serve();
    const { navigate } = await renderWithClerk(<OrganizationProfile afterLeaveOrganizationUrl='/organizations' />);
    const user = userEvent.setup();
    const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Leave organization' }), {
      role: 'alertdialog',
    });

    await user.type(within(dialog).getByRole('textbox'), 'Acme');
    await user.click(within(dialog).getByRole('button', { name: 'Leave organization' }));

    await waitFor(() => expect(fapi.memberships).toHaveLength(0));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/organizations'));
  });
});
