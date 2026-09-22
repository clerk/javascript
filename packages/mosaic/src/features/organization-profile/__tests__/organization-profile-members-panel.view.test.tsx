import * as stylex from '@stylexjs/stylex';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { colorVars } from '../../../tokens.stylex';
import { styles } from '../organization-profile-members-panel.styles';
import type { OrganizationProfileMembersPanelViewProps } from '../organization-profile-members-panel.view';
import { OrganizationProfileMembersPanelView } from '../organization-profile-members-panel.view';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

const members = [
  { id: 'm1', name: 'Kyle Mac', email: 'kyle@clerk.dev', role: 'member', addedLabel: 'Jun 14, 2026', addedAt: 3 },
  { id: 'm2', name: 'Colin Sidoti', email: 'colin@clerk.dev', role: 'admin', addedLabel: 'May 25, 2026', addedAt: 2 },
  { id: 'm3', name: 'Steve Hayes', email: 'steve@clerk.dev', role: 'admin', addedLabel: 'May 1, 2026', addedAt: 1 },
];

const invitations = [
  { id: 'i1', email: 'ksearle@clerk.dev', role: 'member', invitedLabel: 'Jun 14, 2026', invitedAt: 2 },
];

const requests = [
  {
    id: 'r1',
    name: 'Jared Dunn',
    email: 'jared@clerk.dev',
    role: 'member',
    requestedLabel: 'May 5, 2026',
    requestedAt: 1,
  },
];

function renderPanel(overrides: Partial<OrganizationProfileMembersPanelViewProps> = {}) {
  const props: OrganizationProfileMembersPanelViewProps = {
    members,
    invitations,
    requests,
    roles,
    currentUserId: 'm3',
    onChangeRole: vi.fn(),
    onRemoveMembers: vi.fn(),
    onChangeInvitationRole: vi.fn(),
    onRevokeInvitation: vi.fn(),
    onChangeRequestRole: vi.fn(),
    onAcceptRequest: vi.fn(),
    onDeclineRequest: vi.fn(),
    onInvite: vi.fn(),
    ...overrides,
  };
  render(
    <MosaicProvider>
      <OrganizationProfileMembersPanelView {...props} />
    </MosaicProvider>,
  );
  return props;
}

