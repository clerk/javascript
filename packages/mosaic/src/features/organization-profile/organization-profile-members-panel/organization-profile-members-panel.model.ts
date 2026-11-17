import { useOrganization, useSession } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useOrganizationRolesQuery } from '../../../queries/use-organization-roles-query';
import { ORGANIZATION_PERMISSIONS } from '../../../utils/permissions';
import type { MembersPanelRoles } from './members-table-tab.types';

export type MembersPanelAccessModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      organizationId: string;
      sessionId: string;
      canReadMembers: boolean;
      canManageInvitations: boolean;
      canManageRequests: boolean;
    };

export function useMembersPanelAccessModel(): MembersPanelAccessModel {
  const { isLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  if (!isLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }
  const canReadMembers = session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.membershipsRead }) ?? false;
  const canManageInvitations =
    session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.membershipsManage }) ?? false;
  const canManageRequests = canManageInvitations && environment.organizationSettings.domains.enabled;
  if (!organization || !session || (!canReadMembers && !canManageInvitations)) {
    return { status: 'hidden' };
  }
  return {
    status: 'ready',
    organizationId: organization.id,
    sessionId: session.id,
    canReadMembers,
    canManageInvitations,
    canManageRequests,
  };
}

export function useMembersPanelRolesModel(canReadRoles: boolean): MembersPanelRoles {
  const environment = useMosaicEnvironment();
  const { data: result, isLoading } = useOrganizationRolesQuery({ enabled: canReadRoles });
  return {
    defaultRole: environment?.organizationSettings.domains.defaultRole ?? null,
    roles: result
      ? {
          roles: result.data.map(({ key, name }) => ({ key, name })),
          hasRoleSetMigration: result.has_role_set_migration ?? false,
        }
      : null,
    isLoading,
  };
}
