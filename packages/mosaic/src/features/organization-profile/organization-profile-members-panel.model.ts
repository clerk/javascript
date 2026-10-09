import { useOrganization, useSession } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';

const READ_PERMISSION = 'org:sys_memberships:read';
const MANAGE_PERMISSION = 'org:sys_memberships:manage';

export function useMembersPanelAccessModel() {
  const { isLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  if (!isLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' as const };
  }
  const canReadMembers = session?.checkAuthorization({ permission: READ_PERMISSION }) ?? false;
  const canManageInvitations = session?.checkAuthorization({ permission: MANAGE_PERMISSION }) ?? false;
  const canManageRequests = canManageInvitations && environment.organizationSettings.domains.enabled;
  if (!organization || !session || (!canReadMembers && !canManageInvitations)) {
    return { status: 'hidden' as const };
  }
  return {
    status: 'ready' as const,
    organizationId: organization.id,
    sessionId: session.id,
    canReadMembers,
    canManageInvitations,
    canManageRequests,
  };
}
