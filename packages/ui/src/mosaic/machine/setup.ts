import { assign as _assign } from './assign';
import { createMachine as _createMachine } from './createMachine';
import type { AssignAction, EventObject, MachineConfig, StateMachine } from './types';

/**
 * Pre-bind `TContext` and `TEvent` once per machine file, returning factory
 * functions that don't require repeating those types at every call site.
 *
 * ```ts
 * const { createMachine, assign } = setup<SignInContext, SignInEvent>();
 *
 * export function createSignInMachine(deps: Deps) {
 *   return createMachine({           // no <SignInContext, SignInEvent> needed
 *     states: {
 *       collecting: {
 *         on: {
 *           TYPE_IDENTIFIER: {
 *             actions: assign((_, e) => ({ identifier: e.value })), // e narrowed automatically
 *           },
 *         },
 *       },
 *     },
 *   });
 * }
 * ```
 *
 * `assign`'s second type parameter (`TEvt`) is left free so TypeScript's
 * contextual typing can narrow it from its placement inside `on`, `onDone`,
 * `onError`, or `after` — eliminating the need to write
 * `assign<Ctx, Extract<Event, { type: 'X' }>>` by hand.
 */
export function setup<TContext extends object, TEvent extends EventObject>() {
  return {
    createMachine: (config: MachineConfig<TContext, TEvent>): StateMachine<TContext, TEvent> =>
      _createMachine<TContext, TEvent>(config),

    assign: <TEvt extends EventObject = EventObject>(
      fn: (context: TContext, event: TEvt) => Partial<TContext>,
    ): AssignAction<TContext, TEvt> => _assign<TContext, TEvt>(fn),
  };
}
