import type { ActionMap, ActorMap, EventObject, Implementations, MachineConfig, StateMachine } from './types';

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
 *     inactive: { on: { TOGGLE: { target: 'active' } } },
 *     active: { on: { TOGGLE: { target: 'inactive' } } },
 *   },
 * });
 * ```
 */
export function createMachine<
  TContext extends object,
  TEvent extends EventObject,
  TStates extends string,
  TActions extends ActionMap = Record<never, never>,
  TActors extends ActorMap = Record<never, never>,
  TInput = undefined,
>(
  config: MachineConfig<TContext, TEvent, TStates, TActions, TActors, TInput>,
): StateMachine<TContext, TEvent, TStates, TActions, TActors, TInput> {
  return withImplementations(config, {
    actions: config.actions ?? emptyMap<TActions>(),
    actors: config.actors ?? emptyMap<TActors>(),
  });
}

function withImplementations<
  TContext extends object,
  TEvent extends EventObject,
  TStates extends string,
  TActions extends ActionMap,
  TActors extends ActorMap,
  TInput,
>(
  config: MachineConfig<TContext, TEvent, TStates, TActions, TActors, TInput>,
  implementations: { actions: TActions; actors: TActors },
): StateMachine<TContext, TEvent, TStates, TActions, TActors, TInput> {
  return {
    id: config.id,
    initial: config.initial,
    states: config.states,
    config,
    implementations,
    provide: (next: Implementations<TActions, TActors>) =>
      withImplementations(config, {
        actions: { ...implementations.actions, ...next.actions },
        actors: { ...implementations.actors, ...next.actors },
      }),
    resolveState: ({ value, context }) => ({
      value,
      context,
      status: config.states[value].type === 'final' ? 'done' : 'active',
    }),
  };
}

function emptyMap<T extends object>(): T {
  // eslint-disable-next-line typescript/consistent-type-assertions -- A machine without actions or actors gets the default Record<never, never>, which the empty object satisfies.
  return {} as T;
}
