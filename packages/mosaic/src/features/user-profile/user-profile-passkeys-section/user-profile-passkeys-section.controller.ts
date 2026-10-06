import { useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/use-machine';
import type { UserProfilePasskeysModel } from './user-profile-passkeys-section.model';

type PasskeysControllerInput = Pick<
  Extract<UserProfilePasskeysModel, { status: 'ready' }>,
  'passkeys' | 'onAdd' | 'onRename' | 'validateName' | 'onRemove'
>;

interface Context {
  run: () => Promise<unknown>;
  error: string | undefined;
  fallbackErrorMessage: string;
}

type Event = { type: 'ADD'; run: () => Promise<unknown>; fallbackErrorMessage: string };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

const machine = createMachine({
  id: 'createPasskey',
  initial: 'idle',
  context: { run: () => Promise.resolve(), error: undefined, fallbackErrorMessage: '' },
  states: {
    idle: {
      on: {
        ADD: {
          target: 'creating',
          actions: assign((_, event) => ({
            run: event.run,
            error: undefined,
            fallbackErrorMessage: event.fallbackErrorMessage,
          })),
        },
      },
    },
    creating: {
      invoke: fromPromise(context => context.run(), {
        onDone: { target: 'idle' },
        onError: {
          target: 'idle',
          actions: assign((context, event) => ({
            error:
              event.error instanceof Error && event.error.message ? event.error.message : context.fallbackErrorMessage,
          })),
        },
      }),
    },
  },
});

export function useUserProfilePasskeysSectionController({
  passkeys,
  onAdd,
  onRename,
  validateName,
  onRemove,
}: PasskeysControllerInput) {
  const messages = useMessages('userProfilePasskeys');
  const [snapshot, send] = useMachine(machine);
  return {
    passkeys,
    isAdding: snapshot.value === 'creating',
    addError: snapshot.context.error,
    onAdd: onAdd ? () => send({ type: 'ADD', run: onAdd, fallbackErrorMessage: messages.saveError }) : undefined,
    onRename,
    validateName,
    onRemove,
  };
}
