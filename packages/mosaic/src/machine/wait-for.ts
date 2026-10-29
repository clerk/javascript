import type { Actor, EventObject, Snapshot } from './types';

/**
 * Resolves with the first snapshot that matches `predicate`, checking the current one first.
 * Use it to await a machine-driven step, such as `actions.run(key, () => waitFor(actor, s => s.value !== 'sending'))`.
 */
export function waitFor<TContext, TEvent extends EventObject>(
  actor: Pick<Actor<TContext, TEvent>, 'getSnapshot' | 'subscribe'>,
  predicate: (snapshot: Snapshot<TContext>) => boolean,
): Promise<Snapshot<TContext>> {
  return new Promise(resolve => {
    const current = actor.getSnapshot();
    if (predicate(current)) {
      resolve(current);
      return;
    }
    const unsubscribe = actor.subscribe(snapshot => {
      if (predicate(snapshot)) {
        unsubscribe();
        resolve(snapshot);
      }
    });
  });
}
