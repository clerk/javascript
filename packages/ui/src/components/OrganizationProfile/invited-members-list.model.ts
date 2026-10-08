import { useClerk, useOrganization, useUser } from '@clerk/shared/react';

import { useFetchRoles, useLocalizeCustomRoles } from '@/hooks/useFetchRoles';

import type { InvitedMembersListModel } from './invited-members-list.types';

const invitationsParams = {
  invitations: {
    pageSize: 10,
    keepPreviousData: true,
  },
};

export const useInvitedMembersListModel = (): InvitedMembersListModel => {
  const clerk = useClerk();
  const { user } = useUser();
  const { organization, invitations } = useOrganization(invitationsParams);
  const { options, isLoading: loadingRoles } = useFetchRoles();
  const { localizeCustomRole } = useLocalizeCustomRoles();
  const subject = organization?.id;
  const actor = user?.id;
  const ownsScope = () => !!subject && !!actor && clerk.organization?.id === subject && clerk.user?.id === actor;

  return {
    scope: `${actor}:${subject}`,
    hasOrganization: Boolean(organization),
    invitations: (invitations?.data || []).map(invitation => ({
      id: invitation.id,
      view: {
        emailAddress: invitation.emailAddress,
        invitedAt: invitation.createdAt.toLocaleDateString(),
        roleLabel:
          localizeCustomRole(invitation.role) || options?.find(option => option.value === invitation.role)?.label,
      },
      revoke: async () => {
        if (!ownsScope()) {
          return;
        }
        await invitation.revoke();
        if (ownsScope()) {
          await invitations?.revalidate?.();
        }
      },
    })),
    table: {
      page: invitations?.page || 1,
      onPageChange: page => {
        if (ownsScope()) {
          invitations?.fetchPage?.(page);
        }
      },
      itemCount: invitations?.count || 0,
      pageCount: invitations?.pageCount || 0,
      itemsPerPage: invitationsParams.invitations.pageSize,
      isLoading: invitations?.isLoading || loadingRoles,
    },
  };
};
