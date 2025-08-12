import type { TelemetryEventRaw } from '@clerk/types';

const EVENT_THEME_USAGE = 'THEME_USAGE';
const EVENT_SAMPLING_RATE = 0.1;

type EventThemeUsage = {
  /**
   * The name of the theme being used (e.g., "shadcn", "neobrutalism", etc.).
   */
  themeName?: string;
};

/**
 * Helper function for `telemetry.record()`. Create a consistent event object for tracking theme usage in ClerkProvider.
 *
 * @param payload - Theme usage data to track.
 * @example
 * telemetry.record(eventThemeUsage({ themeName: 'shadcn' }));
 */
export function eventThemeUsage(payload: EventThemeUsage): TelemetryEventRaw<EventThemeUsage> {
  return {
    event: EVENT_THEME_USAGE,
    eventSamplingRate: EVENT_SAMPLING_RATE,
    payload,
  };
}
