import { ASSIGN } from './types';
import type { AssignAction, EventObject } from './types';

/**
 * Context-update action creator. The returned object is recognised by the
 * runtime, which shallow-merges the returned partial into context.
 *
 * ```ts
 * on: { TYPE: { actions: assign((_, e) => ({ value: e.value })) } }
 * ```
 *
 * The updater is a pure `(context, event) => Partial<context>` function, so it
 * can be unit-tested on its own without an actor.
 */
export function assign<TContext, TEvent extends EventObject = EventObject>(
  assignment: (context: TContext, event: TEvent) => Partial<TContext>,
): AssignAction<TContext, TEvent> {
  return { type: ASSIGN, assignment };
}

/** Type guard distinguishing an `assign` action from a plain side-effect action. */
export function isAssignAction<TContext, TEvent extends EventObject>(
  action: unknown,
): action is AssignAction<TContext, TEvent> {
  return typeof action === 'object' && action !== null && (action as { type?: unknown }).type === ASSIGN;
}
