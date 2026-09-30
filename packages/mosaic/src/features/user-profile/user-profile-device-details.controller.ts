import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/useMachine';
import type { UserProfileDevice } from './user-profile-active-devices.types';

interface Context {
  run: () => Promise<void>;
  errorMessage: string | undefined;
  fallbackError: string;
}

type Event = { type: 'OPEN' } | { type: 'CLOSE' } | { type: 'SIGN_OUT'; run: () => Promise<void> };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

const machine = createMachine({
  id: 'deviceDetails',
  initial: 'closed',
  context: { run: () => Promise.resolve(), errorMessage: undefined, fallbackError: '' },
  states: {
    closed: {
      on: { OPEN: { target: 'open', actions: assign(() => ({ errorMessage: undefined })) } },
    },
    open: {
      on: {
        CLOSE: 'closed',
        SIGN_OUT: {
          target: 'signingOut',
          actions: assign((_, event) => ({ run: event.run, errorMessage: undefined })),
        },
      },
    },
    signingOut: {
      invoke: fromPromise(context => context.run(), {
        onDone: 'closed',
        onError: {
          target: 'open',
          actions: assign((context, event) => ({
            errorMessage: event.error instanceof Error ? event.error.message : context.fallbackError,
          })),
        },
      }),
    },
  },
});

export function useUserProfileDeviceDetailsController({
  onSignOut,
  fallbackError,
}: {
  onSignOut?: (device: UserProfileDevice) => void | Promise<void>;
  fallbackError: string;
}) {
  const [snapshot, send] = useMachine(machine, { context: { fallbackError } });

  return {
    open: snapshot.value !== 'closed',
    onOpenChange: (open: boolean) => send({ type: open ? 'OPEN' : 'CLOSE' }),
    isSigningOut: snapshot.value === 'signingOut',
    errorMessage: snapshot.context.errorMessage,
    onSignOut: onSignOut
      ? (device: UserProfileDevice) => send({ type: 'SIGN_OUT', run: async () => onSignOut(device) })
      : undefined,
  };
}
