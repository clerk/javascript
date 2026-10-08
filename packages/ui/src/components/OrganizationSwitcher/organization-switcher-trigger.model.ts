import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';

import { useProtect } from '../../common';
import { useEnvironment, useOrganizationSwitcherContext } from '../../contexts';
import { useLocalizations } from '../../customizables';
import { organizationSwitcherMessages } from './organization-switcher.messages';
import type { OrganizationSwitcherTriggerData } from './organization-switcher.types';
import { organizationListParams } from './utils';

export const useOrganizationSwitcherTriggerModel = (isOpen: boolean): OrganizationSwitcherTriggerData => {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { hidePersonal } = useOrganizationSwitcherContext();
  const { t } = useLocalizations();

  return {
    isVisible: !!user,
    hidePersonal: !!hidePersonal,
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          imageUrl: organization.imageUrl,
          hasImage: organization.hasImage,
        }
      : undefined,
    user: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        }
      : undefined,
    ariaLabel: t(isOpen ? organizationSwitcherMessages.trigger.close : organizationSwitcherMessages.trigger.open),
  };
};

export const useOrganizationSwitcherNotificationModel = (): { notificationCount: number } => {
  const { userInvitations, userSuggestions } = useOrganizationList({
    userInvitations: { ...organizationListParams.userInvitations, keepPreviousData: false },
    userSuggestions: { ...organizationListParams.userSuggestions, keepPreviousData: false },
  });
  const { organizationSettings } = useEnvironment();
  const canAcceptRequests = useProtect({ permission: 'org:sys_memberships:manage' });
  const isDomainsEnabled = organizationSettings?.domains?.enabled;
  const { membershipRequests } = useOrganization({
    membershipRequests: (isDomainsEnabled && canAcceptRequests) || undefined,
  });

  return {
    notificationCount: (userInvitations.count || 0) + (userSuggestions.count || 0) + (membershipRequests?.count || 0),
  };
};
