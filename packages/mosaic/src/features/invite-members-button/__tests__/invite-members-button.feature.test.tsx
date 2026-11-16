import type { RoleJSON } from '@clerk/shared/types';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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
import type { InviteMembersButtonProps } from '../invite-members-button';
import { InviteMembersButton } from '../invite-members-button';

const organization = fapiOrganization({ id: 'org_invite_button', name: 'Acme' });

const role = (key: string, name: string): RoleJSON => ({
  object: 'role',
  id: `role_${key}`,
  key,
  name,
  description: '',
  permissions: [],
  created_at: 0,
  updated_at: 0,
});

const MANAGE = ['org:sys_memberships:read', 'org:sys_memberships:manage'];

function serve({
  permissions = MANAGE,
  withOrganization = true,
  defaultRole = 'org:member',
}: { permissions?: string[]; withOrganization?: boolean; defaultRole?: string | null } = {}) {
  const membership = fapiMembership(organization, { permissions });
  const user = fapiUser({ id: 'user_invite_button', organization_memberships: [membership] });
  return serveFapi({
    environment: fapiEnvironment({
      organization_settings: {
        ...fapiEnvironment().organization_settings,
        domains: { enabled: false, enrollment_modes: [], default_role: defaultRole },
      },
    }),
    client: fapiClient([
      fapiSession({
        id: 'sess_invite_button',
        user,
        last_active_organization_id: withOrganization ? organization.id : null,
      }),
    ]),
    memberships: [membership],
    roles: [role('org:admin', 'Admin'), role('org:member', 'Member')],
  });
}

function tree(props: InviteMembersButtonProps = {}) {
  return (
    <div data-testid='host'>
      <InviteMembersButton {...props} />
    </div>
  );
}

const host = () => screen.getByTestId('host');

async function openDialog() {
  const user = userEvent.setup();
  const button = await screen.findByRole('button', { name: 'Invite members' });
  await waitFor(() => expect(button).toBeEnabled());
  await user.click(button);
  const dialog = within(await screen.findByRole('dialog', { name: 'Invite members' }));
  return { user, button, dialog };
}

describe('InviteMembersButton', () => {
  it('renders its fallback while Clerk is still loading', async () => {
    serve();
    const client = holdRequests('get', '/v1/client');
    const rendering = renderWithClerk(tree({ fallback: <output data-testid='fallback'>Loading</output> }));

    await waitFor(() => expect(client.requests).toHaveLength(1));
    expect(screen.getByTestId('fallback')).toBeInTheDocument();

    client.release();
    await rendering;
    expect(screen.queryByTestId('fallback')).toBeNull();
    expect(await screen.findByRole('button', { name: 'Invite members' })).toBeVisible();
  });

  it('renders nothing without an active organization', async () => {
    serve({ withOrganization: false });
    await renderWithClerk(tree({ fallback: <output>Loading</output> }));

    expect(host()).toBeEmptyDOMElement();
  });

  it('renders nothing without the manage-memberships permission', async () => {
    serve({ permissions: ['org:sys_memberships:read'] });
    const roles = holdRequests('get', '/v1/organizations/:organizationId/roles');
    await renderWithClerk(tree());

    expect(host()).toBeEmptyDOMElement();
    expect(roles.requests).toHaveLength(0);
    roles.release();
  });

  it('does not load invitations', async () => {
    serve();
    const invitations = holdRequests('get', '/v1/organizations/:organizationId/invitations');
    await renderWithClerk(tree());
    await openDialog();

    expect(invitations.requests).toHaveLength(0);
    invitations.release();
  });

  it('stays unavailable until roles load', async () => {
    serve();
    const roles = holdRequests('get', '/v1/organizations/:organizationId/roles');
    await renderWithClerk(tree());
    const user = userEvent.setup();

    await waitFor(() => expect(roles.requests).toHaveLength(1));
    const button = screen.getByRole('button', { name: 'Invite members' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
    await user.click(button);
    expect(screen.queryByRole('dialog', { name: 'Invite members' })).toBeNull();

    roles.release();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('invites members with the default role and returns focus to the button', async () => {
    const fapi = serve();
    await renderWithClerk(tree());
    const { user, button, dialog } = await openDialog();

    expect(dialog.getByRole('combobox', { name: /Role/ })).toHaveTextContent('Member');
    await user.type(dialog.getByRole('textbox', { name: 'Email' }), 'grace@example.com,linus@example.com{Enter}');

    const bulk = holdRequests('post', '/v1/organizations/:organizationId/invitations/bulk');
    await user.click(dialog.getByRole('button', { name: 'Send invites' }));
    await waitFor(() => expect(bulk.requests).toHaveLength(1));
    const body = new URLSearchParams(await bulk.requests[0]?.text());
    expect(body.getAll('email_address')).toEqual(['grace@example.com', 'linus@example.com']);
    expect(body.get('role')).toBe('org:member');
    bulk.release();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Invitations sent' })).toBeVisible());
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Invite members' })).toBeNull());
    expect(fapi.organizationInvitations.map(item => [item.email_address, item.role])).toEqual([
      ['grace@example.com', 'org:member'],
      ['linus@example.com', 'org:member'],
    ]);
    await waitFor(() => expect(button).toHaveFocus());
  });

  it('opens empty again after a cancelled invite', async () => {
    serve();
    await renderWithClerk(tree());
    const { user, dialog } = await openDialog();

    await user.type(dialog.getByRole('textbox', { name: 'Email' }), 'grace@example.com{Enter}');
    await user.click(dialog.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Invite members' })).toBeNull());

    const reopened = await openDialog();
    expect(reopened.dialog.queryByText('grace@example.com')).toBeNull();
  });

  it('renders an unstyled native button', async () => {
    serve();
    await renderWithClerk(tree());

    const button = await screen.findByRole('button', { name: 'Invite members' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('class');
  });

  it('takes its label from children and its element from render', async () => {
    serve();
    await renderWithClerk(
      tree({
        render: <span data-testid='trigger' />,
        nativeButton: false,
        className: 'mine',
        children: 'Add teammates',
      }),
    );

    const trigger = await screen.findByTestId('trigger');
    expect(trigger).toHaveAccessibleName('Add teammates');
    expect(trigger).toHaveAttribute('role', 'button');
    expect(trigger).toHaveClass('mine');
    await waitFor(() => expect(trigger).not.toHaveAttribute('data-disabled'));
    await userEvent.setup().click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Invite members' })).toBeVisible();
  });

  it('runs its own onClick and opens the dialog', async () => {
    serve();
    const onClick = vi.fn();
    await renderWithClerk(tree({ onClick }));
    await openDialog();

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
