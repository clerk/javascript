import type { SessionResource, TokenResource } from '@clerk/types';

export const events = {
  TokenUpdate: 'token:update',
  UserSignOut: 'user:signOut',
  InternalComponentNavigate: 'task:internalNavigate',
} as const;

type ClerkEvent = (typeof events)[keyof typeof events];
type EventHandler<E extends ClerkEvent> = (payload: EventPayload[E]) => void;

type TokenUpdatePayload = { token: TokenResource | null };
type InternalComponentNavigatePayload = { resolveNavigation: () => void; session: SessionResource };

type EventPayload = {
  [events.TokenUpdate]: TokenUpdatePayload;
  [events.UserSignOut]: null;
  [events.InternalComponentNavigate]: InternalComponentNavigatePayload;
};

const createEventBus = () => {
  const eventToHandlersMap = new Map<ClerkEvent, Array<EventHandler<any>>>();

  const on = <E extends ClerkEvent>(event: E, handler: EventHandler<E>) => {
    if (!eventToHandlersMap.get(event)) {
      eventToHandlersMap.set(event, []);
    }
    eventToHandlersMap.get(event)?.push(handler);
  };

  const dispatch = <E extends ClerkEvent>(event: E, payload: EventPayload[E]) => {
    (eventToHandlersMap.get(event) || []).forEach(h => typeof h === 'function' && h(payload));
  };

  const off = <E extends ClerkEvent>(event: E, handler?: EventHandler<E>) => {
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

    eventToHandlersMap.set(event, []);
  };

  const has = <E extends ClerkEvent>(event: E) => {
    return !!eventToHandlersMap.has(event);
  };

  return { on, dispatch, off, has };
};

export const eventBus = createEventBus();
