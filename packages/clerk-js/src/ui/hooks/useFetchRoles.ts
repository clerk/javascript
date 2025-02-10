import { useOrganization } from '@clerk/shared/react';
import type { GetRolesParams } from '@clerk/types';

import { useLocalizations } from '../localization';
import { customRoleLocalizationKey, roleLocalizationKey } from '../utils';
import { useFetch } from './useFetch';

const getRolesParams = {
  /**
   * Fetch at most 20 roles, it is not expected for an app to have more.
   * We also prevent the creation of more than 20 roles in dashboard.
   */
  pageSize: 20,
};
export const useFetchRoles = (enabled = true) => {
  const { organization } = useOrganization();
  const getRoles = ({ pageSize, initialPage }: GetRolesParams) => organization!.getRoles({ pageSize, initialPage });
  const { data, isLoading } = useFetch(enabled && !!organization?.id ? getRoles : undefined, {
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
