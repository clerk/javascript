import type { ErrorDescription } from '../../localization';
import { useErrorText } from '../../localization';
import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
import { toLocalizableError } from '../../utils/errors';
import type { UserProfileDevice } from './user-profile-active-devices.types';

interface Context {
  run: () => Promise<void>;
  error: ErrorDescription | undefined;
  fallbackError: string;
}

type Event = { type: 'OPEN' } | { type: 'CLOSE' } | { type: 'SIGN_OUT'; run: () => Promise<void> };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

const machine = createMachine({
  id: 'deviceDetails',
  initial: 'closed',
  context: { run: () => Promise.resolve(), error: undefined, fallbackError: '' },
  states: {
    closed: {
      on: { OPEN: { target: 'open', actions: assign(() => ({ error: undefined })) } },
    },
    open: {
      on: {
        CLOSE: 'closed',
        SIGN_OUT: {
          target: 'signingOut',
          actions: assign((_, event) => ({ run: event.run, error: undefined })),
        },
      },
    },
    signingOut: {
      invoke: fromPromise(context => context.run(), {
        onDone: 'closed',
        onError: {
          target: 'open',
          actions: assign((_, event) => ({ error: toLocalizableError(event.error) })),
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
  const errorText = useErrorText();

  return {
    open: snapshot.value !== 'closed',
    onOpenChange: (open: boolean) => send({ type: open ? 'OPEN' : 'CLOSE' }),
    isSigningOut: snapshot.value === 'signingOut',
    errorMessage: snapshot.context.error ? errorText(snapshot.context.error, fallbackError) : undefined,
    onSignOut: onSignOut
      ? (device: UserProfileDevice) => send({ type: 'SIGN_OUT', run: async () => onSignOut(device) })
      : undefined,
  };
}
