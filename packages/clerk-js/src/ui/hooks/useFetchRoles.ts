import { useCoreOrganization } from '../contexts';
import { useLocalizations } from '../localization';
import { customRoleLocalizationKey, roleLocalizationKey } from '../utils';
import { useFetch } from './useFetch';

const getRolesParams = {
  pageSize: 20,
};
export const useFetchRoles = () => {
  const { organization } = useCoreOrganization();
  const { data, status } = useFetch(organization?.getRoles, getRolesParams);

  return {
    isLoading: status.isLoading,
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
