import type { LocalizableError } from '../../../localization';
import { useErrorText } from '../../../localization';
import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/use-machine';
import { toLocalizableError } from '../../../utils/form-error';

export interface OrganizationProfileDangerActionContext {
  run: () => Promise<void>;
  error: LocalizableError | undefined;
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
    error: undefined,
  },
  states: {
    idle: { on: { OPEN: 'confirming' } },
    confirming: {
      on: {
        CONFIRM: 'running',
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
    },
    running: {
      invoke: fromPromise(context => context.run(), {
        onDone: 'done',
        onError: {
          target: 'confirming',
          actions: assign((_, event) => ({ error: toLocalizableError(event.error) })),
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
  const errorText = useErrorText();
  const { error } = snapshot.context;

  return {
    isOpen: snapshot.value === 'confirming' || snapshot.value === 'running',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    onConfirm: () => send({ type: 'CONFIRM' }),
    isRunning: snapshot.value === 'running',
    errorMessage: error ? errorText(error) : undefined,
  };
}
