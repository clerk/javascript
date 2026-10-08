import {
  useClerk,
  useOrganization,
  useOrganizationList,
  usePortalRoot,
  useSession,
  useUser,
} from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import { useAcceptedInvitations, useEnvironment, useOrganizationSwitcherContext } from '../../contexts';
import type { OrganizationSwitcherPopoverModel } from './organization-switcher-popover.types';
import { organizationListParams } from './utils';

export const useOrganizationSwitcherPopoverModel = (): OrganizationSwitcherPopoverModel => {
  const clerk = useClerk();
  const { openOrganizationProfile, openCreateOrganization } = clerk;
  const { session } = useSession();
  const { acceptedInvitations } = useAcceptedInvitations();
  const getContainer = usePortalRoot();
  const { organization: currentOrg } = useOrganization();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { ...organizationListParams.userMemberships, keepPreviousData: false },
  });
  const {
    __experimental_asStandalone,
    hidePersonal,
    createOrganizationMode,
    organizationProfileMode,
    afterLeaveOrganizationUrl,
    afterCreateOrganizationUrl,
    navigateCreateOrganization,
    navigateOrganizationProfile,
    afterSelectOrganizationUrl,
    afterSelectPersonalUrl,
    organizationProfileProps,
    skipInvitationScreen,
  } = useOrganizationSwitcherContext();
  const { user } = useUser();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const scopeKey = JSON.stringify([actor, sessionId, clientId]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const current = useRef({ scopeKey, version: 0 });
  const items = useRef<{
    memberships: typeof userMemberships.data;
    acceptedInvitations: typeof acceptedInvitations;
  }>();
  items.current = { memberships: userMemberships.data, acceptedInvitations };
  useEffect(() => {
    items.current = { memberships: userMemberships.data, acceptedInvitations };
    return () => {
      items.current = undefined;
    };
  }, [userMemberships.data, acceptedInvitations]);
  const scopeVersion = current.current.version + (current.current.scopeKey === scopeKey ? 0 : 1);
  current.current = { scopeKey, version: scopeVersion };
  const canRun = () =>
    mounted.current &&
    !!actor &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    current.current.version === scopeVersion &&
    current.current.scopeKey === scopeKey;

  return {
    scopeKey,
    canRun,
    isReady: !!user && isLoaded,
    isStandalone: !!__experimental_asStandalone,
    hidePersonal: !!hidePersonal,
    currentOrgPreview: currentOrg
      ? {
          id: currentOrg.id,
          name: currentOrg.name,
          slug: currentOrg.slug,
          imageUrl: currentOrg.imageUrl,
          hasImage: currentOrg.hasImage,
        }
      : undefined,
    userRolePreview: user
      ? {
          organizationMemberships: user.organizationMemberships.map(membership => ({
            organization: { id: membership.organization.id },
            role: membership.role,
            roleName: membership.roleName,
          })),
        }
      : undefined,
    personalPreview: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        }
      : undefined,
    selectOrganization: (organizationId: string) => {
      if (!canRun()) {
        return Promise.resolve(false);
      }
      const organization =
        items.current?.memberships?.find(item => item.organization.id === organizationId)?.organization ??
        items.current?.acceptedInvitations.find(item => item.organization.id === organizationId)?.organization;
      return organization && setActive
        ? setActive({ organization, redirectUrl: afterSelectOrganizationUrl(organization) }).then(() => canRun())
        : Promise.resolve(false);
    },
    selectPersonal: () => {
      if (!setActive || !canRun()) {
        return Promise.resolve(false);
      }
      const currentUser = clerk.user;
      if (!currentUser) {
        return Promise.resolve(false);
      }
      return setActive({ organization: null, redirectUrl: afterSelectPersonalUrl(currentUser) }).then(() => canRun());
    },
    createOrganization: () => {
      if (!canRun()) {
        return;
      }
      return createOrganizationMode === 'navigation'
        ? navigateCreateOrganization()
        : openCreateOrganization({ afterCreateOrganizationUrl, skipInvitationScreen, getContainer });
    },
    manageOrganization: () => {
      if (!canRun()) {
        return;
      }
      return organizationProfileMode === 'navigation'
        ? navigateOrganizationProfile()
        : openOrganizationProfile({ ...organizationProfileProps, afterLeaveOrganizationUrl, getContainer });
    },
  };
};

export const useOrganizationSwitcherManageNotificationModel = (): { notificationCount: number } => {
  const { organizationSettings } = useEnvironment();
  const isDomainsEnabled = organizationSettings?.domains?.enabled;
  const { membershipRequests } = useOrganization({
    membershipRequests: isDomainsEnabled || undefined,
  });

  return { notificationCount: membershipRequests?.count || 0 };
};
