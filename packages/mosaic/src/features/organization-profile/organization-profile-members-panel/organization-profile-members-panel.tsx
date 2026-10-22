import type { ReactNode } from 'react';

import { useInvitationsTableController } from './invitations-table-tab.controller';
import { useInvitationsTableModel } from './invitations-table-tab.model';
import { useMembersTableController, useMembersTableSearchController } from './members-table-tab.controller';
import { useMembersTableModel } from './members-table-tab.model';
import type { MembersPanelRoles, MembersRolesState } from './members-table-tab.types';
import { useInviteMembersController } from './organization-profile-invite-members.controller';
import { useMembersPanelAccessModel, useMembersPanelRolesModel } from './organization-profile-members-panel.model';
import type { OrganizationProfileMembersPanelViewProps } from './organization-profile-members-panel.view';
import { OrganizationProfileMembersPanelView } from './organization-profile-members-panel.view';
import { useRequestsTableController } from './requests-table-tab.controller';
import { useRequestsTableModel } from './requests-table-tab.model';

export function OrganizationProfileMembersPanel({ fallback }: { fallback?: ReactNode }) {
  const access = useMembersPanelAccessModel();
  const roles = useMembersPanelRolesModel(access.status === 'ready' && access.canManageInvitations);
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
      roles={roles}
    />
  );
}

function ConnectedMembersPanel({
  canReadMembers,
  canManageInvitations,
  canManageRequests,
  roles,
}: {
  canReadMembers: boolean;
  canManageInvitations: boolean;
  canManageRequests: boolean;
  roles: MembersPanelRoles;
}) {
  const model = useInvitationsTableModel();
  const invitations = useInvitationsTableController(model);
  const invite = useInviteMembersController({
    roles: roles.roles,
    defaultRole: roles.defaultRole,
    invite: model.invite,
  });
  const requestsModel = useRequestsTableModel(canManageRequests);
  const requests = useRequestsTableController(requestsModel);
  const panel = {
    invitations: canManageInvitations ? invitations : undefined,
    requests: canManageRequests ? requests : undefined,
    ...invite,
  };
  if (canReadMembers) {
    return (
      <ConnectedReadableMembersPanel
        roles={roles}
        {...panel}
      />
    );
  }
  return <OrganizationProfileMembersPanelView {...panel} />;
}

function ConnectedReadableMembersPanel({
  roles,
  ...panel
}: Omit<OrganizationProfileMembersPanelViewProps, 'members'> & { roles: MembersRolesState }) {
  const search = useMembersTableSearchController();
  const model = useMembersTableModel(search.query);
  const members = useMembersTableController(model, roles);
  return (
    <OrganizationProfileMembersPanelView
      members={{ ...members, ...search }}
      {...panel}
    />
  );
}
