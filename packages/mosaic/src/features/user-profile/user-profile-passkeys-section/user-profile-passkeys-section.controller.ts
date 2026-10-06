import type { ErrorDescription } from '../../../localization';
import { useErrorText, useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/use-machine';
import { toLocalizableError } from '../../../utils/errors';
import type { UserProfilePasskeysModel } from './user-profile-passkeys-section.model';

type PasskeysControllerInput = Pick<
  Extract<UserProfilePasskeysModel, { status: 'ready' }>,
  'passkeys' | 'onAdd' | 'onRename' | 'validateName' | 'onRemove'
>;

interface Context {
  run: () => Promise<unknown>;
  error: ErrorDescription | undefined;
}

type Event = { type: 'ADD'; run: () => Promise<unknown> };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

const machine = createMachine({
  id: 'createPasskey',
  initial: 'idle',
  context: { run: () => Promise.resolve(), error: undefined },
  states: {
    idle: {
      on: {
        ADD: {
          target: 'creating',
          actions: assign((_, event) => ({
            run: event.run,
            error: undefined,
          })),
        },
      },
    },
    creating: {
      invoke: fromPromise(context => context.run(), {
        onDone: { target: 'idle' },
        onError: {
          target: 'idle',
          actions: assign((_, event) => ({ error: toLocalizableError(event.error) })),
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
  const errorText = useErrorText();
  const [snapshot, send] = useMachine(machine);
  return {
    passkeys,
    isAdding: snapshot.value === 'creating',
    addError: snapshot.context.error ? errorText(snapshot.context.error, messages.saveError) : undefined,
    onAdd: onAdd ? () => send({ type: 'ADD', run: onAdd }) : undefined,
    onRename,
    validateName,
    onRemove,
  };
}
