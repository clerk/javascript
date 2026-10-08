import { useOrganizationList } from '@clerk/shared/react/index';

import { organizationListParams } from '../components/OrganizationSwitcher/utils';
import { useInView } from './useInView';

/**
 * @internal
 *
 * `enabled` withholds the list params so the three requests do not start. Defaults on.
 */
export const useOrganizationListInView = ({
  enabled = true,
  keepPreviousData,
  canFetch,
}: { enabled?: boolean; keepPreviousData?: boolean; canFetch?: () => boolean } = {}) => {
  const params =
    keepPreviousData === undefined
      ? organizationListParams
      : {
          userMemberships: { ...organizationListParams.userMemberships, keepPreviousData },
          userInvitations: { ...organizationListParams.userInvitations, keepPreviousData },
          userSuggestions: { ...organizationListParams.userSuggestions, keepPreviousData },
        };
  const { userMemberships, userInvitations, userSuggestions } = useOrganizationList(enabled ? params : undefined);

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (!enabled || !inView || canFetch?.() === false) {
        return;
      }
      if (userMemberships.hasNextPage) {
        userMemberships.fetchNext?.();
      } else if (userInvitations.hasNextPage) {
        userInvitations.fetchNext?.();
      } else {
        userSuggestions.fetchNext?.();
      }
    },
  });

  return {
    userMemberships,
    userInvitations,
    userSuggestions,
    ref,
  };
};
