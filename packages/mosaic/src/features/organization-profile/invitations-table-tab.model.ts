import { ClerkRuntimeError } from '@clerk/shared/error';
import { useOrganization, useSession } from '@clerk/shared/react';
import type { OrganizationInvitationResource } from '@clerk/shared/types';

const PAGE_SIZE = 10;
const MANAGE_PERMISSION = 'org:sys_memberships:manage';

export function useInvitationsTableModel() {
  const { session } = useSession();
  const canManage = session?.checkAuthorization({ permission: MANAGE_PERMISSION }) ?? false;
  const { organization, invitations } = useOrganization({
    invitations: canManage ? { pageSize: PAGE_SIZE, keepPreviousData: true } : undefined,
  });
  const rows = (invitations?.data ?? [])
    .filter(invitation => invitation.organizationId === organization?.id && invitation.status === 'pending')
    .map(toInvitation);

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
  };
}

function toInvitation(invitation: OrganizationInvitationResource) {
  const { id, emailAddress, createdAt, role, roleName } = invitation;
  return { id, emailAddress, createdAt, role, roleName };
}
