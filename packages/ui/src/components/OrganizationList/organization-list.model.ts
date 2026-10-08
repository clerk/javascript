import { useClerk, useOrganizationList, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';
import { useRef } from 'react';

import { useOrganizationListInView } from '@/ui/hooks/useOrganizationListInView';

import { useEnvironment, useOrganizationListContext } from '../../contexts';
import { useLocalizations } from '../../customizables';
import { populateCacheUpdateItem } from '../OrganizationSwitcher/utils';
import { organizationListMessages } from './organization-list.messages';
import type {
  OrganizationListInvitation,
  OrganizationListItemsData,
  OrganizationListMembership,
  OrganizationListOrganization,
  OrganizationListPageData,
  OrganizationListSuggestion,
} from './organization-list.types';

const toPreview = (organization: OrganizationListOrganization): OrganizationListOrganization => ({
  id: organization.id,
  name: organization.name,
  slug: organization.slug,
  imageUrl: organization.imageUrl,
  hasImage: organization.hasImage,
});

export const useOrganizationListPageModel = (): OrganizationListPageData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { userMemberships, userSuggestions, userInvitations } = useOrganizationListInView({ keepPreviousData: false });
  const { hidePersonal, afterSelectOrganizationUrl, afterSelectPersonalUrl } = useOrganizationListContext();
  const isLoading = userMemberships.isLoading || userInvitations.isLoading || userSuggestions.isLoading;
  const hasAnyData = !!(userMemberships.count || userInvitations.count || userSuggestions.count);
  return {
    scopeKey: JSON.stringify([
      user?.id,
      session?.id,
      clerk.client?.id,
      hidePersonal,
      typeof afterSelectOrganizationUrl === 'function' ? 'callback' : afterSelectOrganizationUrl,
      typeof afterSelectPersonalUrl === 'function' ? 'callback' : afterSelectPersonalUrl,
    ]),
    isLoading,
    showListInitially: !(hidePersonal && !hasAnyData),
  };
};

