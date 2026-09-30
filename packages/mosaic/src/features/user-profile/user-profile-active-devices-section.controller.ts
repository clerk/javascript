import { useEffect } from 'react';

import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/useMachine';
import type { UserProfileDevice } from './user-profile-active-devices.types';
import type { UserProfileActiveDevicesModel } from './user-profile-active-devices-section.model';

interface Context {
  devices: UserProfileDevice[];
  loadSessions: () => Promise<UserProfileDevice[]>;
}

type Event =
  | { type: 'LOAD'; loadSessions: Context['loadSessions'] }
  | { type: 'RETRY' }
  | { type: 'REMOVED'; id: string };

const { createMachine, assign, fromPromise } = setup<Context, Event>();
const load = {
  target: 'loading',
  actions: assign((_, event: Extract<Event, { type: 'LOAD' }>) => ({ loadSessions: event.loadSessions })),
};

const machine = createMachine({
  id: 'activeDevices',
  initial: 'idle',
  context: { devices: [], loadSessions: () => Promise.resolve([]) },
  states: {
    idle: { on: { LOAD: load } },
    loading: {
      on: { LOAD: load },
      invoke: fromPromise(context => context.loadSessions(), {
        onDone: { target: 'ready', actions: assign((_, event) => ({ devices: event.output })) },
        onError: 'error',
      }),
    },
    error: { on: { LOAD: load, RETRY: 'loading' } },
    ready: {
      on: {
        LOAD: load,
        REMOVED: {
          actions: assign((context, event) => ({ devices: context.devices.filter(device => device.id !== event.id) })),
        },
      },
    },
  },
});

export function useUserProfileActiveDevicesController(
  model: Extract<UserProfileActiveDevicesModel, { status: 'ready' }>,
) {
  const [snapshot, send] = useMachine(machine);
  const { loadSessions } = model;
  useEffect(() => {
    send({ type: 'LOAD', loadSessions });
  }, [loadSessions, send]);

  const revoke = async (id: string) => {
    const removed = await model.revoke(id);
    if (removed) {
      send({ type: 'REMOVED', id });
    }
    return removed;
  };

  return {
    status: snapshot.value === 'ready' ? 'ready' : snapshot.value === 'error' ? 'error' : 'loading',
    devices: snapshot.context.devices,
    retry: () => send({ type: 'RETRY' }),
    onSignOutDevice: revoke,
    // TODO: Wire the model's future bulk action to onSignOutAllOtherDevices and refresh the device list after it settles.
  };
}
