import type { AssignAction, EventObject } from './types';
import { ASSIGN } from './types';

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
export function assign<TContext, TEvent extends EventObject = EventObject, TParams = undefined>(
  assignment: (context: TContext, event: TEvent, params: TParams) => Partial<TContext>,
): AssignAction<TContext, TEvent, TParams> {
  return { type: ASSIGN, assignment };
}

export function isAssignAction<TContext, TEvent extends EventObject, TParams = undefined>(
  action: unknown,
): action is AssignAction<TContext, TEvent, TParams> {
  return typeof action === 'object' && action !== null && (action as { type?: unknown }).type === ASSIGN;
}
