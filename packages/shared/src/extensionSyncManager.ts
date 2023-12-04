export const events = {
  DevJWTUpdate: 'clerk:sync:dev:jwt:update',
} as const;

type SyncEvent = (typeof events)[keyof typeof events];

type SyncPayloads = {
  [events.DevJWTUpdate]:
    | {
        action: 'set';
        token: string;
        frontendApi: string;
      }
    | {
        action: 'remove';
        frontendApi: string;
      };
};

type SyncPayload<E extends SyncEvent> = SyncPayloads[E] & {
  event: E;
};

type SyncHandler<E extends SyncEvent> = (evt: MessageEvent<SyncPayload<E>>) => void;

export function createExtensionSyncManager() {
  const listeners = new Map<SyncEvent, SyncHandler<any>>();

  function dispatch<E extends SyncEvent>(
    event: E,
    payload: SyncPayloads[E],
    targetOrigin: string = window.location.origin,
    transfer?: Transferable[],
  ) {
    window.postMessage({ event, ...payload } satisfies SyncPayload<E>, targetOrigin, transfer);
  }

  function on<E extends SyncEvent>(event: E, handler: SyncHandler<E>) {
    const wrappedHandler: SyncHandler<E> = evt => {
      // Only accept messages from ourselves
      if (evt.source === window && evt.data.event === event) {
        handler(evt);
      }
    };

    window.addEventListener('message', wrappedHandler, false);
    listeners.set(event, wrappedHandler);
  }

  function off<E extends SyncEvent>(event: E) {
    const handler = listeners.get(event);
    if (handler) {
      window.removeEventListener('message', handler, false);
      listeners.delete(event);
    }
  }

  return { dispatch, off, on };
}
