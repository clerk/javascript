import type { TelemetryEventRaw } from '../types';

const EVENT_COMPONENT_MOUNTED = 'COMPONENT_MOUNTED' as const;
const EVENT_SAMPLING_RATE = 0.1;

type EventComponentMounted = {
  component: string;
  appearanceProp: boolean;
  elements: boolean;
  variables: boolean;
  baseTheme: boolean;
};

/**
 * Fired when one of the Clerk components is mounted.
 */
export function eventComponentMounted(
  component: string,
  props?: Record<string, any>,
): TelemetryEventRaw<EventComponentMounted> {
  return {
    event: EVENT_COMPONENT_MOUNTED,
    eventSamplingRate: EVENT_SAMPLING_RATE,
    payload: {
      component,
      appearanceProp: Boolean(props?.appearance),
      baseTheme: Boolean(props?.appearance?.baseTheme),
      elements: Boolean(props?.appearance?.elements),
      variables: Boolean(props?.appearance?.variables),
    },
  };
}
