import { buildTaskUrl } from '@clerk/shared/internal/clerk-js/sessionTasks';
import { useClerk, useOrganizationCreationDefaults, useSession, useUser } from '@clerk/shared/react';
import type { DecorateUrl, SessionResource, TaskChooseOrganizationProps } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../hooks/use-mosaic-router';
import { useCreateOrganizationModel } from '../create-organization/create-organization.model';
import type { OrganizationListReadyModel } from '../organization-list/organization-list.controller';
import { unavailableOrganization, useOrganizationListEntries } from '../organization-list/organization-list.model';
import type { TaskChooseOrganizationData } from './task-choose-organization.types';

export type TaskChooseOrganizationModelOptions = Pick<TaskChooseOrganizationProps, 'redirectUrlComplete'>;

export type TaskChooseOrganizationReadyModel = OrganizationListReadyModel &
  TaskChooseOrganizationData & {
    onSignOut: () => Promise<unknown>;
  };

export type TaskChooseOrganizationModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'complete'; onContinue: () => Promise<unknown> }
  | TaskChooseOrganizationReadyModel;

const TASK_KEY = 'choose-organization';
const ABSOLUTE_URL = /^https?:\/\//;

export function useTaskChooseOrganizationModel({
  redirectUrlComplete,
}: TaskChooseOrganizationModelOptions): TaskChooseOrganizationModel {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();
  const createOrganization = useCreateOrganizationModel({ skipInvitationScreen: true });
  const { findOrganization: _findOrganization, ...entries } = useOrganizationListEntries();
  const creationDefaults = useOrganizationCreationDefaults();

  if (!isUserLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user || !session) {
    return { status: 'hidden' };
  }

  const continueAfterTask = async (current: SessionResource, decorateUrl?: DecorateUrl) => {
    const task = current.currentTask;
    if (task) {
      await router.navigate(
        clerk.__internal_getOption('taskUrls')?.[task.key] ?? buildTaskUrl(task, { base: clerk.buildSignInUrl() }),
      );
      return;
    }
    const decorated = decorateUrl ? decorateUrl(redirectUrlComplete) : redirectUrlComplete;
    if (decorated !== redirectUrlComplete && ABSOLUTE_URL.test(decorated)) {
      router.windowNavigate(decorated);
      return;
    }
    await router.navigate(redirectUrlComplete);
  };

  const task = session.currentTask;
  if (!task || (task.key !== TASK_KEY && !clerk.__internal_setActiveInProgress)) {
    return { status: 'complete', onContinue: () => continueAfterTask(session) };
  }

  if (createOrganization.status === 'loading') {
    return { status: 'loading' };
  }

  const advisory = creationDefaults.data?.advisory;
  const otherSessions = (clerk.client?.signedInSessions ?? []).filter(s => s.id !== session.id);

  return {
    status: 'ready',
    applicationName: environment.displayConfig.applicationName,
    renderBranding: environment.displayConfig.branded,
    hidePersonal: true,
    ...entries,
    organizationsLoading: entries.organizationsLoading || creationDefaults.isLoading,
    identifier: user.primaryEmailAddress?.emailAddress ?? user.username ?? undefined,
    exclusiveOrganizationId:
      user.organizationMemberships.find(m => m.organization.exclusiveMembership)?.organization.id ?? null,
    creationDefaults: creationDefaults.data?.form
      ? { name: creationDefaults.data.form.name, slug: creationDefaults.data.form.slug }
      : undefined,
    advisory:
      advisory?.code === 'organization_already_exists'
        ? {
            organizationName: advisory.meta['organization_name'] ?? '',
            organizationDomain: advisory.meta['organization_domain'] ?? '',
          }
        : undefined,
    createOrganization:
      createOrganization.status === 'ready' && user.createOrganizationEnabled
        ? { ...createOrganization, onComplete: () => continueAfterTask(clerk.session ?? session) }
        : undefined,
    onSelectOrganization: async organizationId => {
      try {
        await clerk.setActive({
          organization: organizationId,
          navigate: ({ session: next, decorateUrl }) => continueAfterTask(next, decorateUrl),
        });
      } catch (error) {
        throw unavailableOrganization(error, user.createOrganizationEnabled);
      }
    },
    onSignOut: () =>
      otherSessions.length > 0
        ? clerk.signOut({ sessionId: session.id, redirectUrl: clerk.buildAfterMultiSessionSingleSignOutUrl() })
        : clerk.signOut({ redirectUrl: clerk.buildAfterSignOutUrl() }),
  };
}
