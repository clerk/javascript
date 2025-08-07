import type { TelemetryCollectorOptions } from '@clerk/shared/telemetry';
import { TelemetryCollector } from '@clerk/shared/telemetry';
import type { TelemetryCollector as TelemetryCollectorInterface, TelemetryEventRaw } from '@clerk/types';

/**
 * Next.js-specific telemetry collector that boosts sampling rates for component-mounted events
 * when running in keyless mode (Next.js app router only).
 */
export class NextJSTelemetryCollector implements TelemetryCollectorInterface {
  #collector: TelemetryCollector;

  constructor(options: TelemetryCollectorOptions) {
    this.#collector = new TelemetryCollector(options);
  }

  get isEnabled(): boolean {
    return this.#collector.isEnabled;
  }

  get isDebug(): boolean {
    return this.#collector.isDebug;
  }

  record(event: TelemetryEventRaw): void {
    // Check if we're in keyless mode and this is a component-mounted event
    const isKeyless = typeof window !== 'undefined' && (window as any).__clerk_keyless === true;
    const isComponentMountedEvent = event.event === 'COMPONENT_MOUNTED';

    // Boost sampling rate to 100% for component-mounted events in keyless mode.
    // Respect explicit 100% overrides; otherwise, override anything below 1.0.
    const shouldBoost = isKeyless && isComponentMountedEvent;
    const hasExplicitSampling = typeof event.eventSamplingRate === 'number';
    const sampling = hasExplicitSampling ? event.eventSamplingRate : undefined;
    const needsBoost = sampling === undefined || sampling < 1.0;

    const boostedEvent: TelemetryEventRaw = shouldBoost && needsBoost ? { ...event, eventSamplingRate: 1.0 } : event;

    this.#collector.record(boostedEvent);
  }
}
