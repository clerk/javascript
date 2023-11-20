const EVENT_METHOD_CALLED = 'METHOD_CALLED' as const;

type EventMethodCalled = {
  method: string;
} & Record<string, string | number | boolean>;

/**
 * Fired when a helper method is called from a Clerk SDK.
 */
export function eventMethodCalled(
  method: string,
  payload?: Record<string, unknown>,
): { event: typeof EVENT_METHOD_CALLED; payload: EventMethodCalled } {
  return {
    event: EVENT_METHOD_CALLED,
    payload: {
      method,
      ...payload,
    },
  };
}
