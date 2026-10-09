import type { ReactNode } from 'react';

import { useInvitationsTableController } from './invitations-table-tab.controller';
import { useInvitationsTableModel } from './invitations-table-tab.model';
import { useMembersTableController, useMembersTableSearchController } from './members-table-tab.controller';
import { useMembersTableModel } from './members-table-tab.model';
import { useMembersPanelAccessModel } from './organization-profile-members-panel.model';
import { OrganizationProfileMembersPanelView } from './organization-profile-members-panel.view';

export function OrganizationProfileMembersPanel({ fallback }: { fallback?: ReactNode }) {
  const access = useMembersPanelAccessModel();
  if (access.status === 'loading') {
    return fallback ?? null;
  }
  if (access.status === 'hidden') {
    return null;
  }
  return (
    <ConnectedMembersPanel
      key={`${access.organizationId}:${access.sessionId}:${access.canReadMembers}:${access.canManageInvitations}`}
      canReadMembers={access.canReadMembers}
      canManageInvitations={access.canManageInvitations}
    />
  );
}

function ConnectedMembersPanel({
  canReadMembers,
  canManageInvitations,
}: {
  canReadMembers: boolean;
  canManageInvitations: boolean;
}) {
  const model = useInvitationsTableModel();
  const invitations = useInvitationsTableController(model);
  if (canReadMembers) {
    return <ConnectedReadableMembersPanel invitations={canManageInvitations ? invitations : undefined} />;
  }
  return <OrganizationProfileMembersPanelView invitations={canManageInvitations ? invitations : undefined} />;
}

function ConnectedReadableMembersPanel({
  invitations,
}: {
  invitations?: ReturnType<typeof useInvitationsTableController>;
}) {
  const search = useMembersTableSearchController();
  const model = useMembersTableModel(search.query);
  const members = useMembersTableController(model);
  return (
    <OrganizationProfileMembersPanelView
      members={{ ...members, ...search }}
      invitations={invitations}
    />
  );
}
