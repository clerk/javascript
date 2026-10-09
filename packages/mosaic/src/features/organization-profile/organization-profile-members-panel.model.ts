import { useOrganization, useSession } from '@clerk/shared/react';

const READ_PERMISSION = 'org:sys_memberships:read';
const MANAGE_PERMISSION = 'org:sys_memberships:manage';

export function useMembersPanelAccessModel() {
  const { isLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  if (!isLoaded || !isSessionLoaded) {
    return { status: 'loading' as const };
  }
  const canReadMembers = session?.checkAuthorization({ permission: READ_PERMISSION }) ?? false;
  const canManageInvitations = session?.checkAuthorization({ permission: MANAGE_PERMISSION }) ?? false;
  if (!organization || !session || (!canReadMembers && !canManageInvitations)) {
    return { status: 'hidden' as const };
  }
  return {
    status: 'ready' as const,
    organizationId: organization.id,
    sessionId: session.id,
    canReadMembers,
    canManageInvitations,
  };
}
