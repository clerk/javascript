import type { TelemetryEventRaw } from '../../types';

const EVENT_FLOW_STEP_MOUNTED = 'FLOW_STEP_MOUNTED';
const EVENT_SAMPLING_RATE = 1;

type EventFlowStepMounted = {
  /** The flow the step belongs to, e.g. `configureSSO` (mirrors `Flow.Root`'s `flow`). */
  flow: string;
  /** The step/part that mounted, e.g. `verify-domain` */
  step: string;
  /** ISO-8601 timestamp, used to measure the time between steps of the same flow. */
  timestamp: string;
} & TelemetryEventRaw['payload'];

/**
 * Fires an event when a part of a multi-step flow becomes visible.
 *
 * @param flow - The flow identifier (matches `Flow.Root`'s `flow`).
 * @param step - The step/part that mounted.
 * @param payload - Extra, flow-specific metadata
 * @param eventSamplingRate - Override the default full-capture sampling rate.
 * @example
 * telemetry.record(eventFlowStepMounted('configureSSO', 'verify-domain', { connectionStatus: 'unconfigured' }));
 */
export function eventFlowStepMounted(
  flow: string,
  step: string,
  payload: TelemetryEventRaw['payload'] = {},
  eventSamplingRate: number = EVENT_SAMPLING_RATE,
): TelemetryEventRaw<EventFlowStepMounted> {
  return {
    event: EVENT_FLOW_STEP_MOUNTED,
    eventSamplingRate,
    payload: {
      flow,
      step,
      timestamp: new Date().toISOString(),
      ...payload,
    },
  };
}
