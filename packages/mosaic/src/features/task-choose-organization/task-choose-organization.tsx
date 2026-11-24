'use client';

import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';

import { Card } from '../../components/card';
import { fill, useMessages } from '../../localization';
import { useCreateOrganizationFlow } from '../create-organization/create-organization';
import type { CreateOrganizationReadyModel } from '../create-organization/create-organization.controller';
import { CreateOrganizationSteps } from '../create-organization/create-organization.view';
import type {
  TaskChooseOrganizationController,
  TaskChooseOrganizationReadyController,
} from './task-choose-organization.controller';
import {
  useTaskChooseOrganizationController,
  useTaskChooseOrganizationScreenController,
} from './task-choose-organization.controller';
import type { TaskChooseOrganizationModelOptions } from './task-choose-organization.model';
import { useTaskChooseOrganizationModel } from './task-choose-organization.model';
import { TaskChooseOrganizationSkeletonSteps } from './task-choose-organization.skeleton';
import type { TaskChooseOrganizationData } from './task-choose-organization.types';
import { TaskChooseOrganizationSteps } from './task-choose-organization.view';

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
  const task = useTaskChooseOrganizationFlow(options);

  if (task.status === 'loading') {
    return <>{fallback}</>;
  }

  if (task.status === 'ready') {
    return (
      <Card.Root renderBranding={task.renderBranding}>
        <TaskChooseOrganizationContent controller={task} />
      </Card.Root>
    );
  }

  return <TaskChooseOrganizationContent controller={task} />;
}

export type TaskChooseOrganizationFlowController =
  | TaskChooseOrganizationController
  | { status: 'complete'; onContinue: () => Promise<unknown> };

export function useTaskChooseOrganizationFlow(
  options: TaskChooseOrganizationModelOptions & { enabled?: boolean },
): TaskChooseOrganizationFlowController {
  const model = useTaskChooseOrganizationModel(options);
  const controller = useTaskChooseOrganizationController(model);

  if (controller.status !== 'ready' && model.status === 'complete') {
    return { status: 'complete', onContinue: model.onContinue };
  }
  return controller;
}

export function isTaskChooseOrganizationReady(controller: TaskChooseOrganizationFlowController): boolean {
  return controller.status !== 'loading' && !(controller.status === 'ready' && controller.organizationsLoading);
}

export function TaskChooseOrganizationContent({
  controller,
}: {
  controller: TaskChooseOrganizationFlowController;
}): ReactElement | null {
  if (controller.status === 'ready') {
    if (controller.organizationsLoading) {
      return (
        <TaskChooseOrganizationSkeletonSteps
          canCreate={Boolean(controller.createOrganization)}
          identifier={controller.identifier}
        />
      );
    }
    return <ConnectedTaskChooseOrganizationSteps controller={controller} />;
  }
  if (controller.status === 'complete') {
    return <ContinueAfterTask onContinue={controller.onContinue} />;
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

function ConnectedTaskChooseOrganizationSteps({ controller }: { controller: TaskChooseOrganizationReadyController }) {
  const screen = useTaskChooseOrganizationScreenController(controller);
  const { createOrganization } = controller;

  return (
    <TaskChooseOrganizationSteps
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
