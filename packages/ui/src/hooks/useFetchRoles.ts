import { useOrganization } from '@clerk/shared/react';
import type { GetRolesParams } from '@clerk/shared/types';

import { useProtect } from '../common';
import { useLocalizations } from '../localization';
import { customRoleLocalizationKey, roleLocalizationKey } from '../utils/roleLocalizationKey';
import { useFetch } from './useFetch';

const getRolesParams = {
  /**
   * Fetch at most 20 Roles, it is not expected for an app to have more.
   * We also prevent the creation of more than 20 Roles in dashboard.
   */
  pageSize: 20,
};
export const useFetchRoles = (enabled = true) => {
  const { organization } = useOrganization();
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });
  const canReadMemberships = useProtect({ permission: 'org:sys_memberships:read' });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const getRoles = ({ pageSize, initialPage }: GetRolesParams) => organization!.getRoles({ pageSize, initialPage });

  const hasSystemPermissions = canManageMemberships || canReadMemberships;
  const shouldFetchRoles = enabled && !!organization?.id && hasSystemPermissions;
  const { data, isLoading } = useFetch(shouldFetchRoles ? getRoles : undefined, {
    ...getRolesParams,
    orgId: organization?.id,
  });

  return {
    isLoading,
    options: data?.data?.map(role => ({ value: role.key, label: role.name })),
  };
};

export const useLocalizeCustomRoles = () => {
  const { t } = useLocalizations();
  return {
    localizeCustomRole: (param: string | undefined) =>
      t(customRoleLocalizationKey(param)) || t(roleLocalizationKey(param)),
  };
};
