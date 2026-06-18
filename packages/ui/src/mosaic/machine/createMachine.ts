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
    context: config.context ?? ({} as TContext),
    states: config.states,
    config,
  };
}
