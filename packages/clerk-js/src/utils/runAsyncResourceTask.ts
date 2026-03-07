import type { ClerkError } from '@clerk/shared/error';

import { eventBus } from '../core/events';
import type { BaseResource } from '../core/resources/internal';

/**
 * Wrap an async task with handling for emitting error and fetch events, which reduces boilerplate. Used in our Custom
 * Flow APIs.
 */
export async function runAsyncResourceTask<T>(
  resource: BaseResource,
  task: () => Promise<T>,
): Promise<{ result?: T; error: ClerkError | null }> {
  eventBus.emit('resource:state-change', {
    resource,
    error: null,
    fetchStatus: 'fetching',
  });

  try {
    const result = await task();
    eventBus.emit('resource:state-change', {
      resource,
      error: null,
      fetchStatus: 'idle',
    });
    return { result, error: null };
  } catch (err) {
    eventBus.emit('resource:state-change', {
      resource,
      error: err,
      fetchStatus: 'idle',
    });
    // TODO @userland-errors:
    return { error: err };
  }
}