export const useOrganizationListItemsModel = (): OrganizationListItemsData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const environment = useEnvironment();
  const {
    hidePersonal,
    afterSelectOrganizationUrl,
    afterSelectPersonalUrl,
    navigateAfterSelectOrganization,
    navigateAfterSelectPersonal,
  } = useOrganizationListContext();
  const { t } = useLocalizations();
  const { isLoaded, setActive } = useOrganizationList();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const scopeKey = JSON.stringify([
    actor,
    sessionId,
    clientId,
    hidePersonal,
    typeof afterSelectOrganizationUrl === 'function' ? 'callback' : afterSelectOrganizationUrl,
    typeof afterSelectPersonalUrl === 'function' ? 'callback' : afterSelectPersonalUrl,
  ]);
  const latest = useRef({ navigateAfterSelectOrganization, navigateAfterSelectPersonal, t });
  latest.current = { navigateAfterSelectOrganization, navigateAfterSelectPersonal, t };
  const mounted = useRef(true);
  const current = useRef({ scopeKey, version: 0, user, clerk });
  const acceptedOrganizations = useRef(new Map<string, OrganizationResource>());
  const sourceChanged = current.current.scopeKey !== scopeKey || current.current.clerk !== clerk;
  const version = current.current.version + (sourceChanged ? 1 : 0);
  if (sourceChanged) {
    acceptedOrganizations.current.clear();
  }
  current.current = { scopeKey, version, user, clerk };
  const ownsAccount = () =>
    !!actor &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    current.current.version === version;
  const canRun = () => mounted.current && ownsAccount();
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      acceptedOrganizations.current.clear();
    };
  }, []);
  const queries = useOrganizationListInView({ keepPreviousData: false, canFetch: canRun });
  const latestQueries = useRef(queries);
  latestQueries.current = queries;
  const { ref, userMemberships, userInvitations, userSuggestions } = queries;
  const requestKey = JSON.stringify([scopeKey, version]);
  for (const membership of userMemberships.data ?? []) {
    acceptedOrganizations.current.delete(membership.organization.id);
  }

  const toMembership = (organization: OrganizationResource): OrganizationListMembership => {
    const organizationId = organization.id;
    return {
      requestKey: JSON.stringify([requestKey, organizationId]),
      canRun,
      isLoaded,
      organizationPreview: toPreview(organization),
      selectOrganization: async (canContinue = () => true) => {
        const isCurrent = () => canRun() && canContinue();
        if (!isCurrent() || !setActive) {
          return;
        }
        const resource =
          latestQueries.current.userMemberships.data?.find(item => item.organization.id === organizationId)
            ?.organization ?? acceptedOrganizations.current.get(organizationId);
        if (!resource) {
          return;
        }
        try {
          await setActive({ organization: resource });
          if (isCurrent()) {
            await latest.current.navigateAfterSelectOrganization(resource);
          }
        } catch (error) {
          if (isCurrent()) {
            throw error;
          }
        }
      },
      getUnauthorizedError: () =>
        latest.current.t(
          current.current.user?.createOrganizationEnabled
            ? organizationListMessages.errors.unauthorized
            : organizationListMessages.errors.unauthorizedWithoutCreation,
        ),
    };
  };
  const toInvitation = (
    invitationId: string,
    organizationData: OrganizationListOrganization,
  ): OrganizationListInvitation => {
    const organizationId = organizationData.id;
    return {
      organizationData: toPreview(organizationData),
      accept: async () => {
        if (!canRun()) {
          return;
        }
        const resource = latestQueries.current.userInvitations.data?.find(item => item.id === invitationId);
        if (!resource || resource.publicOrganizationData.id !== organizationId) {
          return;
        }
        try {
          const updatedItem = await resource.accept();
          if (!canRun()) {
            return;
          }
          const organization = await clerk.getOrganization(organizationId);
          if (!canRun()) {
            return;
          }
          acceptedOrganizations.current.set(organization.id, organization);
          await latestQueries.current.userInvitations.setData?.(pages =>
            canRun() ? populateCacheUpdateItem(updatedItem, pages, 'negative') : pages,
          );
          return canRun() ? toMembership(organization) : undefined;
        } catch (error) {
          if (canRun()) {
            throw error;
          }
        }
      },
    };
  };
  const toSuggestion = (
    suggestionId: string,
    organizationData: OrganizationListOrganization,
    isAccepted: boolean,
  ): OrganizationListSuggestion => {
    const organizationId = organizationData.id;
    return {
      organizationData: toPreview(organizationData),
      isAccepted,
      accept: async () => {
        if (!canRun()) {
          return;
        }
        const resource = latestQueries.current.userSuggestions.data?.find(item => item.id === suggestionId);
        if (!resource || resource.publicOrganizationData.id !== organizationId) {
          return;
        }
        try {
          const updatedItem = await resource.accept();
          if (canRun()) {
            await latestQueries.current.userSuggestions.setData?.(pages =>
              canRun() ? populateCacheUpdateItem(updatedItem, pages) : pages,
            );
          }
        } catch (error) {
          if (canRun()) {
            throw error;
          }
        }
      },
    };
  };
  return {
    scopeKey: requestKey,
    applicationName: environment.displayConfig.applicationName,
    hidePersonal,
    paginationRef: ref,
    personalAccount: {
      requestKey: JSON.stringify([requestKey, 'personal']),
      canRun,
      isVisible: !!user && !hidePersonal,
      user: user ? { firstName: user.firstName, lastName: user.lastName, imageUrl: user.imageUrl } : undefined,
      selectPersonal:
        user && isLoaded
          ? async (canContinue = () => true) => {
              const isCurrent = () => canRun() && canContinue();
              if (!isCurrent() || !setActive || !current.current.user) {
                return;
              }
              try {
                await setActive({ organization: null });
                if (isCurrent() && current.current.user) {
                  await latest.current.navigateAfterSelectPersonal(current.current.user);
                }
              } catch (error) {
                if (isCurrent()) {
                  throw error;
                }
              }
            }
          : undefined,
    },
    memberships: userMemberships.count
      ? (userMemberships.data ?? []).map(item => ({ id: item.id, model: toMembership(item.organization) }))
      : [],
    invitations: userMemberships.hasNextPage
      ? []
      : (userInvitations.data ?? [])
          .filter(Boolean)
          .map(item => ({ id: item.id, model: toInvitation(item.id, item.publicOrganizationData) })),
    suggestions:
      userMemberships.hasNextPage || userInvitations.hasNextPage
        ? []
        : (userSuggestions.data ?? []).filter(Boolean).map(item => ({
            id: item.id,
            model: toSuggestion(item.id, item.publicOrganizationData, item.status === 'accepted'),
          })),
    isLoading: userMemberships.isLoading || userInvitations.isLoading || userSuggestions.isLoading,
    hasNextPage: userMemberships.hasNextPage || userInvitations.hasNextPage || userSuggestions.hasNextPage,
  };
};
