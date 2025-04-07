import type { TelemetryEventRaw } from '@clerk/types';

const EVENT_METHOD_CALLED = 'METHOD_CALLED';

type EventMethodCalled = {
  method: string;
} & Record<string, string | number | boolean>;

/**
 * Fired when a helper method is called from a Clerk SDK.
 */
export function eventMethodCalled(
  method: string,
  payload?: Record<string, unknown>,
): TelemetryEventRaw<EventMethodCalled> {
  return {
    event: EVENT_METHOD_CALLED,
    payload: {
      method,
      ...payload,
    },
  };
}
