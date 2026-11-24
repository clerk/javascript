'use client';

import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';

import { fill, useMessages } from '../../localization';
import { useCreateOrganizationFlow } from '../create-organization/create-organization';
import type { CreateOrganizationReadyModel } from '../create-organization/create-organization.controller';
import { CreateOrganizationSteps } from '../create-organization/create-organization.view';
import type { TaskChooseOrganizationReadyController } from './task-choose-organization.controller';
import {
  useTaskChooseOrganizationController,
  useTaskChooseOrganizationScreenController,
} from './task-choose-organization.controller';
import type { TaskChooseOrganizationModel, TaskChooseOrganizationModelOptions } from './task-choose-organization.model';
import { useTaskChooseOrganizationModel } from './task-choose-organization.model';
import {
  TaskChooseOrganizationSkeleton,
  TaskChooseOrganizationSkeletonSteps,
} from './task-choose-organization.skeleton';
import type { TaskChooseOrganizationData } from './task-choose-organization.types';
import { TaskChooseOrganizationSteps, TaskChooseOrganizationView } from './task-choose-organization.view';

/** Everything `<TaskChooseOrganization />` takes: where to go once the session has no tasks left. */
export type TaskChooseOrganizationProps = TaskChooseOrganizationModelOptions & {
  /**
   * Rendered while Clerk loads. Nothing renders once Clerk answers that nobody is signed in.
   */
  fallback?: ReactNode;
};

/**
 * The `choose-organization` session task: a card where a signed-in user whose session is pending
 * picks the organization to continue with. It lists the organizations they belong to, and the
 * ones they are invited to or may request to join. Where the user may create organizations, a
 * button opens the create-organization flow in place of the list. Once an organization is active,
 * the user goes on to their next task, or to `redirectUrlComplete` when none is left. A user whose
 * session has no `choose-organization` task is sent on straight away.
 *
 * @example
 * ```tsx
 * <TaskChooseOrganization redirectUrlComplete='/dashboard' />
 * ```
 */
export function TaskChooseOrganization({ fallback, ...options }: TaskChooseOrganizationProps): ReactElement | null {
  const model = useTaskChooseOrganizationModel(options);
  return (
    <TaskChooseOrganizationFlow
      model={model}
      fallback={fallback}
    />
  );
}

export function TaskChooseOrganizationContent({ model }: { model: TaskChooseOrganizationModel }): ReactElement | null {
  return (
    <TaskChooseOrganizationFlow
      model={model}
      embedded
    />
  );
}

export function isTaskChooseOrganizationReady(model: TaskChooseOrganizationModel): boolean {
  return model.status !== 'loading' && !(model.status === 'ready' && model.organizationsLoading);
}

function TaskChooseOrganizationFlow({
  model,
  fallback,
  embedded = false,
}: {
  model: TaskChooseOrganizationModel;
  fallback?: ReactNode;
  embedded?: boolean;
}): ReactElement | null {
  const controller = useTaskChooseOrganizationController(model);

  if (controller.status === 'ready') {
    if (controller.organizationsLoading) {
      const canCreate = Boolean(controller.createOrganization);
      return embedded ? (
        <TaskChooseOrganizationSkeletonSteps
          canCreate={canCreate}
          identifier={controller.identifier}
        />
      ) : (
        <TaskChooseOrganizationSkeleton
          canCreate={canCreate}
          identifier={controller.identifier}
          renderBranding={controller.renderBranding}
        />
      );
    }
    return (
      <ConnectedTaskChooseOrganization
        controller={controller}
        embedded={embedded}
      />
    );
  }

  if (model.status === 'complete') {
    return <ContinueAfterTask onContinue={model.onContinue} />;
  }

  if (controller.status === 'loading') {
    return <>{fallback}</>;
  }

  return null;
}

function ContinueAfterTask({ onContinue }: { onContinue: () => Promise<unknown> }): null {
  useEffect(() => {
    void onContinue();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- The session leaves this task once; a later render must not navigate again.
  }, []);

  return null;
}

function ConnectedTaskChooseOrganization({
  controller,
  embedded,
}: {
  controller: TaskChooseOrganizationReadyController;
  embedded: boolean;
}) {
  const screen = useTaskChooseOrganizationScreenController(controller);
  const { createOrganization } = controller;
  const View = embedded ? TaskChooseOrganizationSteps : TaskChooseOrganizationView;

  return (
    <View
      {...controller}
      step={screen.step}
      createSteps={
        createOrganization ? (
          <TaskChooseOrganizationCreateSteps
            model={createOrganization}
            creationDefaults={controller.creationDefaults}
            advisory={controller.advisory}
            onCancel={screen.onCancelCreate}
          />
        ) : undefined
      }
      onCreateOrganization={screen.onCreateOrganization}
    />
  );
}

function TaskChooseOrganizationCreateSteps({
  model,
  creationDefaults,
  advisory,
  onCancel,
}: Pick<TaskChooseOrganizationData, 'creationDefaults' | 'advisory'> & {
  model: CreateOrganizationReadyModel;
  onCancel?: () => void;
}) {
  const m = useMessages('taskChooseOrganization');
  const steps = useCreateOrganizationFlow(model, { initialValues: creationDefaults });

  return (
    <CreateOrganizationSteps
      {...steps}
      notice={advisory ? fill(m.organizationAlreadyExists, { ...advisory }) : undefined}
      onCancel={onCancel}
    />
  );
}
