import { useOrganizationList } from '@clerk/shared/react';

import { useInView } from './useInView';

const organizationListParams = {
  userMemberships: {
    infinite: true,
  },
  userInvitations: {
    infinite: true,
  },
  userSuggestions: {
    infinite: true,
    status: ['pending', 'accepted'],
  },
} satisfies Parameters<typeof useOrganizationList>[0];

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
