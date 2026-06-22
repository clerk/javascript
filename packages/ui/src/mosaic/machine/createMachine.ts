import type { EventObject, MachineConfig, StateMachine } from './types';

/**
 * Create a state-machine definition from a config object.
 *
 * The result is a plain, inert description — nothing runs until you wrap it in
 * an actor ({@link createActor}). Because the shape is a static object, tools
 * (swingset docs, tests) can read `machine.states` to enumerate every step
 * without executing anything.
 *
 * ```ts
 * const machine = createMachine({
 *   id: 'toggle',
 *   initial: 'inactive',
 *   context: { count: 0 },
 *   states: {
 *     inactive: { on: { TOGGLE: 'active' } },
 *     active: { on: { TOGGLE: 'inactive' } },
 *   },
 * });
 * ```
 */
export function createMachine<
  TContext extends object = Record<string, never>,
  TEvent extends EventObject = EventObject,
  TStates extends string = string,
>(config: MachineConfig<TContext, TEvent, TStates>): StateMachine<TContext, TEvent> {
  return {
    id: config.id,
    initial: config.initial,
    // SAFETY: config.context is optional; when omitted the machine has no context.
    // The empty object satisfies any TContext at runtime — callers that omit context
    // also use Record<string, never> as TContext so no fields are accessed.
    context: config.context ?? ({} as TContext),
    states: config.states,
    config,
  };
}
