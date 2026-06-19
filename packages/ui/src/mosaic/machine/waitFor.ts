import type { Actor, EventObject, Snapshot } from './types';

export interface WaitForOptions {
  /** Milliseconds before the promise rejects with {@link WaitForTimeoutError}. No timeout by default. */
  timeout?: number;
}

export class WaitForTimeoutError extends Error {
  constructor(ms: number) {
    super(`waitFor timed out after ${ms}ms`);
    this.name = 'WaitForTimeoutError';
  }
}

/**
 * Returns a promise that resolves with the first snapshot for which `predicate`
 * returns true. If the predicate already holds on the current snapshot, the
 * promise resolves in the next microtask.
 *
 * Rejects if:
 * - The actor reaches a non-active status (`done` or `stopped`) before the
 *   predicate is satisfied.
 * - `options.timeout` milliseconds elapse without the predicate being satisfied.
 *
 * ```ts
 * // Wait for a specific state.
 * const snap = await waitFor(actor, s => s.value === 'success');
 *
 * // Wait for any context field to be set.
 * const snap = await waitFor(actor, s => s.context.userId !== null, { timeout: 5000 });
 * ```
 */
export function waitFor<TContext extends object, TEvent extends EventObject>(
  actor: Actor<TContext, TEvent>,
  predicate: (snapshot: Snapshot<TContext>) => boolean,
  options: WaitForOptions = {},
): Promise<Snapshot<TContext>> {
  return new Promise((resolve, reject) => {
    const current = actor.getSnapshot();

    if (predicate(current)) {
      resolve(current);
      return;
    }

    // Terminal status with an unsatisfied predicate — nothing more will come.
    if (current.status !== 'active') {
      reject(new Error(`waitFor: actor is "${current.status}" and predicate was not satisfied`));
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function cleanup() {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      unsubscribe();
    }

    const unsubscribe = actor.subscribe(snapshot => {
      if (predicate(snapshot)) {
        cleanup();
        resolve(snapshot);
        return;
      }
      if (snapshot.status !== 'active') {
        cleanup();
        reject(new Error(`waitFor: actor reached status "${snapshot.status}" before predicate was satisfied`));
      }
    });

    if (options.timeout !== undefined) {
      const ms = options.timeout;
      timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new WaitForTimeoutError(ms));
      }, ms);
    }
  });
}
