import type { TelemetryEventRaw } from '../../types';

const EVENT_FRAMEWORK_METADATA = 'FRAMEWORK_METADATA';
const EVENT_SAMPLING_RATE = 0.1;

type EventFrameworkMetadata = Record<string, string | number | boolean>;

/**
 * Fired when a helper method is called from a Clerk SDK.
 */
export function eventFrameworkMetadata(payload: EventFrameworkMetadata): TelemetryEventRaw<EventFrameworkMetadata> {
  return {
    event: EVENT_FRAMEWORK_METADATA,
    eventSamplingRate: EVENT_SAMPLING_RATE,
    payload,
  };
}
