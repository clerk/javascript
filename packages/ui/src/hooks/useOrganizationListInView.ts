import { useOrganizationList } from '@clerk/shared/react/index';

import { organizationListParams } from '../components/OrganizationSwitcher/utils';
import { useInView } from './useInView';

/**
 * @internal
 *
 * `enabled` withholds the list params so the three requests do not start. Defaults on.
 */
export const useOrganizationListInView = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { userMemberships, userInvitations, userSuggestions } = useOrganizationList(
    enabled ? organizationListParams : undefined,
  );

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (!enabled || !inView) {
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
