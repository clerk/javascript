import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useSession } from '@clerk/shared/react';
import type { ClerkAPIError, OrganizationInvitationResource } from '@clerk/shared/types';

import { save } from '../../utils/errors';
import type { MembersRoles } from './members-table-tab.types';

const PAGE_SIZE = 10;
const MANAGE_PERMISSION = 'org:sys_memberships:manage';

export interface InviteMembersInput {
  emailAddresses: string[];
  role: string;
  roles: MembersRoles;
  onRejected: (emailAddresses: string[]) => void;
}

export function useInvitationsTableModel() {
  const clerk = useClerk();
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
    invite: canManage
      ? ({ emailAddresses, role, roles, onRejected }: InviteMembersInput) =>
          save(async () => {
            const organizationId = organization?.id;
            const sessionId = session?.id;
            if (!organization || !roles.roles.some(option => option.key === role)) {
              throw new ClerkRuntimeError('This role is unavailable.', { code: 'role_unavailable' });
            }
            // TODO: Add session reverification for invitations; surface API errors until then.
            try {
              await organization.inviteMembers({ emailAddresses, role });
            } catch (cause) {
              onRejected(rejectedEmailAddresses(cause, emailAddresses));
              throw cause;
            }
            if (clerk.organization?.id !== organizationId || clerk.session?.id !== sessionId) {
              throw new ClerkRuntimeError('The active organization changed.', { code: 'organization_changed' });
            }
            await invitations?.revalidate?.();
          })
      : undefined,
  };
}

function rejectedEmailAddresses(cause: unknown, submitted: string[]) {
  if (!isClerkAPIResponseError(cause)) {
    return [];
  }
  const isRejected = (email: string) =>
    cause.errors.some(
      (error: ClerkAPIError) =>
        [...(error.meta?.emailAddresses ?? []), ...(error.meta?.identifiers ?? [])].some(
          value => value.toLowerCase() === email.toLowerCase(),
        ) ||
        (error.code === 'already_a_member_in_organization' &&
          (error.longMessage ?? '').toLowerCase().startsWith(`${email.toLowerCase()} `)),
    );
  return submitted.filter(isRejected);
}

function toInvitation(invitation: OrganizationInvitationResource) {
  const { id, emailAddress, createdAt, role, roleName } = invitation;
  return { id, emailAddress, createdAt, role, roleName };
}
