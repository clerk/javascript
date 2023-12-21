import { useOrganization } from '@clerk/shared/react';

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
export const useFetchRoles = () => {
  const { organization } = useOrganization();
  const { data, isLoading } = useFetch(organization?.getRoles, getRolesParams);

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
