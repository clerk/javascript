import type { TelemetryEventRaw } from '../../types';

const EVENT_METHOD_CALLED = 'METHOD_CALLED';
const EVENT_SAMPLING_RATE = 0.1;

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
    eventSamplingRate: EVENT_SAMPLING_RATE,
    payload: {
      method,
      ...payload,
    },
  };
}
