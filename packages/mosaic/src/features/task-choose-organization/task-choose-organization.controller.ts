import { useLayoutEffect } from 'react';

import type {
  OrganizationListController,
  OrganizationListReadyController,
  OrganizationListScreenController,
} from '../organization-list/organization-list.controller';
import {
  useOrganizationListController,
  useOrganizationListScreenController,
} from '../organization-list/organization-list.controller';
import type { TaskChooseOrganizationModel, TaskChooseOrganizationReadyModel } from './task-choose-organization.model';
import type { TaskChooseOrganizationStep } from './task-choose-organization.types';

export type TaskChooseOrganizationController = OrganizationListController<TaskChooseOrganizationReadyModel>;

export type TaskChooseOrganizationReadyController = OrganizationListReadyController<TaskChooseOrganizationReadyModel>;

export function useTaskChooseOrganizationController(
  model: TaskChooseOrganizationModel,
): TaskChooseOrganizationController {
  return useOrganizationListController<TaskChooseOrganizationReadyModel>(
    model.status === 'complete' ? { status: 'hidden' } : model,
  );
}

export interface TaskChooseOrganizationScreenController extends OrganizationListScreenController {
  step: TaskChooseOrganizationStep;
}

export function useTaskChooseOrganizationScreenController(
  controller: TaskChooseOrganizationReadyController,
): TaskChooseOrganizationScreenController {
  const screen = useOrganizationListScreenController(controller);
  const { exclusiveOrganizationId, onSelectOrganization } = controller;

  useLayoutEffect(() => {
    if (exclusiveOrganizationId) {
      onSelectOrganization(exclusiveOrganizationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- An exclusive member is activated once, when the chooser first has their organizations; a failure falls back to the chooser instead of retrying.
  }, []);

  const hasOrganizations =
    controller.memberships.length + controller.invitations.length + controller.suggestions.length > 0;

  return {
    ...screen,
    step: screen.creating ? 'create' : hasOrganizations || controller.createOrganization ? 'choose' : 'unavailable',
  };
}
