import {
  useClerk,
  useOrganization,
  useOrganizationList,
  useSafeLayoutEffect,
  useSession,
  useUser,
} from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import { useAcceptedInvitations } from '../../contexts';
import { useInView } from '../../hooks';
import type {
  OrganizationSwitcherInvitationOrganization,
  OrganizationSwitcherInvitationsData,
} from './organization-switcher-invitations.types';
import { organizationListParams, populateCacheUpdateItem } from './utils';

export const useOrganizationSwitcherInvitationsModel = (
  onOrganizationClick: (organizationId: string) => unknown,
): OrganizationSwitcherInvitationsData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const { acceptedInvitations, setAcceptedInvitations, canUpdate } = useAcceptedInvitations();
  const { userInvitations, userSuggestions } = useOrganizationList({
    userInvitations: { ...organizationListParams.userInvitations, keepPreviousData: false },
    userSuggestions: { ...organizationListParams.userSuggestions, keepPreviousData: false },
  });
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const scopeKey = JSON.stringify([actor, sessionId, clientId]);
  const mounted = useRef(true);
  const current = useRef({ scopeKey, version: 0, clerk });
  const latestClick = useRef(onOrganizationClick);
  latestClick.current = onOrganizationClick;
  const queries = useRef<{ userInvitations: typeof userInvitations; userSuggestions: typeof userSuggestions }>();
  queries.current = { userInvitations, userSuggestions };
  const sourceChanged = current.current.scopeKey !== scopeKey || current.current.clerk !== clerk;
  const version = current.current.version + (sourceChanged ? 1 : 0);
  current.current = { scopeKey, version, clerk };
  const ownsAccount = () =>
    (canUpdate ? canUpdate() : mounted.current) &&
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
    };
  }, []);
  useEffect(() => {
    queries.current = { userInvitations, userSuggestions };
    return () => {
      queries.current = undefined;
    };
  }, [userInvitations, userSuggestions]);

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (!inView || !canRun()) {
        return;
      }
      const active = queries.current;
      if (!active) {
        return;
      }
      const { userInvitations, userSuggestions } = active;
      if (userInvitations.hasNextPage && !userInvitations.isFetching) {
        void userInvitations.fetchNext?.();
      } else if (!userInvitations.hasNextPage && userSuggestions.hasNextPage && !userSuggestions.isFetching) {
        void userSuggestions.fetchNext?.();
      }
    },
  });
  const toPreview = (data: OrganizationSwitcherInvitationOrganization): OrganizationSwitcherInvitationOrganization => ({
    id: data.id,
    name: data.name,
    slug: data.slug,
    imageUrl: data.imageUrl,
    hasImage: data.hasImage,
  });
  const invitations = (userInvitations.data || []).filter(Boolean).map(invitation => {
    const invitationId = invitation.id;
    const organizationId = invitation.publicOrganizationData.id;
    const acceptedId = acceptedInvitations.find(item => item.invitationId === invitationId)?.organization.id;
    return {
      id: invitationId,
      organizationData: toPreview(invitation.publicOrganizationData),
      isAccepted: invitation.status === 'accepted',
      activeOrganizationId: organization?.id,
      acceptedOrganization: acceptedId
        ? { id: acceptedId, onClick: () => canRun() && latestClick.current(acceptedId) }
        : undefined,
      accept: async () => {
        if (!canRun()) {
          return;
        }
        const resource = queries.current?.userInvitations.data?.find(item => item.id === invitationId);
        if (!resource || resource.publicOrganizationData.id !== organizationId) {
          return;
        }
        try {
          const setData = queries.current?.userInvitations.setData;
          const updatedItem = await resource.accept();
          if (!ownsAccount()) {
            return;
          }
          const acceptedOrganization = await clerk.getOrganization(organizationId);
          if (!ownsAccount()) {
            return;
          }
          await setData?.(pages => (ownsAccount() ? populateCacheUpdateItem(updatedItem, pages, 'negative') : pages));
          if (!ownsAccount()) {
            return;
          }
          setAcceptedInvitations(old =>
            ownsAccount()
              ? [
                  ...old.filter(item => item.invitationId !== invitationId),
                  { organization: acceptedOrganization, invitationId },
                ]
              : old,
          );
          const acceptedOrganizationId = acceptedOrganization.id;
          return { id: acceptedOrganizationId, onClick: () => canRun() && latestClick.current(acceptedOrganizationId) };
        } catch (error) {
          if (ownsAccount()) {
            throw error;
          }
        }
      },
    };
  });
  const suggestions = (userSuggestions.data || []).filter(Boolean).map(suggestion => {
    const suggestionId = suggestion.id;
    const organizationId = suggestion.publicOrganizationData.id;
    return {
      id: suggestionId,
      organizationData: toPreview(suggestion.publicOrganizationData),
      isAccepted: suggestion.status === 'accepted',
      accept: async () => {
        if (!canRun()) {
          return;
        }
        const resource = queries.current?.userSuggestions.data?.find(item => item.id === suggestionId);
        if (!resource || resource.publicOrganizationData.id !== organizationId) {
          return;
        }
        try {
          const setData = queries.current?.userSuggestions.setData;
          const updatedItem = await resource.accept();
          if (ownsAccount()) {
            await setData?.(pages => (ownsAccount() ? populateCacheUpdateItem(updatedItem, pages) : pages));
          }
        } catch (error) {
          if (ownsAccount()) {
            throw error;
          }
        }
      },
    };
  });
  const isLoading = !!(userInvitations.isLoading || userSuggestions.isLoading);
  return {
    scopeKey: JSON.stringify([scopeKey, version]),
    invitations,
    suggestions,
    isVisible: invitations.length > 0 || suggestions.length > 0 || isLoading,
    invitationHasNextPage: !!userInvitations.hasNextPage,
    hasNextPage: !!(userInvitations.hasNextPage || userSuggestions.hasNextPage),
    isLoading,
    paginationRef: ref,
  };
};
