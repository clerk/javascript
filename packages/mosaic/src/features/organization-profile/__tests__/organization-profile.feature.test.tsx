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
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useModal } from '../../../modals/use-modal';
import { useVirtualEntries } from '../../../routing/virtual-store';
import { OrganizationProfile } from '../organization-profile';
import { organizationProfileModal } from '../organization-profile.modal';

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

function Entry({ base }: { base: string }) {
  return <output data-testid='entry'>{JSON.stringify(useVirtualEntries().get(base) ?? null)}</output>;
}

const entry = () => JSON.parse(screen.getByTestId('entry').textContent ?? 'null');

function OpenProfile({ page }: { page: string }) {
  const profile = useModal(organizationProfileModal);
  return <button onClick={() => profile.open({ page })}>Open profile</button>;
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
    await renderWithClerk(<OrganizationProfile apiKeysProps={{ showDescription: true }} />);
    const user = userEvent.setup();

    await user.click(profileNav().getByRole('tab', { name: 'API Keys' }));
    await screen.findByText('API keys loaded');
    const dialog = await openDialog(user, screen.getByRole('button', { name: 'Create API key' }), {
      name: 'Add new API key',
    });
    expect(within(dialog).getByRole('textbox', { name: 'Description' })).toBeVisible();
  });

  it('starts on the first page again after it was unmounted', async () => {
    serve();
    const { rerender } = await renderWithClerk(<OrganizationProfile key='first' />);
    const user = userEvent.setup();

    await user.click(profileNav().getByRole('tab', { name: 'Members' }));
    rerender(<p>Elsewhere</p>);
    rerender(<OrganizationProfile key='second' />);

    expect(profileNav().getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'General' })).toBeVisible();
  });

  it('routes two profiles on one page independently when they have different bases', async () => {
    serve();
    await renderWithClerk(
      <>
        <OrganizationProfile path='/first' />
        <OrganizationProfile path='/second' />
      </>,
    );
    const user = userEvent.setup();
    const [first, second] = screen.getAllByRole('navigation', { name: 'Organization' }).map(nav => within(nav));

    await user.click(first.getByRole('tab', { name: 'Members' }));

    expect(first.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(second.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
  });

  it('opens as a modal on the requested page, writing the segment legacy used', async () => {
    serve({ orgAPIKeysEnabled: true, permissions: ['org:sys_memberships:read', 'org:sys_api_keys:read'] });
    await renderWithClerk(
      <>
        <OpenProfile page='apiKeys' />
        <Entry base='/modal/organization' />
      </>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Open profile' }));
    const dialog = await screen.findByRole('dialog');

    expect(await within(dialog).findByRole('tab', { name: 'API Keys' })).toHaveAttribute('aria-selected', 'true');
    expect(entry()).toEqual(['api-keys']);
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

  it('keeps the shown page after the open one leaves the navigation', async () => {
    const globex = fapiOrganization({ id: 'org_2', name: 'Globex', slug: 'globex' });
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
    const { clerk } = await renderWithClerk(<OrganizationProfile />);
    await userEvent.setup().click(profileNav().getByRole('tab', { name: 'Members' }));

    await act(() => clerk.setActive({ organization: globex.id }));
    await waitFor(() => expect(tabNames()).toEqual(['General', 'Logs']));
    await act(() => clerk.setActive({ organization: acme.id }));
    await waitFor(() => expect(tabNames()).toEqual(['General', 'Members', 'Logs']));

    expect(profileNav().getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
  });
});
