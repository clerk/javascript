import type { OrganizationInvitationJSON, RoleJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { userEvent as browserEvent } from 'vitest/browser';

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

  it('loads pending invitations for managers without fetching members', async () => {
    serve(['org:sys_memberships:manage']);
    const requests = holdRequests('get', '/v1/organizations/:organizationId/invitations');
    const members = holdRequests('get', '/v1/organizations/:organizationId/memberships');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    await waitFor(() => expect(requests.requests).toHaveLength(1));
    const url = new URL(requests.requests[0]?.url ?? '');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.getAll('status')).toEqual(['pending']);
    expect(members.requests).toHaveLength(0);
    requests.release();
    expect(await screen.findByText('ada@example.com')).toBeVisible();
    expect(screen.queryByRole('searchbox', { name: 'Search invitations' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Invited' })).toBeNull();
    members.release();
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
const bob = fapiMembership(organization, {
  id: 'orgmem_bob',
  public_user_data: {
    user_id: 'user_bob',
    first_name: 'Bob',
    last_name: 'Smith',
    identifier: 'bob@example.com',
    image_url: '',
    has_image: false,
  },
});
const MANAGE = ['org:sys_memberships:read', 'org:sys_memberships:manage'];

function serveInvite({
  permissions = MANAGE,
  roles = [adminRole, memberRole],
  defaultRole = null,
  maxAllowedMemberships = 0,
}: {
  permissions?: string[];
  roles?: RoleJSON[];
  defaultRole?: string | null;
  maxAllowedMemberships?: number;
} = {}) {
  const org = { ...organization, max_allowed_memberships: maxAllowedMemberships };
  const membership = fapiMembership(org, { permissions });
  const user = fapiUser({ id: 'user_invitations', organization_memberships: [membership] });
  return serveFapi({
    environment: fapiEnvironment({
      organization_settings: {
        ...fapiEnvironment().organization_settings,
        domains: { enabled: false, enrollment_modes: [], default_role: defaultRole },
      },
    }),
    client: fapiClient([fapiSession({ id: 'sess_invitations', user, last_active_organization_id: org.id })]),
    memberships: [membership, { ...bob, organization: org }],
    organizationInvitations: [invitation],
    roles,
  });
}

async function openInviteDialog() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('tab', { name: 'Invitations' }));
  expect(await screen.findByText('ada@example.com')).toBeVisible();
  await user.click(await screen.findByRole('button', { name: 'Invite' }));
  const dialog = within(await screen.findByRole('dialog', { name: 'Invite members' }));
  return { user, dialog };
}

async function addEmails(dialog: ReturnType<typeof within>, ...emailAddresses: string[]) {
  const user = userEvent.setup();
  await user.type(dialog.getByRole('textbox', { name: 'Email' }), `${emailAddresses.join(',')}{Enter}`);
}

describe('inviting members', () => {
  it('invites members from the Invitations tab with a role chosen from the keyboard', async () => {
    const fapi = serveInvite();
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const { user, dialog } = await openInviteDialog();
    await addEmails(dialog, 'grace@example.com', ' linus@example.com', 'grace@example.com');
    expect(dialog.getAllByRole('listitem').map(item => item.textContent)).toEqual([
      'grace@example.com',
      'linus@example.com',
    ]);
    const send = dialog.getByRole('button', { name: 'Send invites' });
    expect(send).toHaveAttribute('aria-disabled', 'true');

    dialog.getByRole('combobox', { name: /Role/ }).focus();
    await browserEvent.keyboard('{ArrowDown}');
    const admin = await screen.findByRole('option', { name: 'Admin' });
    await waitFor(() => expect(admin).toHaveFocus());
    await browserEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Member' })).toHaveFocus());
    await browserEvent.keyboard('{Enter}');
    await waitFor(() => expect(dialog.getByRole('combobox', { name: /Role/ })).toHaveTextContent('Member'));

    const bulk = holdRequests('post', '/v1/organizations/:organizationId/invitations/bulk');
    await user.click(send);
    await waitFor(() => expect(bulk.requests).toHaveLength(1));
    const body = new URLSearchParams(await bulk.requests[0]?.text());
    expect(body.getAll('email_address')).toEqual(['grace@example.com', 'linus@example.com']);
    expect(body.get('role')).toBe('org:member');
    expect(body.has('notify')).toBe(false);
    bulk.release();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Invitations sent' })).toBeVisible());
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Invite members' })).toBeNull());
    const table = within(screen.getByRole('table', { name: 'Invitations' }));
    expect(await table.findByText('grace@example.com')).toBeVisible();
    expect(table.getByText('linus@example.com')).toBeVisible();
    expect(
      fapi.organizationInvitations
        .filter(item => item.status === 'pending')
        .map(item => [item.email_address, item.role]),
    ).toEqual([
      ['grace@example.com', 'org:member'],
      ['linus@example.com', 'org:member'],
      ['ada@example.com', 'org:member'],
    ]);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Invite' })).toHaveFocus());
  });

  it.each([
    ['the organization default role', { defaultRole: 'org:admin' }, 'Admin'],
    ['the only role', { roles: [memberRole] }, 'Member'],
  ])('starts with %s', async (_, options, label) => {
    serveInvite(options);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const { dialog } = await openInviteDialog();
    expect(dialog.getByRole('combobox', { name: /Role/ })).toHaveTextContent(label);
    await addEmails(dialog, 'grace@example.com');
    expect(dialog.getByRole('button', { name: 'Send invites' })).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('ignores a default role that is not in the role list', async () => {
    serveInvite({ defaultRole: 'org:missing' });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const { dialog } = await openInviteDialog();
    expect(dialog.getByRole('combobox', { name: /Role/ })).toHaveTextContent('Select a role');
  });

  it('lists localized role names and falls back to the server name for custom roles', async () => {
    serveInvite({ roles: [adminRole, { ...adminRole, id: 'role_billing', key: 'org:billing', name: 'Billing' }] });
    await renderWithClerk(
      <MosaicLocalizationProvider
        value={resolveLocalization({ overrides: { roles: { 'org:admin': 'Administrateur' } } })}
      >
        <OrganizationProfileMembersPanel />
      </MosaicLocalizationProvider>,
    );
    const { user, dialog } = await openInviteDialog();
    await user.click(dialog.getByRole('combobox', { name: /Role/ }));
    expect(await screen.findByRole('option', { name: 'Administrateur' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Billing' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Admin' })).toBeNull();
  });

  it('keeps the default role and locks the picker during a role set migration', async () => {
    const fapi = serveInvite({ defaultRole: 'org:member' });
    fapi.hasRoleSetMigration = true;
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const { user, dialog } = await openInviteDialog();
    const picker = dialog.getByRole('combobox', { name: /Role/ });
    expect(picker).toHaveTextContent('Member');
    expect(picker).toHaveAttribute('data-disabled');
    await addEmails(dialog, 'grace@example.com');
    await user.click(dialog.getByRole('button', { name: 'Send invites' }));
    await waitFor(() =>
      expect(fapi.organizationInvitations.find(item => item.email_address === 'grace@example.com')?.role).toBe(
        'org:member',
      ),
    );
  });

  it('offers Invite on every tab to managers', async () => {
    const fapi = serveInvite();
    fapi.environment = fapiEnvironment({
      organization_settings: {
        ...fapiEnvironment().organization_settings,
        domains: { enabled: true, enrollment_modes: [], default_role: null },
      },
    });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    for (const tab of ['Members', 'Invitations', 'Requests']) {
      await user.click(await screen.findByRole('tab', { name: tab }));
      expect(await within(screen.getByRole('tabpanel')).findByRole('button', { name: 'Invite' })).toBeVisible();
    }
  });

  it('does not offer Invite without the manage permission', async () => {
    serveInvite({ permissions: ['org:sys_memberships:read'] });
    const roles = holdRequests('get', '/v1/organizations/:organizationId/roles');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByText('Bob Smith')).toBeVisible();
    expect(roles.requests).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();
    roles.release();
  });

  it('does not offer Invite when roles fail to load', async () => {
    serveInvite();
    const roles = holdRequests('get', '/v1/organizations/:organizationId/roles');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    await waitFor(() => expect(roles.requests).toHaveLength(1));
    roles.fail('network_error', 'Unavailable');
    await userEvent.setup().click(await screen.findByRole('tab', { name: 'Invitations' }));
    expect(await screen.findByText('ada@example.com')).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Manage ada@example.com' })).toBeVisible());
    expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();
  });

  it('replaces a pending invitation for the same address', async () => {
    const fapi = serveInvite({ defaultRole: 'org:admin' });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const { user, dialog } = await openInviteDialog();
    await addEmails(dialog, 'ada@example.com');
    await user.click(dialog.getByRole('button', { name: 'Send invites' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Invitations sent' })).toBeVisible());
    expect(fapi.organizationInvitations.map(item => [item.email_address, item.status, item.role])).toEqual([
      ['ada@example.com', 'pending', 'org:admin'],
      ['ada@example.com', 'revoked', 'org:member'],
    ]);
    const table = within(screen.getByRole('table', { name: 'Invitations' }));
    await waitFor(() => expect(table.getByRole('cell', { name: 'Admin' })).toBeVisible());
    expect(table.getAllByText('ada@example.com')).toHaveLength(1);
  });

  it.each([
    [
      'an existing member',
      'bob@example.com',
      'Some of these email addresses already belong to members of this organization.',
    ],
    ['an address the server cannot parse', 'grace@@example.com', 'Email address must be a valid email address.'],
  ])('keeps the dialog open and marks %s as rejected', async (_, rejected, message) => {
    const fapi = serveInvite({ defaultRole: 'org:member' });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const { user, dialog } = await openInviteDialog();
    await addEmails(dialog, 'linus@example.com', rejected);
    const send = dialog.getByRole('button', { name: 'Send invites' });
    await user.click(send);
    await waitFor(() => expect(dialog.getByRole('alert')).toHaveTextContent(message));
    const tags = dialog.getAllByRole('listitem');
    expect(tags.find(tag => tag.textContent === rejected)).toHaveAttribute('data-invalid');
    expect(tags.find(tag => tag.textContent === 'linus@example.com')).not.toHaveAttribute('data-invalid');
    expect(send).toHaveAttribute('aria-disabled', 'true');
    expect(fapi.organizationInvitations).toHaveLength(1);

    await user.click(dialog.getByRole('button', { name: `Remove ${rejected}` }));
    await user.click(send);
    await waitFor(() => expect(fapi.organizationInvitations).toHaveLength(2));
    expect(fapi.organizationInvitations[0]?.email_address).toBe('linus@example.com');
  });

  it.each([
    [
      'the membership quota is reached',
      (fapi: ReturnType<typeof serveInvite>) => fapi,
      { maxAllowedMemberships: 3 },
      'You have reached your limit of organization memberships, including outstanding invitations.',
    ],
    [
      'the selected role was deleted',
      (fapi: ReturnType<typeof serveInvite>) => {
        fapi.roles = [adminRole];
        return fapi;
      },
      {},
      'This role is no longer available.',
    ],
    [
      'the manage permission was removed',
      (fapi: ReturnType<typeof serveInvite>) => {
        const session = fapi.client.sessions[0];
        const membership = session?.user.organization_memberships?.[0];
        if (!session || !membership) {
          throw new Error('Expected a signed-in member');
        }
        fapi.client = fapiClient([
          { ...session, user: { ...session.user, organization_memberships: [{ ...membership, permissions: [] }] } },
        ]);
        return fapi;
      },
      {},
      'You do not have permission to perform this action.',
    ],
  ])('shows the server error in the dialog when %s', async (_, change, options, message) => {
    const fapi = serveInvite({ defaultRole: 'org:member', ...options });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const { user, dialog } = await openInviteDialog();
    change(fapi);
    await addEmails(dialog, 'grace@example.com', 'linus@example.com');
    await user.click(dialog.getByRole('button', { name: 'Send invites' }));
    await waitFor(() => expect(dialog.getByRole('alert')).toHaveTextContent(message));
    expect(fapi.organizationInvitations).toHaveLength(1);
    expect(dialog.getAllByRole('listitem').some(tag => tag.hasAttribute('data-invalid'))).toBe(false);
    expect(screen.queryByRole('heading', { name: 'Invitations sent' })).toBeNull();
  });

  it('sends one request and stays open while the invite is pending', async () => {
    serveInvite({ defaultRole: 'org:member' });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const { user, dialog } = await openInviteDialog();
    await addEmails(dialog, 'grace@example.com');
    const bulk = holdRequests('post', '/v1/organizations/:organizationId/invitations/bulk');
    const send = dialog.getByRole('button', { name: 'Send invites' });
    await user.click(send);
    await waitFor(() => expect(bulk.requests).toHaveLength(1));
    send.click();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: 'Invite members' })).toBeVisible();
    bulk.release();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Invite members' })).toBeNull());
    expect(bulk.requests).toHaveLength(1);
  });

  it('clears the draft, rejected addresses and error after closing and reopening', async () => {
    serveInvite({ defaultRole: 'org:member' });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const first = await openInviteDialog();
    await addEmails(first.dialog, 'bob@example.com');
    await first.user.click(first.dialog.getByRole('combobox', { name: /Role/ }));
    await first.user.click(await screen.findByRole('option', { name: 'Admin' }));
    await first.user.click(first.dialog.getByRole('button', { name: 'Send invites' }));
    await waitFor(() =>
      expect(first.dialog.getByRole('alert')).toHaveTextContent(
        'Some of these email addresses already belong to members of this organization.',
      ),
    );
    await first.user.click(first.dialog.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Invite members' })).toBeNull());

    await first.user.click(screen.getByRole('button', { name: 'Invite' }));
    const dialog = within(await screen.findByRole('dialog', { name: 'Invite members' }));
    expect(dialog.queryAllByRole('listitem')).toHaveLength(0);
    expect(dialog.getByRole('alert')).toHaveTextContent('');
    expect(dialog.getByRole('combobox', { name: /Role/ })).toHaveTextContent('Member');
    await addEmails(dialog, 'bob@example.com');
    expect(dialog.getByRole('listitem')).not.toHaveAttribute('data-invalid');
  });

  it.todo('drops the success toast after the panel unmounts during an invite');
  it.todo('drops the success toast after a session switch while the list revalidates');

  it.each([
    [
      'switching organizations',
      async (clerk: Awaited<ReturnType<typeof renderWithClerk>>['clerk']) => {
        await clerk.setActive({ organization: 'org_other' });
      },
      2,
    ],
    [
      'switching sessions',
      async (clerk: Awaited<ReturnType<typeof renderWithClerk>>['clerk']) => {
        await clerk.setActive({ session: 'sess_second' });
      },
      2,
    ],
    [
      'signing out',
      async (clerk: Awaited<ReturnType<typeof renderWithClerk>>['clerk']) => {
        await clerk.signOut();
      },
      1,
    ],
  ])('drops a held invite after %s', async (_, change, invitationCount) => {
    const otherOrganization = fapiOrganization({ id: 'org_other', name: 'Other' });
    const firstMembership = fapiMembership(organization, { permissions: MANAGE });
    const secondMembership = fapiMembership(otherOrganization, { permissions: MANAGE });
    const user = fapiUser({ id: 'user_invitations', organization_memberships: [firstMembership, secondMembership] });
    const fapi = serveFapi({
      environment: fapiEnvironment({
        organization_settings: {
          ...fapiEnvironment().organization_settings,
          domains: { enabled: false, enrollment_modes: [], default_role: 'org:member' },
        },
      }),
      client: fapiClient([
        fapiSession({ id: 'sess_invitations', user, last_active_organization_id: organization.id }),
        fapiSession({ id: 'sess_second', user, last_active_organization_id: organization.id }),
      ]),
      memberships: [firstMembership, secondMembership],
      organizationInvitations: [invitation],
      roles: [adminRole, memberRole],
    });
    const { clerk } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    const { user: actor, dialog } = await openInviteDialog();
    await addEmails(dialog, 'grace@example.com');
    const bulk = holdRequests('post', '/v1/organizations/:organizationId/invitations/bulk');
    await actor.click(dialog.getByRole('button', { name: 'Send invites' }));
    await waitFor(() => expect(bulk.requests).toHaveLength(1));
    await act(() => change(clerk));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Invite members' })).toBeNull());
    bulk.release();
    await waitFor(() => expect(fapi.organizationInvitations).toHaveLength(invitationCount));
    await act(() => new Promise(resolve => setTimeout(resolve, 300)));
    expect(screen.queryByRole('heading', { name: 'Invitations sent' })).toBeNull();
    expect(screen.queryByRole('dialog', { name: 'Invite members' })).toBeNull();
  });
});
