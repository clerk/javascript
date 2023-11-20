const EVENT_COMPONENT_MOUNTED = 'COMPONENT_MOUNTED' as const;

type EventComponentMounted = {
  component: string;
  appearanceProp: boolean;
};

/**
 * Fired when one of the Clerk components is mounted.
 */
export function eventComponentMounted(
  component: string,
  props?: Record<string, unknown>,
): { event: typeof EVENT_COMPONENT_MOUNTED; payload: EventComponentMounted } {
  return {
    event: EVENT_COMPONENT_MOUNTED,
    payload: {
      component,
      appearanceProp: Boolean(props?.appearance),
    },
  };
}
