import { useOrganization } from '@clerk/shared/react';

import { useProtect } from '@/common';
import { useSubscription } from '@/contexts';
import { isPlanWithPerSeatCosts } from '@/ui/utils/billingPlanSeats';

export const useMembersActionsModel = () => {
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });
  const { organization } = useOrganization();
  const { subscriptionItems } = useSubscription();

  const isBelowLimit = (() => {
    if (!organization) {
      return false;
    }

    if (subscriptionItems.length > 0 && isPlanWithPerSeatCosts(subscriptionItems[0].plan)) {
      return true;
    }

    // A value of 0 means unlimited memberships, thus the organization is always below the limit
    if (organization.maxAllowedMemberships === 0) {
      return true;
    }

    return organization.membersCount + organization.pendingInvitationsCount < organization.maxAllowedMemberships;
  })();

  return { canManageMemberships, isBelowLimit };
};
