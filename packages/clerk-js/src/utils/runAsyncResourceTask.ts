import { eventBus } from '../core/events';
import type { BaseResource } from '../core/resources/internal';

/**
 * Wrap an async task with handling for emitting error and fetch events, which reduces boilerplate. Used in our Custom
 * Flow APIs.
 */
export async function runAsyncResourceTask<T>(
  resource: BaseResource,
  task: () => Promise<T>,
): Promise<{ result?: T; error: unknown }> {
  eventBus.emit('resource:error', { resource, error: null });
  eventBus.emit('resource:fetch', {
    resource,
    status: 'fetching',
  });

  try {
    const result = await task();
    return { result, error: null };
  } catch (err) {
    eventBus.emit('resource:error', { resource, error: err });
    return { error: err };
  } finally {
    eventBus.emit('resource:fetch', {
      resource,
      status: 'idle',
    });
  }
}
