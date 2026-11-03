import { ClerkRuntimeError } from '@clerk/shared/error';
import { useOrganization, useSession } from '@clerk/shared/react';
import type { OrganizationInvitationResource } from '@clerk/shared/types';

import { ORGANIZATION_PERMISSIONS } from '../../../utils/permissions';
import { useInviteMembersModel } from './organization-profile-invite-members.model';

const PAGE_SIZE = 10;

export function useInvitationsTableModel() {
  const { session } = useSession();
  const canManage = session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.membershipsManage }) ?? false;
  const { organization, invitations } = useOrganization({
    invitations: canManage ? { pageSize: PAGE_SIZE, keepPreviousData: true } : undefined,
  });
  const rows = (invitations?.data ?? [])
    .filter(invitation => invitation.organizationId === organization?.id && invitation.status === 'pending')
    .map(toInvitation);
  const invite = useInviteMembersModel({ onInvited: () => invitations?.revalidate?.() });

  return {
    rows,
    pageSize: PAGE_SIZE,
    totalCount: invitations?.count ?? 0,
    page: invitations?.page ?? 1,
    isLoading: invitations?.isLoading ?? true,
    isFetching: invitations?.isFetching ?? false,
    isError: invitations?.isError ?? false,
    retry: () => invitations?.revalidate?.(),
    fetchPage: (page: number) => invitations?.fetchPage?.(page),
    revoke: canManage
      ? async (id: string) => {
          const invitation = invitations?.data?.find(
            item => item.id === id && item.organizationId === organization?.id && item.status === 'pending',
          );
          if (!invitation) {
            throw new ClerkRuntimeError('This invitation cannot be revoked.', { code: 'invitation_unavailable' });
          }
          const lastOnPage = (invitations?.data?.length ?? 0) === 1 && (invitations?.page ?? 1) > 1;
          await invitation.revoke();
          await invitations?.revalidate?.();
          if (lastOnPage) {
            invitations?.fetchPage?.((invitations?.page ?? 1) - 1);
          }
        }
      : undefined,
    invite,
  };
}

function toInvitation(invitation: OrganizationInvitationResource) {
  const { id, emailAddress, createdAt, role, roleName } = invitation;
  return { id, emailAddress, createdAt, role, roleName };
}
