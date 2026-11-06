import { useMemo, useState } from 'react';

import { useSpinDelay } from '../../hooks/use-spin-delay';
import type { ErrorDescription } from '../../localization';
import { useErrorText, useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
import { toLocalizableError } from '../../utils/errors';
import type { OrganizationListModel } from './organization-list.model';
import { organizationListBusyKeys } from './organization-list.types';

export type OrganizationListReadyModel = Extract<OrganizationListModel, { status: 'ready' }>;

interface OrganizationListMachineContext<M> {
  pendingKey: string | null;
  frozenModel: M | null;
  run: () => Promise<unknown>;
  error: ErrorDescription | undefined;
}

type OrganizationListMachineEvent<M> =
  | { type: 'RUN'; key: string; frozenModel: M; run: () => Promise<unknown> }
  | { type: 'DISMISS' };

function createOrganizationListMachine<M>() {
  const { createMachine, createInvoke } = setup<OrganizationListMachineContext<M>, OrganizationListMachineEvent<M>>();
  const settled = { pendingKey: null, frozenModel: null };

  return createMachine({
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
          RUN: ({ event }) => ({
            target: 'busy',
            context: { pendingKey: event.key, frozenModel: event.frozenModel, run: event.run, error: undefined },
          }),
          DISMISS: () => ({ context: { error: undefined } }),
        },
      },
      busy: {
        invoke: createInvoke({
          input: ({ context }) => context.run,
          src: ({ input }) => input(),
          onDone: () => ({ target: 'idle', context: settled }),
          onError: ({ event }) => ({ target: 'idle', context: { ...settled, error: toLocalizableError(event.error) } }),
        }),
      },
    },
  });
}

type OrganizationListActions = 'onSelectOrganization' | 'onAcceptInvitation' | 'onAcceptSuggestion';

export type OrganizationListController<M extends OrganizationListReadyModel = OrganizationListReadyModel> =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (Omit<M, 'status' | OrganizationListActions> & {
      status: 'ready';
      pendingKey: string | null;
      error: string | undefined;
      onDismissError: () => void;
      onSelectOrganization: (organizationId: string | null) => void;
      onAcceptInvitation: (invitationId: string) => void;
      onAcceptSuggestion: (suggestionId: string) => void;
    });

export type OrganizationListReadyController<M extends OrganizationListReadyModel = OrganizationListReadyModel> =
  Extract<OrganizationListController<M>, { status: 'ready' }>;

export function useOrganizationListController<M extends OrganizationListReadyModel = OrganizationListReadyModel>(
  model: M | Exclude<OrganizationListModel, { status: 'ready' }>,
): OrganizationListController<M> {
  const m = useMessages('organizationList');
  const errorText = useErrorText();
  const machine = useMemo(() => createOrganizationListMachine<M>(), []);
  const [{ context }, send] = useMachine(machine);
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
  controller: Pick<
    OrganizationListReadyController,
    'memberships' | 'invitations' | 'suggestions' | 'hidePersonal' | 'createOrganization' | 'onDismissError'
  >,
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
