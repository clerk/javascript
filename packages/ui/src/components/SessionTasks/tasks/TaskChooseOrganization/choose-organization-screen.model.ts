import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganizationList, useSession, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { populateCacheUpdateItem } from '@/ui/components/OrganizationSwitcher/utils';
import { useSessionTasksContext, useTaskChooseOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import { useOrganizationListInView } from '@/ui/hooks/useOrganizationListInView';

import type {
  ChooseOrganizationScreenData,
  InvitationRowData,
  MembershipRowData,
  OrganizationPreviewData,
  SuggestionRowData,
} from './choose-organization-screen.types';

const toOrganizationPreview = (organization: OrganizationPreviewData): OrganizationPreviewData => ({
  id: organization.id,
  name: organization.name,
  imageUrl: organization.imageUrl,
  hasImage: organization.hasImage,
  slug: organization.slug,
});

export const useChooseOrganizationScreenModel = (): ChooseOrganizationScreenData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const emittedScopeKey = JSON.stringify([actor, sessionId, clientId]);
  const mounted = useRef(true);
  const activating = useRef<object>();
  const closedForTransition = useRef(false);
  const acceptedOrganizations = useRef(new Map<string, OrganizationResource>());
  const current = useRef({ scopeKey: emittedScopeKey, version: 0, clientId });
  const inOwnedTransition =
    !!activating.current &&
    clerk.__internal_setActiveInProgress &&
    clerk.user === undefined &&
    clerk.session === undefined &&
    current.current.clientId === clientId;
  const scopeKey = inOwnedTransition ? current.current.scopeKey : emittedScopeKey;
  const version = current.current.version + (current.current.scopeKey === scopeKey ? 0 : 1);
  if (current.current.scopeKey !== scopeKey) {
    acceptedOrganizations.current.clear();
    activating.current = undefined;
    closedForTransition.current = false;
  }
  current.current = { scopeKey, version, clientId };
  const ownsAccount = () =>
    !!actor &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    current.current.version === version;
  const canRun = () => mounted.current && ownsAccount();
  const queries = useOrganizationListInView({ keepPreviousData: false, canFetch: canRun });
  const latestQueries = useRef<typeof queries>();
  latestQueries.current = queries;
  useEffect(() => {
    const resources = acceptedOrganizations.current;
    mounted.current = true;
    return () => {
      closedForTransition.current =
        !!activating.current &&
        clerk.__internal_setActiveInProgress &&
        clerk.session === undefined &&
        clerk.user === undefined;
      mounted.current = false;
      latestQueries.current = undefined;
      resources.clear();
    };
  }, [clerk]);
  const { ref, userMemberships, userSuggestions, userInvitations } = queries;
  const { isLoaded, setActive } = useOrganizationList();
  const { navigateOnSetActive } = useSessionTasksContext();
  const { redirectUrlComplete } = useTaskChooseOrganizationContext();

  const makeMembershipRow = (organizationData: OrganizationPreviewData, id: string): MembershipRowData => {
    const organizationId = organizationData.id;
    return {
      id,
      organization: toOrganizationPreview(organizationData),
      activate: async () => {
        if (!isLoaded || !setActive || !canRun() || activating.current) {
          return 'inactive';
        }
        const organization =
          latestQueries.current?.userMemberships.data?.find(item => item?.organization.id === organizationId)
            ?.organization ?? acceptedOrganizations.current.get(organizationId);
        if (!organization) {
          return 'inactive';
        }
        const activation = {};
        activating.current = activation;
        closedForTransition.current = false;
        try {
          await setActive({
            organization,
            navigate: async ({ session, decorateUrl }) => {
              const inTransition =
                clerk.__internal_setActiveInProgress && clerk.session === undefined && clerk.user === undefined;
              if (
                activating.current === activation &&
                (mounted.current || closedForTransition.current) &&
                current.current.version === version &&
                clerk.client?.id === clientId &&
                session.id === sessionId &&
                session.user?.id === actor &&
                (ownsAccount() || inTransition)
              ) {
                await navigateOnSetActive?.({ session, redirectUrlComplete, decorateUrl });
              }
            },
          });
          return canRun() ? 'success' : 'inactive';
        } catch (error) {
          if (!canRun()) {
            return 'inactive';
          }
          if (
            isClerkAPIResponseError(error) &&
            ['organization_not_found_or_unauthorized', 'not_a_member_in_organization'].includes(error.errors?.[0]?.code)
          ) {
            return 'unauthorized';
          }
          return { error };
        } finally {
          if (activating.current === activation) {
            activating.current = undefined;
            closedForTransition.current = false;
          }
        }
      },
    };
  };

  const isLoading = !!(userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading);
  const hasNextPage = !!(userMemberships?.hasNextPage || userInvitations?.hasNextPage || userSuggestions?.hasNextPage);

  // Filter out falsy values that can occur when infinite loading resolves pages out of order
  // This happens when concurrent requests resolve in unexpected order, leaving undefined/null items in the data array
  const userInvitationsData = userInvitations.data?.filter(item => !!item);
  const userSuggestionsData = userSuggestions.data?.filter(item => !!item);

  const memberships: MembershipRowData[] =
    (userMemberships.count || 0) > 0
      ? (userMemberships.data?.map(item => makeMembershipRow(toOrganizationPreview(item.organization), item.id)) ?? [])
      : [];
  const toInvitation = (invitationId: string, organizationData: OrganizationPreviewData): InvitationRowData => {
    const organizationId = organizationData.id;
    return {
      id: invitationId,
      organization: toOrganizationPreview(organizationData),
      accept: async () => {
        if (!canRun()) {
          return;
        }
        const resource = latestQueries.current?.userInvitations.data?.find(item => item?.id === invitationId);
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
          if (organization) {
            acceptedOrganizations.current.set(organization.id, organization);
          }
          await latestQueries.current?.userInvitations.setData?.(pages =>
            canRun() ? populateCacheUpdateItem(updatedItem, pages, 'negative') : pages,
          );
          return canRun()
            ? organization
              ? makeMembershipRow(toOrganizationPreview(organization), organization.id)
              : null
            : undefined;
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
    organizationData: OrganizationPreviewData,
    status: SuggestionRowData['status'],
  ): SuggestionRowData => {
    const organizationId = organizationData.id;
    return {
      id: suggestionId,
      organization: toOrganizationPreview(organizationData),
      status,
      accept: async () => {
        if (!canRun()) {
          return;
        }
        const resource = latestQueries.current?.userSuggestions.data?.find(item => item?.id === suggestionId);
        if (!resource || resource.publicOrganizationData.id !== organizationId) {
          return;
        }
        try {
          const updatedItem = await resource.accept();
          if (canRun()) {
            await latestQueries.current?.userSuggestions.setData?.(pages =>
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
  const invitations: InvitationRowData[] = !userMemberships.hasNextPage
    ? (userInvitationsData?.map(item => toInvitation(item.id, item.publicOrganizationData)) ?? [])
    : [];
  const suggestions: SuggestionRowData[] =
    !userMemberships.hasNextPage && !userInvitations.hasNextPage
      ? (userSuggestionsData?.map(item => toSuggestion(item.id, item.publicOrganizationData, item.status)) ?? [])
      : [];

  return {
    paginationRef: ref,
    memberships,
    invitations,
    suggestions,
    isOrganizationListLoaded: isLoaded,
    createOrganizationEnabled: Boolean(user?.createOrganizationEnabled),
    isLoading,
    hasNextPage,
  };
};
