import type { TelemetryEventRaw } from '../../types';

const EVENT_COMPONENT_MOUNTED = 'COMPONENT_MOUNTED';
const EVENT_COMPONENT_OPENED = 'COMPONENT_OPENED';
const EVENT_SAMPLING_RATE = 0.1;

/** Increase sampling for high-signal auth components on mount. */
const AUTH_COMPONENTS = new Set<string>(['SignIn', 'SignUp']);

/**
 * Returns the per-event sampling rate for component-mounted telemetry events.
 * Uses a higher rate for SignIn/SignUp to improve signal quality.
 *
 *  @internal
 */
function getComponentMountedSamplingRate(component: string): number {
  return AUTH_COMPONENTS.has(component) ? 1 : EVENT_SAMPLING_RATE;
}

type ComponentMountedBase = {
  component: string;
};

type EventPrebuiltComponent = ComponentMountedBase & {
  appearanceProp: boolean;
  elements: boolean;
  variables: boolean;
  baseTheme: boolean;
};

type EventComponentMounted = ComponentMountedBase & TelemetryEventRaw['payload'];

/**
 * Factory for prebuilt component telemetry events.
 *
 * @internal
 */
function createPrebuiltComponentEvent(event: typeof EVENT_COMPONENT_MOUNTED | typeof EVENT_COMPONENT_OPENED) {
  return function (
    component: string,
    props?: Record<string, any>,
    additionalPayload?: TelemetryEventRaw['payload'],
  ): TelemetryEventRaw<EventPrebuiltComponent> {
    return {
      event,
      eventSamplingRate:
        event === EVENT_COMPONENT_MOUNTED ? getComponentMountedSamplingRate(component) : EVENT_SAMPLING_RATE,
      payload: {
        component,
        appearanceProp: Boolean(props?.appearance),
        baseTheme: Boolean(props?.appearance?.baseTheme),
        elements: Boolean(props?.appearance?.elements),
        variables: Boolean(props?.appearance?.variables),
        ...additionalPayload,
      },
    };
  };
}

/**
 * Helper function for `telemetry.record()`. Create a consistent event object for when a prebuilt (AIO) component is mounted.
 *
 * @param component - The name of the component.
 * @param props - The props passed to the component. Will be filtered to a known list of props.
 * @param additionalPayload - Additional data to send with the event.
 * @example
 * telemetry.record(eventPrebuiltComponentMounted('SignUp', props));
 */
export function eventPrebuiltComponentMounted(
  component: string,
  props?: Record<string, any>,
  additionalPayload?: TelemetryEventRaw['payload'],
): TelemetryEventRaw<EventPrebuiltComponent> {
  return createPrebuiltComponentEvent(EVENT_COMPONENT_MOUNTED)(component, props, additionalPayload);
}

/**
 * Helper function for `telemetry.record()`. Create a consistent event object for when a prebuilt (AIO) component is opened as a modal.
 *
 * @param component - The name of the component.
 * @param props - The props passed to the component. Will be filtered to a known list of props.
 * @param additionalPayload - Additional data to send with the event.
 * @example
 * telemetry.record(eventPrebuiltComponentOpened('GoogleOneTap', props));
 */
export function eventPrebuiltComponentOpened(
  component: string,
  props?: Record<string, any>,
  additionalPayload?: TelemetryEventRaw['payload'],
): TelemetryEventRaw<EventPrebuiltComponent> {
  return createPrebuiltComponentEvent(EVENT_COMPONENT_OPENED)(component, props, additionalPayload);
}

/**
 * Helper function for `telemetry.record()`. Create a consistent event object for when a component is mounted. Use `eventPrebuiltComponentMounted` for prebuilt components.
 *
 * **Caution:** Filter the `props` you pass to this function to avoid sending too much data.
 *
 * @param component - The name of the component.
 * @param props - The props passed to the component. Ideally you only pass a handful of props here.
 * @example
 * telemetry.record(eventComponentMounted('SignUp', props));
 */
export function eventComponentMounted(
  component: string,
  props: TelemetryEventRaw['payload'] = {},
): TelemetryEventRaw<EventComponentMounted> {
  return {
    event: EVENT_COMPONENT_MOUNTED,
    eventSamplingRate: getComponentMountedSamplingRate(component),
    payload: {
      component,
      ...props,
    },
  };
}
