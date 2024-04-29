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

type EventComponentMountedRaw = {
  component: string;
  [key: string]: boolean | string;
};

/**
 * Fired when one of the Clerk components is mounted.
 *
 * @param component - The name of the component.
 * @param props - The props passed to the component. Will be filtered to a known list of props.
 *
 * @example
 * telemetry.record(eventComponentMounted('SignUp', props));
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

/**
 * **Caution:** Do not pass in all props from a component but instead filter them yourself.
 * Compared to `eventComponentMounted` this function doesn't filter the props passed in. If you just want to track that a component is mounted, use `eventComponentMounted`.
 */
export function eventComponentMountedRaw(
  component: string,
  props: Record<string, string | boolean>,
): TelemetryEventRaw<EventComponentMountedRaw> {
  return {
    event: EVENT_COMPONENT_MOUNTED,
    eventSamplingRate: EVENT_SAMPLING_RATE,
    payload: {
      component,
      ...props,
    },
  };
}
