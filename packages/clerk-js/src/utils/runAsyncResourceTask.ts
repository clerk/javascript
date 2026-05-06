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
  const resetFetchStatus = () => {
    eventBus.emit('resource:fetch', {
      resource,
      status: 'idle',
    });
  };
  const resetFetchStatusOnPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      resetFetchStatus();
    }
  };

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('pageshow', resetFetchStatusOnPageShow);
  }

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
    // TODO @userland-errors:
    return { error: err };
  } finally {
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('pageshow', resetFetchStatusOnPageShow);
    }
    resetFetchStatus();
  }
}
