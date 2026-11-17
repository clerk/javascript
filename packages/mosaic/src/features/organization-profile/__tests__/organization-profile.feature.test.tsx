import type { OrganizationAccessPolicyJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { openDialog } from '../../../__tests__/feature/dialog';
import { fapiUrl, holdRequests, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseConnection,
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
  selfServeConnections = false,
}: {
  permissions?: string[];
  orgAPIKeysEnabled?: boolean;
  activeOrganizationId?: string | null;
  selfServeConnections?: boolean;
} = {}) {
  const org = selfServeConnections
    ? { ...acme, self_serve_sso_enabled: true, self_serve_directory_sync_enabled: true }
    : acme;
  const memberships = [fapiMembership(org, { permissions })];
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
    { permissions: [], tabs: ['General'] },
    { permissions: ['org:sys_memberships:read'], tabs: ['General', 'Members'] },
    { permissions: ['org:sys_memberships:manage'], tabs: ['General', 'Members'] },
  ])('lists members only with a memberships permission: $permissions', async ({ permissions, tabs }) => {
    serve({ permissions });
    await renderWithClerk(<OrganizationProfile />);
    expect(tabNames()).toEqual(tabs);
  });

  it.each([
    { orgAPIKeysEnabled: false, permissions: ['org:sys_api_keys:read'], tabs: ['General'] },
    { orgAPIKeysEnabled: true, permissions: [], tabs: ['General'] },
    { orgAPIKeysEnabled: true, permissions: ['org:sys_api_keys:read'], tabs: ['General', 'API Keys'] },
  ])(
    'lists API keys only when organization API keys are enabled and permitted: $orgAPIKeysEnabled $permissions',
    async ({ orgAPIKeysEnabled, permissions, tabs }) => {
      serve({ orgAPIKeysEnabled, permissions });
      await renderWithClerk(<OrganizationProfile />);
      expect(tabNames()).toEqual(tabs);
    },
  );

  it.each([
    { hide: true, tabs: ['General'] },
    { hide: false, tabs: ['General', 'API Keys'] },
  ])('lists API keys only when they are not hidden: $hide', async ({ hide, tabs }) => {
    serve({ orgAPIKeysEnabled: true, permissions: ['org:sys_api_keys:read'] });
    await renderWithClerk(<OrganizationProfile apiKeysProps={{ hide }} />);
    expect(tabNames()).toEqual(tabs);
  });

  it('loads a policy from FAPI, saves an edit, and refreshes the Access list', async () => {
    serve({ permissions: ['org:sys_domains:read', 'org:sys_domains:manage'] });
    const path = fapiUrl('/v1/organizations/org_1/access_policies');
    let policy: OrganizationAccessPolicyJSON = {
      object: 'organization_access_policy',
      id: 'policy_1',
      organization_id: acme.id,
      default: false,
      domains: [{ name: 'acme.example', affiliation_verified: true, ownership_verified: true }],
      enrollment_mode: 'invitation_only',
      authentication: null,
      status: null,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    worker.use(
      http.get(fapiUrl('/v1/organizations/org_1/enterprise_connections'), () => HttpResponse.json({ response: [] })),
      http.get(path, () => HttpResponse.json({ response: { data: [policy], total_count: 1 } })),
      http.get(`${path}/policy_1`, () => HttpResponse.json({ response: policy })),
      http.post(`${path}/policy_1`, async ({ request }) => {
        expect(new URL(request.url).searchParams.get('_method')).toBe('PATCH');
        const body = await request.formData();
        expect(body.get('enrollment_mode')).toBe('request_access');
        expect(body.has('status')).toBe(false);
        policy = { ...policy, enrollment_mode: 'request_access' };
        return HttpResponse.json({ response: policy });
      }),
    );

    await renderWithClerk(<OrganizationProfile />);
    const user = userEvent.setup();
    await user.click(await profileNav().findByRole('tab', { name: 'Access' }));
    const row = await screen.findByRole('row', { name: /acme.example/ });
    await user.click(within(row).getByRole('button', { name: 'Actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Manage' }));
    await user.click(await screen.findByRole('radio', { name: 'Request access' }));
    expect(screen.getByRole('heading', { name: 'Manage policy' }).closest('.cl-profile-page-header')).toBeTruthy();
    const save = screen.getByRole('button', { name: 'Save changes' });
    expect(save.closest('.cl-profile-content-footer')).toBeTruthy();
    await user.click(save);
    expect(await screen.findByRole('row', { name: /acme.example.*Request access/ })).toBeVisible();
    expect(document.querySelector('.cl-profile-content-footer')).toBeNull();
  });

  it('lists and manages a directory linked to a live SSO connection', async () => {
    serve({ permissions: ['org:sys_domains:read', 'org:sys_entconns:manage'], selfServeConnections: true });
    worker.use(
      http.get(fapiUrl('/v1/organizations/org_1/access_policies'), () =>
        HttpResponse.json({ response: { data: [], total_count: 0 } }),
      ),
      http.get(fapiUrl('/v1/organizations/org_1/enterprise_connections'), () =>
        HttpResponse.json({
          response: [fapiEnterpriseConnection({ id: 'ent_1', name: 'Engineering SSO', organization_id: acme.id })],
        }),
      ),
      http.get(fapiUrl('/v1/organizations/org_1/domains'), () =>
        HttpResponse.json({ response: { data: [], total_count: 0 } }),
      ),
      http.get(fapiUrl('/v1/organizations/org_1/enterprise_connections/ent_1/directory'), () =>
        HttpResponse.json({
          response: {
            object: 'directory',
            id: 'dir_1',
            name: 'Engineering directory',
            enterprise_connection_id: 'ent_1',
            endpoint_url: 'https://example.com/scim',
            provider: 'okta',
            enabled: true,
            group_role_mapping_enabled: false,
            attribute_mapping: {},
            created_at: 1,
            updated_at: 1,
          },
        }),
      ),
    );
    await renderWithClerk(<OrganizationProfile />);
    const user = userEvent.setup();
    await user.click(await profileNav().findByRole('tab', { name: 'Access' }));
    await user.click(await screen.findByRole('tab', { name: 'Connections' }));
    const row = await screen.findByRole('row', { name: /Engineering SSO/ });
    expect(within(row).getByText('Active')).toBeVisible();
    const directory = await screen.findByRole('row', { name: /Engineering directory/ });
    await user.click(within(directory).getByRole('button', { name: 'Actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Manage' }));
    expect(await screen.findByDisplayValue('https://example.com/scim')).toBeVisible();
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
    expect(tabNames()).toEqual(['Usage', 'General', 'Members']);
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
    await waitFor(() => expect(tabNames()).toEqual(['General']));
    await act(() => clerk.setActive({ organization: acme.id }));
    await waitFor(() => expect(tabNames()).toEqual(['General', 'Members']));

    expect(profileNav().getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
  });
});
