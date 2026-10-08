import { useClerk, useOrganizationList, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import type { CreateOrganizationParams, OrganizationResource } from '@clerk/shared/types';
import { useReducer, useRef } from 'react';

import { useEnvironment } from '@/ui/contexts';
import { useSessionTasksContext, useTaskChooseOrganizationContext } from '@/ui/contexts/components/SessionTasks';

import type { CreateOrganizationScreenData } from './create-organization-screen.types';
import type { OrganizationCreationDefaultsData } from './task-choose-organization.types';

export const useCreateOrganizationScreenModel = (
  onCancel?: () => void,
  defaults?: OrganizationCreationDefaultsData | null,
): CreateOrganizationScreenData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const { navigateOnSetActive } = useSessionTasksContext();
  const { redirectUrlComplete } = useTaskChooseOrganizationContext();
  const { organizationSettings } = useEnvironment();
  const organizationSlugEnabled = !organizationSettings.slug.disabled;
  const target = JSON.stringify([
    redirectUrlComplete,
    defaults?.form?.name,
    defaults?.form?.slug,
    defaults?.form?.logo,
    organizationSlugEnabled,
  ]);
  const emittedScopeKey = JSON.stringify([actor, sessionId, clientId, target]);
  const latest = useRef({ navigateOnSetActive, onCancel });
  latest.current = { navigateOnSetActive, onCancel };
  const mounted = useRef(true);
  const [, notifyCreationChange] = useReducer((revision: number) => revision + 1, 0);
  const activating = useRef<{ closedForTransition: boolean; navigated: boolean }>();
  const logoRequest = useRef<AbortController>();
  const creation = useRef<{ organization: OrganizationResource; logoAttempted: boolean }>();
  const current = useRef({ scopeKey: emittedScopeKey, version: 0, clientId, target, clerk });
  const inOwnedTransition =
    !!activating.current &&
    clerk.__internal_setActiveInProgress &&
    clerk.user === undefined &&
    clerk.session === undefined &&
    current.current.clientId === clientId &&
    current.current.target === target &&
    current.current.clerk === clerk;
  const scopeKey = inOwnedTransition ? current.current.scopeKey : emittedScopeKey;
  const sourceChanged = current.current.scopeKey !== scopeKey || current.current.clerk !== clerk;
  const version = current.current.version + (sourceChanged ? 1 : 0);
  if (sourceChanged) {
    logoRequest.current?.abort();
    logoRequest.current = undefined;
    activating.current = undefined;
    creation.current = undefined;
  }
  current.current = { scopeKey, version, clientId, target, clerk };
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
      if (activating.current) {
        activating.current.closedForTransition =
          clerk.__internal_setActiveInProgress && clerk.session === undefined && clerk.user === undefined;
      }
      mounted.current = false;
      creation.current = undefined;
      logoRequest.current?.abort();
      logoRequest.current = undefined;
    };
  }, [clerk]);
  const { createOrganization, isLoaded, setActive } = useOrganizationList();

  const uploadOrganizationLogo = async (
    organization: OrganizationResource,
    file: File | null | undefined,
    defaultLogoUrl: string | null | undefined,
    isCurrent: () => boolean,
  ) => {
    if (file) {
      await organization.setLogo({ file });
    } else if (defaultLogoUrl) {
      const abort = new AbortController();
      logoRequest.current = abort;
      try {
        const response = await fetch(defaultLogoUrl, { signal: abort.signal });
        if (!isCurrent() || abort.signal.aborted) {
          return;
        }
        const blob = await response.blob();
        if (!isCurrent() || abort.signal.aborted) {
          return;
        }
        const logoFile = new File([blob], 'logo', { type: blob.type });
        await organization.setLogo({ file: logoFile });
      } finally {
        if (logoRequest.current === abort) {
          logoRequest.current = undefined;
        }
      }
    }
  };

  return {
    scopeKey: JSON.stringify([scopeKey, version]),
    canRun,
    isCreated: !!creation.current,
    onCancel: onCancel
      ? () => {
          if (canRun()) {
            latest.current.onCancel?.();
          }
        }
      : undefined,
    isLoaded,
    organizationSlugEnabled,
    create: async (name, slug, file, defaultLogoUrl, canContinue = () => true) => {
      const isCurrent = () => canRun() && canContinue();
      if (!isLoaded || !createOrganization || !setActive || !isCurrent()) {
        return;
      }
      const createOrgParams: CreateOrganizationParams = { name };
      if (organizationSlugEnabled) {
        createOrgParams.slug = slug;
      }

      const activation = { closedForTransition: false, navigated: false };
      try {
        let progress = creation.current;
        if (!progress) {
          const organization = await createOrganization(createOrgParams);
          if (!isCurrent()) {
            return;
          }
          progress = { organization, logoAttempted: false };
          creation.current = progress;
          notifyCreationChange();
        }

        // If setting the logo fails, we still want to set the active organization
        if (!progress.logoAttempted) {
          await uploadOrganizationLogo(progress.organization, file, defaultLogoUrl, isCurrent).catch(() => undefined);
          if (!isCurrent()) {
            return;
          }
          progress.logoAttempted = true;
        }

        if (!isCurrent()) {
          return;
        }
        activating.current = activation;
        await setActive({
          organization: progress.organization,
          navigate: async ({ session, decorateUrl }) => {
            const inTransition =
              clerk.__internal_setActiveInProgress && clerk.session === undefined && clerk.user === undefined;
            if (
              activating.current === activation &&
              !activation.navigated &&
              ((mounted.current && canContinue()) || activation.closedForTransition) &&
              current.current.version === version &&
              clerk.client?.id === clientId &&
              session.id === sessionId &&
              session.user?.id === actor &&
              (ownsAccount() || inTransition)
            ) {
              activation.navigated = true;
              await latest.current.navigateOnSetActive({ session, redirectUrlComplete, decorateUrl });
            }
          },
        });
        if (creation.current === progress && current.current.version === version) {
          creation.current = undefined;
          if (mounted.current) {
            notifyCreationChange();
          }
        }
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
      } finally {
        if (activating.current === activation) {
          activating.current = undefined;
        }
      }
    },
  };
};
