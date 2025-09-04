import type { ClerkEventPayload } from '@clerk/types';
import { useEffect } from 'react';

import type { useClerkInstanceContext } from '../contexts';

/**
 * Global registry to track event listeners by uniqueKey.
 * This prevents duplicate event listeners when multiple hook instances share the same key.
 */
type ThrottledEventRegistry = {
  refCount: number;
  handler: (payload: ClerkEventPayload['resource:action']) => void;
  cleanup: () => void;
};

const throttledEventRegistry = new Map<string, ThrottledEventRegistry>();

type UseThrottledEventParams = {
  /**
   * Unique key to identify this event listener. Multiple hooks with the same key
   * will share a single event listener.
   */
  uniqueKey: string | null;
  /**
   * Array of events that should trigger the handler.
   */
  events: ClerkEventPayload['resource:action'][];
  /**
   * Handler function to call when matching events occur.
   */
  onEvent: (payload: ClerkEventPayload['resource:action']) => void;
  /**
   * Clerk instance for event subscription.
   */
  clerk: ReturnType<typeof useClerkInstanceContext>;
};

/**
 * Custom hook that manages event listeners with reference counting to prevent
 * duplicate listeners when multiple hook instances share the same uniqueKey.
 * This effectively "throttles" event registration by ensuring only one listener
 * exists per unique key, regardless of how many components use the same key.
 *
 * @param params - Configuration for the event listener.
 * @param params.uniqueKey - Unique key to identify this event listener. Multiple hooks with the same key will share a single event listener.
 * @param params.events - Array of events that should trigger the handler.
 * @param params.onEvent - Handler function to call when matching events occur.
 * @param params.clerk - Clerk instance for event subscription.
 * @example
 * ```tsx
 * useThrottledEvent({
 *   uniqueKey: 'commerce-data-user123',
 *   events: ['checkout.confirm'],
 *   onEvent: (payload) => {
 *     // Handle the event - this will only be registered once
 *     // even if multiple components use the same uniqueKey
 *     revalidateData();
 *   },
 *   clerk: clerkInstance
 * });
 * ```
 */
export const useThrottledEvent = ({ uniqueKey, events, onEvent, clerk }: UseThrottledEventParams) => {
  useEffect(() => {
    // Only proceed if we have a valid key
    if (!uniqueKey) return;

    const existingEntry = throttledEventRegistry.get(uniqueKey);

    if (existingEntry) {
      // Increment reference count for existing event listener
      existingEntry.refCount++;
    } else {
      // Create new event listener entry
      const on = clerk.on.bind(clerk);
      const off = clerk.off.bind(clerk);

      const handler = (payload: ClerkEventPayload['resource:action']) => {
        if (events.includes(payload)) {
          onEvent(payload);
        }
      };

      const cleanup = () => {
        off('resource:action', handler);
      };

      // Register the event listener
      on('resource:action', handler);

      // Store in registry with initial ref count of 1
      throttledEventRegistry.set(uniqueKey, {
        refCount: 1,
        handler,
        cleanup,
      });
    }

    // Cleanup function
    return () => {
      if (!uniqueKey) return;

      const entry = throttledEventRegistry.get(uniqueKey);
      if (entry) {
        entry.refCount--;

        // If no more references, cleanup and remove from registry
        if (entry.refCount <= 0) {
          entry.cleanup();
          throttledEventRegistry.delete(uniqueKey);
        }
      }
    };
  }, [uniqueKey, events, onEvent, clerk]);
};
