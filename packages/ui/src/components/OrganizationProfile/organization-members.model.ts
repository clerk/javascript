import { useOrganization, useUser } from '@clerk/shared/react';

import { useProtect } from '@/ui/common';
import { useEnvironment } from '@/ui/contexts';

import { useActiveMembersListModel } from './active-members-list.model';

export const useOrganizationMembersScope = () => {
  const { organization } = useOrganization();
  const { user } = useUser();
  return { organizationId: organization?.id, userId: user?.id };
};

export const useOrganizationMembersModel = (query: string, pageSize: number) => {
  const { organizationSettings } = useEnvironment();
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });
  const canReadMemberships = useProtect({ permission: 'org:sys_memberships:read' });
  const isDomainsEnabled = organizationSettings?.domains?.enabled && canManageMemberships;

  const { membershipRequests, memberships, invitations, organization } = useOrganization({
    membershipRequests: isDomainsEnabled || undefined,
    invitations: canManageMemberships || undefined,
    memberships: canReadMemberships
      ? {
          keepPreviousData: true,
          query: query || undefined,
        }
      : undefined,
  });

  const activeMembers = useActiveMembersListModel({ memberships, pageSize });
  const { hasRoleSetMigration } = activeMembers;

  return {
    activeMembers,
    isPending: canManageMemberships === null,
    view: {
      canManageMemberships,
      canReadMemberships,
      isDomainsEnabled,
      hasRoleSetMigration,
      membershipCount: memberships?.count,
      showInvitationCount: Boolean(invitations?.data && !invitations.isLoading),
      invitationCount: invitations?.count ?? 0,
      showRequestCount: Boolean(membershipRequests?.data && !membershipRequests.isLoading),
      requestCount: membershipRequests?.count ?? 0,
      seatUsage:
        canReadMemberships && !!memberships?.count && organization && organization.maxAllowedMemberships > 0
          ? {
              count: organization.membersCount + organization.pendingInvitationsCount,
              limit: organization.maxAllowedMemberships,
            }
          : undefined,
    },
    searchQuery: {
      page: memberships?.page ?? 1,
      hasData: Boolean(memberships?.data),
      count: memberships?.count ?? 0,
      hasRows: Boolean(memberships?.data?.length),
      isLoading: Boolean(memberships?.isLoading),
      fetchPage: activeMembers.table.onPageChange,
    },
  };
};
