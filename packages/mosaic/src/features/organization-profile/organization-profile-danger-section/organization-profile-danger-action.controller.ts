import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/useMachine';

export interface OrganizationProfileDangerActionContext {
  run: () => Promise<void>;
  errorMessage: string | undefined;
}

export type OrganizationProfileDangerActionEvent = { type: 'OPEN' } | { type: 'CONFIRM' } | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileDangerActionContext,
  OrganizationProfileDangerActionEvent
>();

export const organizationProfileDangerActionMachine = createMachine({
  id: 'organizationDangerAction',
  initial: 'idle',
  context: {
    run: async () => {},
    errorMessage: undefined,
  },
  states: {
    idle: { on: { OPEN: 'confirming' } },
    confirming: {
      on: {
        CONFIRM: 'running',
        CANCEL: { target: 'idle', actions: assign(() => ({ errorMessage: undefined })) },
      },
    },
    running: {
      invoke: fromPromise(context => context.run(), {
        onDone: 'done',
        onError: {
          target: 'confirming',
          actions: assign((_, event) => ({
            errorMessage:
              event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
    done: { type: 'final' },
  },
});

export interface OrganizationProfileDangerActionControllerOptions {
  onRun: () => Promise<void>;
}

export interface OrganizationProfileDangerActionController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isRunning: boolean;
  errorMessage: string | undefined;
}

export function useOrganizationProfileDangerActionController({
  onRun,
}: OrganizationProfileDangerActionControllerOptions): OrganizationProfileDangerActionController {
  const [snapshot, send] = useMachine(organizationProfileDangerActionMachine, { context: { run: onRun } });

  return {
    isOpen: snapshot.value === 'confirming' || snapshot.value === 'running',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    onConfirm: () => send({ type: 'CONFIRM' }),
    isRunning: snapshot.value === 'running',
    errorMessage: snapshot.context.errorMessage,
  };
}
