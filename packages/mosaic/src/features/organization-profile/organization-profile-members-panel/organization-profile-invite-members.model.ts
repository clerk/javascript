import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useSession } from '@clerk/shared/react';
import type { ClerkAPIError } from '@clerk/shared/types';

import { save } from '../../../utils/errors';
import { ORGANIZATION_PERMISSIONS } from '../../../utils/permissions';
import type { MembersRoles } from './members-table-tab.types';

export interface InviteMembersInput {
  emailAddresses: string[];
  role: string;
  roles: MembersRoles;
  onRejected: (emailAddresses: string[]) => void;
}

export function useInviteMembersModel({ onInvited }: { onInvited?: () => unknown } = {}) {
  const clerk = useClerk();
  const { session } = useSession();
  const { organization } = useOrganization();
  const canManage = session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.membershipsManage }) ?? false;

  if (!canManage) {
    return undefined;
  }

  return ({ emailAddresses, role, roles, onRejected }: InviteMembersInput) =>
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
      await onInvited?.();
    });
}

export function rejectedEmailAddresses(cause: unknown, submitted: string[]) {
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
