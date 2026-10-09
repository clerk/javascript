import type { RoleJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiMembership, fapiOrganization, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicLocalizationProvider, resolveLocalization } from '../../../localization';
import { OrganizationProfileMembersPanel } from '../organization-profile-members-panel';

const organization = fapiOrganization({ id: 'org_1', name: 'Acme' });
const bob = fapiMembership(organization, {
  id: 'orgmem_bob',
  public_user_data: {
    user_id: 'user_2',
    first_name: 'Bob',
    last_name: 'Smith',
    identifier: 'bob@example.com',
    image_url: '',
    has_image: false,
  },
});
const adminRole: RoleJSON = {
  object: 'role',
  id: 'role_admin',
  key: 'org:admin',
  name: 'Admin',
  description: '',
  permissions: [],
  created_at: 0,
  updated_at: 0,
};
const memberRole: RoleJSON = { ...adminRole, id: 'role_member', key: 'org:member', name: 'Member' };

function serve(permissions: string[] = ['org:sys_memberships:read']) {
  const currentMembership = fapiMembership(organization, { permissions });
  const alice = fapiUser({ id: 'user_1', organization_memberships: [currentMembership] });
  return serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: organization.id })]),
    memberships: [currentMembership, bob],
    roles: [adminRole, memberRole],
  });
}

