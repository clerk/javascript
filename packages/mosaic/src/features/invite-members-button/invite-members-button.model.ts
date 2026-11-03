import { useOrganization, useSession } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { ORGANIZATION_PERMISSIONS } from '../../utils/permissions';
import { useInviteMembersModel } from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.model';
import { useMembersPanelRolesModel } from '../organization-profile/organization-profile-members-panel/organization-profile-members-panel.model';

export type InviteMembersButtonAccessModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'ready'; organizationId: string; sessionId: string };

export function useInviteMembersButtonAccessModel(): InviteMembersButtonAccessModel {
  const { isLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();

  if (!isLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!organization || !session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.membershipsManage })) {
    return { status: 'hidden' };
  }

  return { status: 'ready', organizationId: organization.id, sessionId: session.id };
}

export function useInviteMembersButtonModel() {
  const { roles, defaultRole } = useMembersPanelRolesModel(true);
  const invite = useInviteMembersModel();

  return { roles, defaultRole, invite };
}
