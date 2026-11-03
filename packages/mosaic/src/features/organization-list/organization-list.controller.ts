import { useState } from 'react';

import { useSpinDelay } from '../../hooks/use-spin-delay';
import type { ErrorDescription } from '../../localization';
import { useErrorText, useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
import { toLocalizableError } from '../../utils/errors';
import type { OrganizationListModel } from './organization-list.model';
import type { OrganizationListData } from './organization-list.types';
import { organizationListBusyKeys } from './organization-list.types';

export type OrganizationListReadyModel = Extract<OrganizationListModel, { status: 'ready' }>;

interface OrganizationListMachineContext {
  pendingKey: string | null;
  frozenModel: OrganizationListReadyModel | null;
  run: () => Promise<unknown>;
  error: ErrorDescription | undefined;
}

type OrganizationListMachineEvent =
  | { type: 'RUN'; key: string; frozenModel: OrganizationListReadyModel; run: () => Promise<unknown> }
  | { type: 'DISMISS' };

const { createMachine, assign, fromPromise } = setup<OrganizationListMachineContext, OrganizationListMachineEvent>();

const settled = { pendingKey: null, frozenModel: null };

const organizationListMachine = createMachine({
  id: 'organizationList',
  initial: 'idle',
  context: {
    pendingKey: null,
    frozenModel: null,
    run: () => Promise.resolve(),
    error: undefined,
  },
  states: {
    idle: {
      on: {
        RUN: {
          target: 'busy',
          actions: assign((_, event) => ({
            pendingKey: event.key,
            frozenModel: event.frozenModel,
            run: event.run,
            error: undefined,
          })),
        },
        DISMISS: { actions: assign(() => ({ error: undefined })) },
      },
    },
    busy: {
      invoke: fromPromise(context => context.run(), {
        onDone: { target: 'idle', actions: assign(() => settled) },
        onError: {
          target: 'idle',
          actions: assign((_, event) => ({ ...settled, error: toLocalizableError(event.error) })),
        },
      }),
    },
  },
});

export type OrganizationListController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (OrganizationListData & {
      status: 'ready';
      createOrganization?: OrganizationListReadyModel['createOrganization'];
      pendingKey: string | null;
      error: string | undefined;
      onDismissError: () => void;
      onSelectOrganization: (organizationId: string | null) => void;
      onAcceptInvitation: (invitationId: string) => void;
      onAcceptSuggestion: (suggestionId: string) => void;
    });

export type OrganizationListReadyController = Extract<OrganizationListController, { status: 'ready' }>;

export function useOrganizationListController(model: OrganizationListModel): OrganizationListController {
  const m = useMessages('organizationList');
  const errorText = useErrorText();
  const [{ context }, send] = useMachine(organizationListMachine);
  const pendingKey = useSpinDelay(context.pendingKey, { delay: 0 });

  const resolvedModel = context.frozenModel ?? model;
  if (resolvedModel.status !== 'ready') {
    return { status: resolvedModel.status };
  }

  const runAction =
    <Args extends unknown[]>(keyFor: (...args: Args) => string, fn: (...args: Args) => Promise<unknown>) =>
    (...args: Args) =>
      send({ type: 'RUN', key: keyFor(...args), frozenModel: resolvedModel, run: () => fn(...args) });

  const { status: _status, onSelectOrganization, onAcceptInvitation, onAcceptSuggestion, ...data } = resolvedModel;

  return {
    status: 'ready',
    ...data,
    pendingKey,
    error: context.error ? errorText(context.error, m.error) : undefined,
    onDismissError: () => send({ type: 'DISMISS' }),
    onSelectOrganization: runAction(organizationListBusyKeys.selectOrganization, onSelectOrganization),
    onAcceptInvitation: runAction(organizationListBusyKeys.acceptInvitation, onAcceptInvitation),
    onAcceptSuggestion: runAction(organizationListBusyKeys.acceptSuggestion, onAcceptSuggestion),
  };
}

export interface OrganizationListScreenController {
  creating: boolean;
  onCreateOrganization?: () => void;
  onCancelCreate?: () => void;
  onCreated: () => void;
}

export function useOrganizationListScreenController(
  controller: OrganizationListReadyController,
): OrganizationListScreenController {
  const hasOrganizations =
    controller.memberships.length + controller.invitations.length + controller.suggestions.length > 0;
  const startsOnCreate = controller.hidePersonal && !hasOrganizations && Boolean(controller.createOrganization);
  const [creating, setCreating] = useState(startsOnCreate);

  return {
    creating: creating && Boolean(controller.createOrganization),
    onCreateOrganization: controller.createOrganization
      ? () => {
          controller.onDismissError();
          setCreating(true);
        }
      : undefined,
    onCancelCreate: startsOnCreate ? undefined : () => setCreating(false),
    onCreated: () => setCreating(false),
  };
}
