import type { Status } from '@clerk/types';

type EventHandler<Events extends Record<string, unknown>, Key extends keyof Events, R = void> = (
  payload: Events[Key],
) => R;

export const createEventBus = <Events extends Record<string, unknown>>() => {
  const eventToHandlersMap = new Map<keyof Events, Array<(...args: any[]) => void>>();
  const latestPayloadMap = new Map<keyof Events, any>();
  const eventToPredispatchHandlersMap = new Map<keyof Events, Array<(...args: any[]) => void>>();

  const on = <Event extends keyof Events>(
    event: Event,
    handler: EventHandler<Events, Event>,
    opts?: { notify?: boolean; dispose?: EventHandler<Events, Event, boolean> },
  ) => {
    const { notify } = opts || {};
    if (!eventToHandlersMap.has(event)) {
      eventToHandlersMap.set(event, []);
    }
    eventToHandlersMap.get(event)?.push(handler);

    if (notify && latestPayloadMap.has(event)) {
      handler(latestPayloadMap.get(event));
    }
  };

  const dispatch = <Event extends keyof Events>(event: Event, payload: Events[Event]) => {
    latestPayloadMap.set(event, payload);
    (eventToPredispatchHandlersMap.get(event) || []).forEach(h => typeof h === 'function' && h(payload));
    (eventToHandlersMap.get(event) || []).forEach(h => typeof h === 'function' && h(payload));
  };

  const onPreDispatch = <Event extends keyof Events>(event: Event, handler: EventHandler<Events, Event>) => {
    if (!eventToPredispatchHandlersMap.has(event)) {
      eventToPredispatchHandlersMap.set(event, []);
    }
    eventToPredispatchHandlersMap.get(event)?.push(handler);
  };

  const off = <Event extends keyof Events>(event: Event, handler?: EventHandler<Events, Event>) => {
    const handlers = eventToHandlersMap.get(event) || [];
    if (!handlers.length) {
      return;
    }

    if (handler) {
      eventToHandlersMap.set(
        event,
        handlers.filter(h => h !== handler),
      );
    }

    eventToHandlersMap.delete(event);
  };

  const retrieveListeners = <Event extends keyof Events>(event: Event) => {
    return eventToHandlersMap.get(event);
  };

  return {
    on,
    onPreDispatch,
    dispatch,
    off,
    internal: {
      retrieveListeners,
    },
  };
};

export const clerkEvents = {
  Status: 'status',
} as const;

type ClerkEvent = {
  [clerkEvents.Status]: Status;
};

export const createClerkEventBus = () => {
  return createEventBus<ClerkEvent>();
};
