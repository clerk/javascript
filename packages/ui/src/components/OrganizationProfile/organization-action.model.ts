import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';

import { useOrganizationProfileContext } from '@/contexts';

import { organizationListParams } from '../OrganizationSwitcher/utils';

export const useOrganizationActionModel = (kind: 'leave' | 'delete') => {
  const { organization, membership } = useOrganization();
  const { user } = useUser();
  const { navigateAfterLeaveOrganization } = useOrganizationProfileContext();
  const { userMemberships, userInvitations } = useOrganizationList({
    userMemberships: organizationListParams.userMemberships,
    userInvitations: organizationListParams.userInvitations,
  });

  return {
    available: Boolean(organization && (kind === 'leave' ? user : membership)),
    organizationName: organization?.name ?? '',
    perform: () => {
      if (!organization) {
        return;
      }

      return kind === 'leave' ? user?.leaveOrganization(organization.id) : organization.destroy();
    },
    afterSuccess: () => {
      void userMemberships.revalidate?.();
      void userInvitations.revalidate?.();
      void navigateAfterLeaveOrganization();
    },
  };
};
