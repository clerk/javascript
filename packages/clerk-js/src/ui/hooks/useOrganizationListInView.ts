import { useOrganizationList } from '@clerk/shared/react/index';

import { organizationListParams } from '../components/OrganizationSwitcher/utils';
import { useInView } from './useInView';

/**
 * @internal
 */
export const useOrganizationListInView = () => {
  const { userMemberships, userInvitations, userSuggestions } = useOrganizationList(organizationListParams);

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (!inView) {
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
