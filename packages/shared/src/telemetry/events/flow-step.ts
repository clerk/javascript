import type { TelemetryEventRaw } from '../../types';

const EVENT_FLOW_STEP_MOUNTED = 'FLOW_STEP_MOUNTED';
const EVENT_SAMPLING_RATE = 1;

type EventFlowStepMounted = {
  /** The flow the step belongs to, e.g. `configureSSO` (mirrors `Flow.Root`'s `flow`). */
  flow: string;
  /** The step/part that mounted, e.g. `verify-domain` */
  step: string;
  /** Free-form, flow-specific metadata supplied by the caller (e.g. `timestamp`, `connectionStatus`). */
  metadata: TelemetryEventRaw['payload'];
} & TelemetryEventRaw['payload'];

/**
 * Fires an event from a part of a multi-step flow.
 *
 * @param flow - The flow identifier (matches `Flow.Root`'s `flow`).
 * @param step - The step/part that mounted.
 * @param metadata - Flow-specific metadata sent under `payload.metadata`.
 * @param eventSamplingRate - Override the default full-capture sampling rate.
 * @example
 * telemetry.record(eventFlowStepMounted('configureSSO', 'verify-domain', { timestamp: new Date().toISOString(), connectionStatus: 'unconfigured' }));
 */
export function eventFlowStepMounted(
  flow: string,
  step: string,
  metadata: TelemetryEventRaw['payload'] = {},
  eventSamplingRate: number = EVENT_SAMPLING_RATE,
): TelemetryEventRaw<EventFlowStepMounted> {
  return {
    event: EVENT_FLOW_STEP_MOUNTED,
    eventSamplingRate,
    payload: {
      flow,
      step,
      metadata,
    },
  };
}