describe('OrganizationProfileMembersPanelView', () => {
  it('lists members and marks the current user, whose role is not editable', () => {
    renderPanel();
    expect(screen.getByText('Kyle Mac')).toBeInTheDocument();
    expect(screen.getByText('(you)')).toBeInTheDocument();
    // Steve Hayes is the viewer, so his role renders as a disabled button, not an open control.
    const steveRow = screen.getByText('Steve Hayes').closest('tr') as HTMLElement;
    const currentUserRole = within(steveRow).getByRole('button', { name: 'Admin' });
    expect(currentUserRole).toBeDisabled();
    expect(currentUserRole).toHaveAttribute('data-size', 'md');
    expect(currentUserRole).toHaveAttribute('data-variant', 'ghost');
    // A non-viewer admin exposes the role control.
    const colinRow = screen.getByText('Colin Sidoti').closest('tr') as HTMLElement;
    const editableRole = within(colinRow).getByRole('button', { name: /Admin/ });
    expect(editableRole).toHaveAttribute('data-size', 'md');
    expect(editableRole).toHaveAttribute('data-variant', 'ghost');
  });

  it('keeps the name column wide and truncates identity text across member tabs', async () => {
    const user = userEvent.setup();
    const longMemberName = 'Alexandria Catherine Montgomery-Worthington';
    const longMemberEmail = 'alexandria.catherine.montgomery-worthington@clerk.example.com';
    const longInvitationEmail = 'pending.invitation.with.an.unusually.long.address@clerk.example.com';
    const longRequestName = 'Bartholomew Maximilian Requester-Sutherland';
    const longRequestEmail = 'bartholomew.maximilian.requester-sutherland@clerk.example.com';
    const nameColumnClass = stylex.props(styles.nameColumn).className as string;
    const nameClasses = (stylex.props(styles.name).className as string).split(' ');
    const emailClasses = (stylex.props(styles.email).className as string).split(' ');

    renderPanel({
      members: [
        {
          id: 'm-long',
          name: longMemberName,
          email: longMemberEmail,
          role: 'member',
          addedLabel: 'Jun 14, 2026',
          addedAt: 3,
        },
      ],
      invitations: [
        {
          id: 'i-long',
          email: longInvitationEmail,
          role: 'member',
          invitedLabel: 'Jun 14, 2026',
          invitedAt: 2,
        },
      ],
      requests: [
        {
          id: 'r-long',
          name: longRequestName,
          email: longRequestEmail,
          role: 'member',
          requestedLabel: 'May 5, 2026',
          requestedAt: 1,
        },
      ],
    });

    const expectNameColumn = (identity: HTMLElement) => {
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass(nameColumnClass);
      expect(identity.closest('td')).toHaveClass(nameColumnClass);
    };

    const memberName = screen.getByText(longMemberName);
    expectNameColumn(memberName);
    expect(memberName).toHaveClass(...nameClasses);
    expect(screen.getByText(longMemberEmail)).toHaveClass(...emailClasses);

    await user.click(screen.getByRole('tab', { name: 'Invitations' }));
    const invitationEmail = screen.getByText(longInvitationEmail);
    expectNameColumn(invitationEmail);
    expect(invitationEmail).toHaveClass(...emailClasses);

    await user.click(screen.getByRole('tab', { name: /Requests/ }));
    const requestName = screen.getByText(longRequestName);
    expectNameColumn(requestName);
    expect(requestName).toHaveClass(...nameClasses);
    expect(screen.getByText(longRequestEmail)).toHaveClass(...emailClasses);
  });

  it('filters the members list by search', async () => {
    const user = userEvent.setup();
    renderPanel();
    const search = screen.getByRole('textbox', { name: 'Search members' });
    expect(search).toHaveClass(...(stylex.props(styles.toolbarSearchInput).className as string).split(' '));
    expect(screen.getByRole('combobox', { name: /Filter by role/ })).toHaveAttribute('data-size', 'md');
    await user.type(search, 'colin');
    expect(screen.getByText('Colin Sidoti')).toBeInTheDocument();
    expect(screen.queryByText('Kyle Mac')).not.toBeInTheDocument();
  });

  it('shows the members empty state and sends an invite', async () => {
    const user = userEvent.setup();
    const props = renderPanel({ members: [], defaultTab: 'members' });
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('No members yet')).toBeInTheDocument();
    expect(screen.getByText('Invite people to add them to this organization.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send invite' }));
    expect(props.onInvite).toHaveBeenCalledOnce();
  });

  it('opens directly to the invitations empty state and sends an invite', async () => {
    const user = userEvent.setup();
    const props = renderPanel({ invitations: [], defaultTab: 'invitations' });
    expect(screen.getByRole('tab', { name: 'Invitations' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('No pending invitations')).toBeInTheDocument();
    expect(
      screen.getByText('Invite teammates by email and they’ll show up here until they accept.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Invite member' }));
    expect(props.onInvite).toHaveBeenCalledOnce();
  });

  it('opens directly to the requests empty state without an empty-state action', () => {
    renderPanel({ requests: [], defaultTab: 'requests' });
    expect(screen.getByRole('tab', { name: 'Requests' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('No pending requests')).toBeInTheDocument();
    expect(screen.getByText('Requests to join this organization will show up here.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send invite' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Invite member' })).not.toBeInTheDocument();
  });

  it.each([
    { tab: 'members' as const, query: 'Kyle', emptyLabel: 'No members found', result: 'Kyle Mac' },
    {
      tab: 'invitations' as const,
      query: 'ksearle',
      emptyLabel: 'No invitations found',
      result: 'ksearle@clerk.dev',
    },
    { tab: 'requests' as const, query: 'Jared', emptyLabel: 'No requests found', result: 'Jared Dunn' },
  ])('clears search and role filters from the $tab no-results state', async ({ tab, query, emptyLabel, result }) => {
    const user = userEvent.setup();
    renderPanel({ defaultTab: tab });
    const roleFilter = screen.getByRole('combobox', { name: /Filter by role/ });
    const search = screen.getByRole('textbox', { name: 'Search members' });
    await user.click(roleFilter);
    await user.click(screen.getByRole('option', { name: 'Admin' }));
    await user.type(search, query);
    expect(screen.getByText(emptyLabel)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(search).toHaveValue('');
    expect(roleFilter).toHaveTextContent('All Roles');
    expect(screen.getByText(result)).toBeInTheDocument();
  });

  it('shows the invitations tab with its rows and a revoke action', async () => {
    const user = userEvent.setup();
    const props = renderPanel();
    await user.click(screen.getByRole('tab', { name: 'Invitations' }));
    const invitationRow = screen.getByText('ksearle@clerk.dev').closest('tr') as HTMLElement;
    const invitationAvatar = invitationRow.querySelector('.cl-avatar') as HTMLElement;
    expect(invitationAvatar).toHaveClass(...(stylex.props(styles.invitationAvatar).className as string).split(' '));
    const invitationAvatarRing = invitationAvatar.querySelector('circle');
    expect(invitationAvatarRing).toHaveAttribute('stroke', colorVars['--cl-color-border']);
    expect(invitationAvatarRing).toHaveAttribute('stroke-dasharray', '4 4');
    expect(invitationAvatarRing).toHaveAttribute('stroke-linecap', 'round');
    expect(invitationAvatar.querySelector('.cl-icon')).toBeInTheDocument();
    const invitationRole = within(invitationRow).getByRole('button', { name: /Member/ });
    expect(invitationRole).toHaveAttribute('data-size', 'md');
    await user.click(invitationRole);
    await user.click(screen.getByRole('menuitem', { name: 'Admin' }));
    expect(props.onChangeInvitationRole).toHaveBeenCalledWith(['i1'], 'admin');
    await user.click(screen.getByRole('button', { name: 'Manage invitation for ksearle@clerk.dev' }));
    await user.click(screen.getByRole('menuitem', { name: 'Revoke invitation' }));
    expect(props.onRevokeInvitation).toHaveBeenCalledWith(['i1']);
  });

  it('shows the requests tab with a count badge and accept/decline actions', async () => {
    const user = userEvent.setup();
    const props = renderPanel();
    // Badge count beside the Requests tab.
    expect(within(screen.getByRole('tab', { name: /Requests/ })).getByText('1')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /Requests/ }));
    const requestRow = screen.getByText('Jared Dunn').closest('tr') as HTMLElement;
    const requestRole = within(requestRow).getByRole('button', { name: /Member/ });
    expect(requestRole).toHaveAttribute('data-size', 'md');
    await user.click(requestRole);
    await user.click(screen.getByRole('menuitem', { name: 'Admin' }));
    expect(props.onChangeRequestRole).toHaveBeenCalledWith(['r1'], 'admin');
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(props.onAcceptRequest).toHaveBeenCalledWith('r1');
    await user.click(screen.getByRole('button', { name: 'Decline' }));
    expect(props.onDeclineRequest).toHaveBeenCalledWith(['r1']);
  });

  it('confirms before removing a member from the row menu', async () => {
    const user = userEvent.setup();
    const props = renderPanel();
    await user.click(screen.getByRole('button', { name: 'Manage Kyle Mac' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove from organization' }));
    // The confirmation dialog appears; nothing is removed until it is confirmed.
    expect(props.onRemoveMembers).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove 1 member' });
    expect(
      within(dialog).getByText('They will lose access to this workspace and its applications.'),
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Remove members' }));
    expect(props.onRemoveMembers).toHaveBeenCalledWith(['m1']);
  });

  it('counts the selection in the bulk remove confirmation', async () => {
    const user = userEvent.setup();
    const props = renderPanel();
    await user.click(screen.getByRole('checkbox', { name: 'Select Kyle Mac' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Colin Sidoti' }));
    await user.click(screen.getByRole('button', { name: 'Remove selected members' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove 2 members' });
    await user.click(within(dialog).getByRole('button', { name: 'Remove members' }));
    expect(props.onRemoveMembers).toHaveBeenCalledWith(['m1', 'm2']);
  });

  it('drops rows the search hides from the bulk selection', async () => {
    const user = userEvent.setup();
    const props = renderPanel();
    await user.click(screen.getByRole('checkbox', { name: 'Select Kyle Mac' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Colin Sidoti' }));
    // Narrowing the list to Colin leaves Kyle selected but hidden; the bulk bar must forget him.
    await user.type(screen.getByRole('textbox', { name: 'Search members' }), 'colin');
    const toolbar = screen.getByRole('toolbar', { name: 'Member bulk actions' });
    expect(within(toolbar).getByText('1 selected')).toBeInTheDocument();
    await user.click(within(toolbar).getByRole('button', { name: /Change role/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Admin' }));
    expect(props.onChangeRole).toHaveBeenCalledWith(['m2'], 'admin');
  });

  it.each([
    { mode: 'frame', position: 'relative', inset: true },
    { mode: 'viewport', position: 'static', inset: false },
  ])('$mode: insets the rows for the bulk bar = $inset', async ({ position, inset }) => {
    const user = userEvent.setup();
    const content = document.createElement('div');
    content.className = 'cl-profile-content';
    content.style.position = position;
    document.body.appendChild(content);
    const props: OrganizationProfileMembersPanelViewProps = { members, roles, onChangeRole: vi.fn() };
    render(
      <MosaicProvider>
        <OrganizationProfileMembersPanelView {...props} />
      </MosaicProvider>,
      { container: content },
    );

    const panel = document.querySelector('.cl-organization-profile-members-panel') as HTMLElement;
    const insetClass = stylex.props(styles.rootWithBulkBar).className as string;
    expect(panel).not.toHaveClass(insetClass);
    await user.click(screen.getByRole('checkbox', { name: 'Select Kyle Mac' }));
    expect(panel.className.includes(insetClass)).toBe(inset);
  });

  it('changes roles and removes selected invitations in bulk', async () => {
    const user = userEvent.setup();
    const props = renderPanel();
    await user.click(screen.getByRole('tab', { name: 'Invitations' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select invitation for ksearle@clerk.dev' }));
    const toolbar = screen.getByRole('toolbar', { name: 'Invitation bulk actions' });
    await user.click(within(toolbar).getByRole('button', { name: /Change role/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Admin' }));
    expect(props.onChangeInvitationRole).toHaveBeenCalledWith(['i1'], 'admin');

    await user.click(screen.getByRole('checkbox', { name: 'Select invitation for ksearle@clerk.dev' }));
    await user.click(screen.getByRole('button', { name: 'Remove selected invitations' }));
    expect(props.onRevokeInvitation).toHaveBeenCalledWith(['i1']);
  });

  it('changes roles and removes selected requests in bulk', async () => {
    const user = userEvent.setup();
    const props = renderPanel();
    await user.click(screen.getByRole('tab', { name: /Requests/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Select request from Jared Dunn' }));
    const toolbar = screen.getByRole('toolbar', { name: 'Request bulk actions' });
    await user.click(within(toolbar).getByRole('button', { name: /Change role/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Admin' }));
    expect(props.onChangeRequestRole).toHaveBeenCalledWith(['r1'], 'admin');

    await user.click(screen.getByRole('checkbox', { name: 'Select request from Jared Dunn' }));
    await user.click(screen.getByRole('button', { name: 'Remove selected requests' }));
    expect(props.onDeclineRequest).toHaveBeenCalledWith(['r1']);
  });

  it('reveals the bulk action bar once rows are selected', async () => {
    const user = userEvent.setup();
    renderPanel();
    const toolbar = screen.getByRole('toolbar', { name: 'Member bulk actions', hidden: true });
    expect(toolbar).toHaveAttribute('data-open', 'false');
    await user.click(screen.getByRole('checkbox', { name: 'Select Kyle Mac' }));
    expect(toolbar).toHaveAttribute('data-open', 'true');
    expect(within(toolbar).getByText('1 selected')).toBeInTheDocument();
    const buttons = within(toolbar).getAllByRole('button');
    expect(buttons).toHaveLength(3);
    buttons.forEach(button => expect(button).toHaveAttribute('data-size', 'md'));
  });

  it('hides mutation affordances when their callbacks are absent', () => {
    renderPanel({ onRemoveMembers: undefined, onChangeRole: undefined });
    expect(screen.queryByRole('button', { name: 'Manage Kyle Mac' })).not.toBeInTheDocument();
    // With no onChangeRole, roles render as a disabled button rather than a menu trigger.
    const kyleRow = screen.getByText('Kyle Mac').closest('tr') as HTMLElement;
    expect(within(kyleRow).getByRole('button', { name: /Member/ })).toBeDisabled();
  });

  it('leaves the invite button inert but present when onInvite is absent', () => {
    renderPanel({ onInvite: undefined });
    expect(screen.getByRole('button', { name: /Invite/ })).toBeEnabled();
  });
});
