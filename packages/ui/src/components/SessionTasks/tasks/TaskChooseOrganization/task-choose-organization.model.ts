import {
  useClerk,
  useOrganizationCreationDefaults,
  useOrganizationList,
  useSession,
  useUser,
} from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import { useSignOutContext } from '@/ui/contexts';
import { useSessionTasksContext, useTaskChooseOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import { useOrganizationListInView } from '@/ui/hooks/useOrganizationListInView';

import type { OrganizationCreationDefaultsData, TaskChooseOrganizationData } from './task-choose-organization.types';

export const useTaskChooseOrganizationModel = (): TaskChooseOrganizationData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const organizationCreationDefaults = useOrganizationCreationDefaults();
  const { isLoaded: isOrganizationListLoaded, setActive } = useOrganizationList();
  const { navigateOnSetActive } = useSessionTasksContext();
  const { redirectUrlComplete } = useTaskChooseOrganizationContext();
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();

  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const emittedScopeKey = JSON.stringify([actor, sessionId, clientId]);
  const mounted = useRef(true);
  const activating = useRef<object>();
  const closedForTransition = useRef(false);
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
  useEffect(() => {
    mounted.current = true;
    return () => {
      closedForTransition.current =
        !!activating.current &&
        clerk.__internal_setActiveInProgress &&
        clerk.session === undefined &&
        clerk.user === undefined;
      mounted.current = false;
    };
  }, [clerk]);
  const exclusiveOrganizationId = user?.organizationMemberships?.find(
    membership => membership.organization.exclusiveMembership === true,
  )?.organization.id;
  const isLoading = !!(
    userMemberships?.isLoading ||
    userInvitations?.isLoading ||
    userSuggestions?.isLoading ||
    organizationCreationDefaults?.isLoading
  );
  const hasExistingResources = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);
  const isOrganizationCreationDisabled =
    !isLoading &&
    !user?.createOrganizationEnabled &&
    user?.organizationMemberships?.length === 0 &&
    !hasExistingResources;
  const defaults = organizationCreationDefaults.data;
  const organizationCreationDefaultsData: OrganizationCreationDefaultsData | null | undefined = defaults
    ? {
        advisory: defaults.advisory ? { code: defaults.advisory.code, meta: { ...defaults.advisory.meta } } : null,
        form: defaults.form
          ? { name: defaults.form.name, slug: defaults.form.slug, logo: defaults.form.logo }
          : undefined,
      }
    : defaults;

  return {
    scopeKey,
    exclusiveOrganizationId,
    isOrganizationListLoaded,
    isLoading,
    hasExistingResources,
    isOrganizationCreationDisabled,
    organizationCreationDefaults: organizationCreationDefaultsData,
    identifier: user?.primaryEmailAddress?.emailAddress ?? user?.username,
    activateExclusiveOrganization: async () => {
      if (!isOrganizationListLoaded || !setActive || !canRun() || activating.current) {
        return;
      }
      const organization = clerk.user?.organizationMemberships?.find(
        membership =>
          membership.organization.id === exclusiveOrganizationId && membership.organization.exclusiveMembership,
      )?.organization;
      if (!organization) {
        return;
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
      } catch (error) {
        if (canRun()) {
          throw error;
        }
      } finally {
        if (activating.current === activation) {
          activating.current = undefined;
          closedForTransition.current = false;
        }
      }
    },
    signOut: async () => {
      if (!canRun()) {
        return;
      }
      const hasOtherSessions = clerk.client.signedInSessions.some(item => item.user?.id !== actor);
      await (hasOtherSessions
        ? clerk.signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId })
        : clerk.signOut(navigateAfterSignOut));
    },
  };
};