describe('OrganizationProfileMembersPanel', () => {
  it('shows active organization members from Clerk', async () => {
    serve();

    await renderWithClerk(<OrganizationProfileMembersPanel />);

    expect(await screen.findByText('Bob Smith')).toBeVisible();
    expect(screen.getByText('bob@example.com')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Manage Bob Smith' })).toBeNull();
  });

  it('does not fetch or show the list without read permission', async () => {
    serve([]);
    const request = holdRequests('get', '/v1/organizations/:organizationId/memberships');
    const roles = holdRequests('get', '/v1/organizations/:organizationId/roles');
    const { container } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(container).toBeEmptyDOMElement();
    expect(request.requests).toHaveLength(0);
    expect(roles.requests).toHaveLength(0);
    request.release();
    roles.release();
  });

  it('searches after the input settles and keeps rows while a new page loads', async () => {
    serve();
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByText('Bob Smith')).toBeVisible();
    const user = userEvent.setup();
    const request = holdRequests('get', '/v1/organizations/:organizationId/memberships');
    await user.type(screen.getByRole('searchbox', { name: 'Search members' }), ' Smith ');
    expect(screen.getByText('Bob Smith')).toBeVisible();
    await waitFor(() => expect(request.requests).toHaveLength(1));
    expect(new URL(request.requests[0]?.url ?? '').searchParams.get('query')).toBe('Smith');
    expect(screen.getByText('Bob Smith')).toBeVisible();
    request.release();
    expect(await screen.findByText('Bob Smith')).toBeVisible();
  });

  it('changes a member role and removes the member after confirmation', async () => {
    const fapi = serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('combobox', { name: /^Change role for Bob Smith/ }));
    const members = holdRequests('get', '/v1/organizations/:organizationId/memberships');
    await user.click(await screen.findByRole('option', { name: 'Admin' }));
    await waitFor(() => expect(fapi.memberships.find(item => item.id === bob.id)?.role).toBe('org:admin'));
    await waitFor(() => expect(members.requests).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Manage Bob Smith' })).toBeDisabled();
    members.release();
    await user.click(await screen.findByRole('button', { name: 'Manage Bob Smith' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Remove from organization' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove Bob Smith?' });
    await user.click(within(dialog).getByRole('button', { name: 'Remove from organization' }));
    await waitFor(() => expect(fapi.memberships.some(item => item.id === bob.id)).toBe(false));
    await waitFor(() => expect(screen.queryByText('Bob Smith')).toBeNull());
  });

  it('keeps members visible when roles fail and restores editing after retry', async () => {
    serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    const roles = holdRequests('get', '/v1/organizations/:organizationId/roles');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    await waitFor(() => expect(roles.requests).toHaveLength(1));
    roles.fail('roles_unavailable', 'Roles unavailable');
    expect(await screen.findByText('Bob Smith')).toBeVisible();
    await waitFor(() => expect(screen.getByText(/Roles are unavailable/)).toBeVisible(), { timeout: 12_000 });
    expect(screen.queryByRole('combobox', { name: /^Change role for Bob Smith/ })).toBeNull();
    serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('combobox', { name: /^Change role for Bob Smith/ })).toBeVisible();
  }, 20_000);

  it('warns about role migration while retaining removal', async () => {
    const fapi = serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    fapi.hasRoleSetMigration = true;
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByText(/role migration is in progress/)).toBeVisible();
    expect(screen.queryByRole('combobox', { name: /^Change role for Bob Smith/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Manage Bob Smith' })).toBeVisible();
  });

  it('loads fresh roles after switching sessions in the same organization', async () => {
    const fapi = serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    const currentUser = fapi.client.sessions[0]?.user;
    if (!currentUser) {
      throw new Error('Expected a signed-in user');
    }
    fapi.client = fapiClient([
      ...fapi.client.sessions,
      fapiSession({ id: 'sess_2', user: currentUser, last_active_organization_id: organization.id }),
    ]);
    fapi.hasRoleSetMigration = true;
    const { clerk } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByText(/role migration is in progress/)).toBeVisible();

    const roles = holdRequests('get', '/v1/organizations/:organizationId/roles');
    fapi.hasRoleSetMigration = false;
    await act(() => clerk.setActive({ session: 'sess_2' }));
    await waitFor(() => expect(roles.requests).toHaveLength(1));
    expect(screen.queryByText(/role migration is in progress/)).toBeNull();
    expect(screen.queryByRole('combobox', { name: /^Change role for Bob Smith/ })).toBeNull();
    roles.release();
    expect(await screen.findByRole('combobox', { name: /^Change role for Bob Smith/ })).toBeVisible();
  });

  it('keeps members visible and role editing unavailable while roles load', async () => {
    serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    const roles = holdRequests('get', '/v1/organizations/:organizationId/roles');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByText('Bob Smith')).toBeVisible();
    await waitFor(() => expect(roles.requests).toHaveLength(1));
    expect(screen.queryByRole('combobox', { name: /^Change role for Bob Smith/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Manage Bob Smith' })).toBeVisible();
    roles.release();
    expect(await screen.findByRole('combobox', { name: /^Change role for Bob Smith/ })).toBeVisible();
  });

  it('shows the membership role label when the role is absent from available options', async () => {
    const fapi = serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    fapi.memberships[1] = fapiMembership(organization, { ...bob, role: 'org:retired', role_name: 'Retired' });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByText('Retired')).toBeVisible();
    expect(screen.queryByRole('combobox', { name: /^Change role for Bob Smith/ })).toBeNull();
  });

  it('retries a failed member load', async () => {
    serve();
    const members = holdRequests('get', '/v1/organizations/:organizationId/memberships');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    await waitFor(() => expect(members.requests).toHaveLength(1));
    members.fail('network_error', 'Unavailable');
    await waitFor(() => expect(screen.getByText('Unable to load members')).toBeVisible(), { timeout: 12_000 });
    serve();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Bob Smith')).toBeVisible();
  }, 20_000);

  it('keeps rows and offers retry when refreshing the current page fails', async () => {
    serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByText('Bob Smith')).toBeVisible();
    const members = holdRequests('get', '/v1/organizations/:organizationId/memberships');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('combobox', { name: /^Change role for Bob Smith/ }));
    await user.click(await screen.findByRole('option', { name: 'Admin' }));
    await waitFor(() => expect(members.requests).toHaveLength(1));
    members.fail('network_error', 'Unavailable');
    await waitFor(() => expect(screen.getByText('Unable to load members')).toBeVisible(), {
      timeout: 12_000,
    });
    expect(screen.getByText('Bob Smith')).toBeVisible();
    serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.queryByText('Unable to load members')).toBeNull());
    expect(screen.getByText('Bob Smith')).toBeVisible();
  }, 20_000);

  it('does not offer mutation controls for the current or deprovisioned member', async () => {
    const fapi = serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    fapi.memberships[0] = fapiMembership(organization, {
      id: 'orgmem_self',
      public_user_data: {
        user_id: 'user_1',
        first_name: 'Alice',
        last_name: '',
        identifier: 'alice@example.com',
        image_url: '',
        has_image: false,
      },
    });
    fapi.memberships[1] = fapiMembership(organization, {
      ...bob,
      public_user_data: {
        ...bob.public_user_data,
        deprovisioned: true,
        user_id: 'user_2',
        first_name: 'Bob',
        last_name: 'Smith',
        identifier: 'bob@example.com',
        image_url: '',
        has_image: false,
      },
    });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByText('Alice')).toBeVisible();
    expect(await screen.findByRole('combobox', { name: /^Change role for Alice/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Manage Alice' })).toBeNull();
    expect(screen.queryByRole('combobox', { name: /^Change role for Bob Smith/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Manage Bob Smith' })).toBeNull();
  });

  it('returns to the previous page after removing its last member', async () => {
    const fapi = serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    fapi.memberships = [
      fapi.memberships[0] ?? fapiMembership(organization),
      ...Array.from({ length: 9 }, (_, index) =>
        fapiMembership(organization, {
          id: `orgmem_extra_${index}`,
          public_user_data: {
            user_id: `user_extra_${index}`,
            first_name: `Extra${index}`,
            last_name: '',
            identifier: `extra${index}@example.com`,
            image_url: '',
            has_image: false,
          },
        }),
      ),
      bob,
    ];
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Next members page' }));
    expect(await screen.findByText('Bob Smith')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Manage Bob Smith' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Remove from organization' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Remove from organization' }),
    );
    await waitFor(() => expect(fapi.memberships.some(item => item.id === bob.id)).toBe(false));
    expect(await screen.findByText('Extra0')).toBeVisible();
    expect(screen.queryByText('Bob Smith')).toBeNull();
  });

  it('locks role actions while updating and keeps a failed change available to retry', async () => {
    serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    const role = await screen.findByRole('combobox', { name: /^Change role for Bob Smith/ });
    const update = holdRequests('post', '/v1/organizations/:organizationId/memberships/:userId');
    await user.click(role);
    await user.click(await screen.findByRole('option', { name: 'Admin' }));
    await waitFor(() => expect(update.requests).toHaveLength(1));
    expect(role).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Manage Bob Smith' })).toBeDisabled();
    update.fail('role_rejected', 'Role rejected by server');
    expect(await screen.findByRole('alert')).toHaveTextContent('Role rejected by server');
    const retry = serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    await user.click(await screen.findByRole('combobox', { name: /^Change role for Bob Smith/ }));
    await user.click(await screen.findByRole('option', { name: 'Admin' }));
    await waitFor(() => expect(retry.memberships.find(item => item.id === bob.id)?.role).toBe('org:admin'));
  });

  it('shows localized role names in the role list', async () => {
    serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    await renderWithClerk(
      <MosaicLocalizationProvider
        value={resolveLocalization({ overrides: { roles: { 'org:admin': 'Administrateur', 'org:member': 'Membre' } } })}
      >
        <OrganizationProfileMembersPanel />
      </MosaicLocalizationProvider>,
    );
    const user = userEvent.setup();
    await user.click(await screen.findByRole('combobox', { name: /^Change role for Bob Smith/ }));
    expect(await screen.findByRole('option', { name: 'Administrateur' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Membre' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Admin' })).toBeNull();
  });

  it('resets the search and rows when the active organization changes', async () => {
    const other = fapiOrganization({ id: 'org_2', name: 'Other' });
    const first = fapiMembership(organization, { permissions: ['org:sys_memberships:read'] });
    const second = fapiMembership(other, { permissions: ['org:sys_memberships:read'] });
    const alice = fapiUser({ id: 'user_1', organization_memberships: [first, second] });
    const carol = fapiMembership(other, {
      id: 'orgmem_carol',
      public_user_data: {
        user_id: 'user_3',
        first_name: 'Carol',
        last_name: 'Jones',
        identifier: 'carol@example.com',
        image_url: '',
        has_image: false,
      },
    });
    serveFapi({
      client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: organization.id })]),
      memberships: [first, bob, second, carol],
    });
    const { clerk } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    await userEvent.setup().type(await screen.findByRole('searchbox', { name: 'Search members' }), 'Bob');
    expect(await screen.findByText('Bob Smith')).toBeVisible();
    await act(() => clerk.setActive({ organization: other.id }));
    expect(await screen.findByText('Carol Jones')).toBeVisible();
    expect(screen.queryByText('Bob Smith')).toBeNull();
    expect(screen.getByRole('searchbox', { name: 'Search members' })).toHaveValue('');
  });
});
