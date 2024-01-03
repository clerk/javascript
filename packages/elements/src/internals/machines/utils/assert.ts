import type { DoneActorEvent, ErrorActorEvent, EventObject } from 'xstate';

export function assertIsDefined<T>(value: T, label?: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`${label || value} is not defined`);
  }
}

export function assertActorEventDone<T>(event: EventObject): asserts event is DoneActorEvent<T> {
  if ('output' in event === false) {
    throw new Error(`Expected a done event, got "${event.type}"`);
  }
}

export function assertActorEventError<T = Error>(event: EventObject): asserts event is ErrorActorEvent<T> {
  if ('error' in event === false) {
    throw new Error(`Expected a error event, got "${event.type}"`);
  }
}
