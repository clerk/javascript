import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/useMachine';
import { userProfileMfaMessages as m } from './user-profile-mfa-section.messages';
import type { UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';

type Context = {
  methodId: string | undefined;
  run: () => void | Promise<void>;
  errorMessage: string | undefined;
};

type Event = { type: 'SET_DEFAULT'; methodId: string; run: () => void | Promise<void> };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

const setDefaultMachine = createMachine({
  id: 'mfaSetDefault',
  initial: 'idle',
  context: { methodId: undefined, run: () => undefined, errorMessage: undefined },
  states: {
    idle: {
      on: {
        SET_DEFAULT: {
          target: 'pending',
          actions: assign((_, event) => ({ methodId: event.methodId, run: event.run, errorMessage: undefined })),
        },
      },
    },
    pending: {
      invoke: fromPromise(async context => context.run(), {
        onDone: 'idle',
        onError: {
          target: 'idle',
          actions: assign((_, event) => ({
            errorMessage: event.error instanceof Error ? event.error.message : m.setDefaultError,
          })),
        },
      }),
    },
  },
});

export function useUserProfileMfaSectionController({
  methods,
  onSetDefault,
}: Pick<UserProfileMfaSectionViewProps, 'methods' | 'onSetDefault'>) {
  const [snapshot, send] = useMachine(setDefaultMachine);

  return {
    pendingMethodId: snapshot.value === 'pending' ? snapshot.context.methodId : undefined,
    errorMethodId: snapshot.context.errorMessage ? snapshot.context.methodId : undefined,
    errorMessage: snapshot.context.errorMessage,
    onSetDefault: onSetDefault
      ? (id: string) => {
          const method = methods.find(method => method.id === id);
          if (method?.type === 'sms' && method.canSetDefault && !method.isDefault) {
            send({ type: 'SET_DEFAULT', methodId: id, run: () => onSetDefault(id) });
          }
        }
      : undefined,
  };
}
