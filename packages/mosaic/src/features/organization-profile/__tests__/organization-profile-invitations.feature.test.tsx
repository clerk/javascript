import type { OrganizationInvitationJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiMembership, fapiOrganization, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicLocalizationProvider, resolveLocalization } from '../../../localization';
import { OrganizationProfileMembersPanel } from '../organization-profile-members-panel';

const organization = fapiOrganization({ id: 'org_invitations', name: 'Acme' });
const invitation: OrganizationInvitationJSON = {
  object: 'organization_invitation',
  id: 'orginv_ada',
  email_address: 'ada@example.com',
  organization_id: organization.id,
  public_metadata: {},
  status: 'pending',
  role: 'org:member',
  role_name: 'Member',
  created_at: 1_785_000_000_000,
  updated_at: 1_785_000_000_000,
};

function serve(permissions: string[]) {
  const membership = fapiMembership(organization, { permissions });
  const user = fapiUser({ id: 'user_invitations', organization_memberships: [membership] });
  return serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_invitations', user, last_active_organization_id: organization.id })]),
    memberships: [membership],
    organizationInvitations: [invitation],
  });
}

describe('connected organization invitations', () => {
  it('shows members without requesting invitations for readers', async () => {
    serve(['org:sys_memberships:read']);
    const requests = holdRequests('get', '/v1/organizations/:organizationId/invitations');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByRole('tab', { name: 'Members' })).toBeVisible();
    await waitFor(() => expect(screen.queryByText('Loading members')).toBeNull());
    expect(screen.queryByRole('tab', { name: 'Invitations' })).toBeNull();
    expect(requests.requests).toHaveLength(0);
    requests.release();
  });

  it('hides the panel without read or manage permission', async () => {
    serve([]);
    const requests = holdRequests('get', '/v1/organizations/:organizationId/invitations');
    const { container } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(container).toBeEmptyDOMElement();
    expect(requests.requests).toHaveLength(0);
    requests.release();
  });

  it('shows both tabs when both permissions are present', async () => {
    serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByRole('tab', { name: 'Members' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Invitations' })).toBeVisible();
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Invitations' }));
    expect(await screen.findByText('ada@example.com')).toBeVisible();
  });

  it('loads pending invitations for managers without fetching members or roles', async () => {
    serve(['org:sys_memberships:manage']);
    const requests = holdRequests('get', '/v1/organizations/:organizationId/invitations');
    const members = holdRequests('get', '/v1/organizations/:organizationId/memberships');
    const roles = holdRequests('get', '/v1/organizations/:organizationId/roles');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    await waitFor(() => expect(requests.requests).toHaveLength(1));
    const url = new URL(requests.requests[0]?.url ?? '');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.getAll('status')).toEqual(['pending']);
    expect(members.requests).toHaveLength(0);
    expect(roles.requests).toHaveLength(0);
    requests.release();
    expect(await screen.findByText('ada@example.com')).toBeVisible();
    expect(screen.queryByRole('searchbox', { name: 'Search invitations' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Invited' })).toBeNull();
    members.release();
    roles.release();
  });

  it('shows a failed initial load and retries the invitation list', async () => {
    serve(['org:sys_memberships:manage']);
    const initial = holdRequests('get', '/v1/organizations/:organizationId/invitations');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    await waitFor(() => expect(initial.requests).toHaveLength(1));
    initial.fail('network_error', 'Unavailable');
    expect(await screen.findByText('Unable to load invitations', {}, { timeout: 12_000 })).toBeVisible();
    serve(['org:sys_memberships:manage']);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('ada@example.com')).toBeVisible();
  }, 20_000);

  it('revokes only after confirmation and restores focus after the final row', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    expect(await screen.findByText('ada@example.com')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Manage ada@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    expect(fapi.organizationInvitations[0]?.status).toBe('pending');
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));
    await waitFor(() => expect(fapi.organizationInvitations[0]?.status).toBe('revoked'));
    expect(await screen.findByText('No pending invitations')).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() =>
      expect(screen.getByRole('group', { name: 'Invitations' })).toContainElement(document.activeElement),
    );
  }, 20_000);

  it('keeps a failed revoke open for retry', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage ada@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    const revoke = holdRequests('post', '/v1/organizations/:organizationId/invitations/:invitationId/revoke');
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));
    await waitFor(() => expect(revoke.requests).toHaveLength(1));
    revoke.fail('network_error', 'Unavailable');
    await waitFor(() =>
      expect(within(screen.getByRole('alertdialog')).getByRole('alert')).toHaveTextContent(
        'Unable to reach the server. Check your connection and try again.',
      ),
    );
    expect(fapi.organizationInvitations[0]?.status).toBe('pending');
    const retry = serve(['org:sys_memberships:manage']);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));
    await waitFor(() => expect(retry.organizationInvitations[0]?.status).toBe('revoked'));
  });

  it('keeps the dialog open with the server message when the invitation is no longer pending', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage ada@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    fapi.organizationInvitations = [{ ...invitation, status: 'accepted' }];
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));
    await waitFor(() =>
      expect(within(screen.getByRole('alertdialog')).getByRole('alert')).toHaveTextContent(
        'This invitation is no longer pending.',
      ),
    );
    expect(fapi.organizationInvitations[0]?.status).toBe('accepted');
  });

  it('sends one revoke request when confirm is pressed repeatedly', async () => {
    serve(['org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage ada@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    const revoke = holdRequests('post', '/v1/organizations/:organizationId/invitations/:invitationId/revoke');
    const confirm = within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' });
    await user.click(confirm);
    await waitFor(() => expect(revoke.requests).toHaveLength(1));
    confirm.click();
    confirm.click();
    revoke.release();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(revoke.requests).toHaveLength(1);
  });

  it('replaces rows with the table error state and retries when refreshing after a revoke fails', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    const other = { ...invitation, id: 'orginv_other', email_address: 'other@example.com' };
    fapi.organizationInvitations.push(other);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage ada@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    const refresh = holdRequests('get', '/v1/organizations/:organizationId/invitations');
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));
    await waitFor(() => expect(refresh.requests).toHaveLength(1));
    refresh.fail('network_error', 'Unavailable');
    await waitFor(() => expect(screen.getByText('Unable to load invitations')).toBeVisible(), { timeout: 12_000 });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.organizationInvitations.find(item => item.id === invitation.id)?.status).toBe('revoked');
    expect(screen.queryByText('other@example.com')).toBeNull();
    const table = within(screen.getByRole('table', { name: 'Invitations' }));
    expect(table.getByRole('alert')).toHaveTextContent('Unable to load invitations');
    const retry = serve(['org:sys_memberships:manage']);
    retry.organizationInvitations = [other];
    await user.click(table.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.queryByText('Unable to load invitations')).toBeNull());
    expect(screen.getByText('other@example.com')).toBeVisible();
    expect(screen.queryByText('ada@example.com')).toBeNull();
  }, 20_000);

  it('shows localized role names in invitation rows', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    fapi.organizationInvitations.push({
      ...invitation,
      id: 'orginv_admin',
      email_address: 'admin@example.com',
      role: 'org:admin',
      role_name: 'Admin',
    });
    await renderWithClerk(
      <MosaicLocalizationProvider
        value={resolveLocalization({ overrides: { roles: { 'org:admin': 'Administrateur', 'org:member': 'Membre' } } })}
      >
        <OrganizationProfileMembersPanel />
      </MosaicLocalizationProvider>,
    );
    const table = within(await screen.findByRole('table', { name: 'Invitations' }));
    expect(await table.findByRole('cell', { name: 'Administrateur' })).toBeVisible();
    expect(table.getByRole('cell', { name: 'Membre' })).toBeVisible();
    expect(table.queryByRole('cell', { name: 'Admin' })).toBeNull();
  });

  it('shows the invitation role name for a custom role', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    fapi.organizationInvitations = [{ ...invitation, role: 'org:billing', role_name: 'Billing' }];
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByRole('cell', { name: 'Billing' })).toBeVisible();
  });

  it('returns to the previous page after revoking the last invitation on a later page', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    fapi.organizationInvitations = [
      ...Array.from({ length: 10 }, (_, index) => ({
        ...invitation,
        id: `orginv_${index}`,
        email_address: `user${index}@example.com`,
      })),
      invitation,
    ];
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    expect(await screen.findByText('user0@example.com')).toBeVisible();
    const nextPage = holdRequests('get', '/v1/organizations/:organizationId/invitations');
    await user.click(await screen.findByRole('button', { name: 'Next invitations page' }));
    await waitFor(() => expect(nextPage.requests).toHaveLength(1));
    expect(screen.getByText('user0@example.com')).toBeVisible();
    nextPage.release();
    await user.click(await screen.findByRole('button', { name: 'Manage ada@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));
    expect(await screen.findByText('user0@example.com')).toBeVisible();
    expect(screen.queryByText('ada@example.com')).toBeNull();
  });

  it('closes an obsolete revoke confirmation after switching sessions', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    const currentUser = fapi.client.sessions[0]?.user;
    if (!currentUser) {
      throw new Error('Expected a signed-in user');
    }
    fapi.client = fapiClient([
      ...fapi.client.sessions,
      fapiSession({ id: 'sess_second', user: currentUser, last_active_organization_id: organization.id }),
    ]);
    const { clerk } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage ada@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    await act(() => clerk.setActive({ session: 'sess_second' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(fapi.organizationInvitations[0]?.status).toBe('pending');
  });

  it('replaces invitations and closes confirmation after switching organizations', async () => {
    const otherOrganization = fapiOrganization({ id: 'org_other', name: 'Other' });
    const firstMembership = fapiMembership(organization, { permissions: ['org:sys_memberships:manage'] });
    const secondMembership = fapiMembership(otherOrganization, { permissions: ['org:sys_memberships:manage'] });
    const user = fapiUser({
      id: 'user_invitations',
      organization_memberships: [firstMembership, secondMembership],
    });
    serveFapi({
      client: fapiClient([fapiSession({ id: 'sess_invitations', user, last_active_organization_id: organization.id })]),
      memberships: [firstMembership, secondMembership],
      organizationInvitations: [
        invitation,
        {
          ...invitation,
          id: 'orginv_other',
          organization_id: otherOrganization.id,
          email_address: 'other@example.com',
        },
      ],
    });
    const { clerk } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    const actor = userEvent.setup();
    await actor.click(await screen.findByRole('button', { name: 'Manage ada@example.com' }));
    await actor.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    await act(() => clerk.setActive({ organization: otherOrganization.id }));
    expect(await screen.findByText('other@example.com')).toBeVisible();
    expect(screen.queryByText('ada@example.com')).toBeNull();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('ignores an old revoke completion after switching organizations', async () => {
    const otherOrganization = fapiOrganization({ id: 'org_other', name: 'Other' });
    const firstMembership = fapiMembership(organization, { permissions: ['org:sys_memberships:manage'] });
    const secondMembership = fapiMembership(otherOrganization, { permissions: ['org:sys_memberships:manage'] });
    const user = fapiUser({ id: 'user_invitations', organization_memberships: [firstMembership, secondMembership] });
    const fapi = serveFapi({
      client: fapiClient([fapiSession({ id: 'sess_invitations', user, last_active_organization_id: organization.id })]),
      memberships: [firstMembership, secondMembership],
      organizationInvitations: [
        invitation,
        {
          ...invitation,
          id: 'orginv_other',
          organization_id: otherOrganization.id,
          email_address: 'other@example.com',
        },
      ],
    });
    const { clerk } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    const actor = userEvent.setup();
    await actor.click(await screen.findByRole('button', { name: 'Manage ada@example.com' }));
    await actor.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    const revoke = holdRequests('post', '/v1/organizations/:organizationId/invitations/:invitationId/revoke');
    await actor.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke invitation' }));
    await waitFor(() => expect(revoke.requests).toHaveLength(1));
    await act(() => clerk.setActive({ organization: otherOrganization.id }));
    expect(await screen.findByText('other@example.com')).toBeVisible();
    revoke.release();
    await waitFor(() => expect(fapi.organizationInvitations[0]?.status).toBe('revoked'));
    expect(screen.getByText('other@example.com')).toBeVisible();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.queryByText('ada@example.com')).toBeNull();
  });

  it.todo('invites members from the Invitations tab');
});
