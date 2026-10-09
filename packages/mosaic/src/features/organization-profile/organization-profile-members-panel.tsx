import type { ReactNode } from 'react';

import { useInvitationsTableController } from './invitations-table-tab.controller';
import { useInvitationsTableModel } from './invitations-table-tab.model';
import { useMembersTableController, useMembersTableSearchController } from './members-table-tab.controller';
import { useMembersTableModel } from './members-table-tab.model';
import { useMembersPanelAccessModel } from './organization-profile-members-panel.model';
import { OrganizationProfileMembersPanelView } from './organization-profile-members-panel.view';
import { useRequestsTableController } from './requests-table-tab.controller';
import { useRequestsTableModel } from './requests-table-tab.model';

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
      key={`${access.organizationId}:${access.sessionId}:${access.canReadMembers}:${access.canManageInvitations}:${access.canManageRequests}`}
      canReadMembers={access.canReadMembers}
      canManageInvitations={access.canManageInvitations}
      canManageRequests={access.canManageRequests}
    />
  );
}

function ConnectedMembersPanel({
  canReadMembers,
  canManageInvitations,
  canManageRequests,
}: {
  canReadMembers: boolean;
  canManageInvitations: boolean;
  canManageRequests: boolean;
}) {
  const model = useInvitationsTableModel();
  const invitations = useInvitationsTableController(model);
  const requestsModel = useRequestsTableModel(canManageRequests);
  const requests = useRequestsTableController(requestsModel);
  if (canReadMembers) {
    return (
      <ConnectedReadableMembersPanel
        invitations={canManageInvitations ? invitations : undefined}
        requests={canManageRequests ? requests : undefined}
      />
    );
  }
  return (
    <OrganizationProfileMembersPanelView
      invitations={canManageInvitations ? invitations : undefined}
      requests={canManageRequests ? requests : undefined}
    />
  );
}

function ConnectedReadableMembersPanel({
  invitations,
  requests,
}: {
  invitations?: ReturnType<typeof useInvitationsTableController>;
  requests?: ReturnType<typeof useRequestsTableController>;
}) {
  const search = useMembersTableSearchController();
  const model = useMembersTableModel(search.query);
  const members = useMembersTableController(model);
  return (
    <OrganizationProfileMembersPanelView
      members={{ ...members, ...search }}
      invitations={invitations}
      requests={requests}
    />
  );
}
