import { assign as _assign } from './assign';
import { createMachine as _createMachine } from './create-machine';
import type {
  Action,
  ActorSrc,
  AssignAction,
  DoneInvokeEvent,
  ErrorInvokeEvent,
  EventObject,
  Guard,
  ImplementationRefs,
  InvokeConfig,
  MachineConfig,
  MachineImplementations,
  NoImplementationRefs,
  StateMachine,
  Transition,
} from './types';

/** The refs of a setup after `extend` adds more named implementations. */
type ExtendedRefs<TRefs extends ImplementationRefs, TGuards, TActions, TActors> = {
  guards: TRefs['guards'] | (keyof TGuards & string);
  actions: TRefs['actions'] | (keyof TActions & string);
  actors: TRefs['actors'] | (keyof TActors & string);
  actionParams: Omit<TRefs['actionParams'], keyof TActions> & TActions;
  actorOutputs: Omit<TRefs['actorOutputs'], keyof TActors> & TActors;
};

export interface Setup<TContext extends object, TEvent extends EventObject, TRefs extends ImplementationRefs> {
  createMachine: (config: MachineConfig<TContext, TEvent, string, TRefs>) => StateMachine<TContext, TEvent, TRefs>;
  assign: <TEvt extends EventObject = EventObject, TParams = undefined>(
    fn: (context: TContext, event: TEvt, params: TParams) => Partial<TContext>,
  ) => AssignAction<TContext, TEvt, TParams>;
  fromPromise: <TOutput, TStates extends string = string>(
    fn: (context: TContext) => Promise<TOutput>,
    config?: {
      onDone?: Transition<TContext, DoneInvokeEvent<TOutput>, TStates, TRefs>;
      onError?: Transition<TContext, ErrorInvokeEvent, TStates, TRefs>;
    },
  ) => InvokeConfig<TContext, TEvent, TOutput, TStates, TRefs>;
  /** Register default implementations that the config can reference by name. */
  extend: <
    TGuards extends Record<string, unknown> = Record<never, never>,
    TActions extends Record<string, unknown> = Record<never, never>,
    TActors extends Record<string, unknown> = Record<never, never>,
  >(implementations: {
    guards?: { [K in keyof TGuards]: Guard<TContext, TEvent> };
    actions?: { [K in keyof TActions]: Action<TContext, TEvent, TActions[K]> };
    actors?: { [K in keyof TActors]: ActorSrc<TContext, TEvent, TActors[K]> };
  }) => Setup<TContext, TEvent, ExtendedRefs<TRefs, TGuards, TActions, TActors>>;
}

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
export function setup<TContext extends object, TEvent extends EventObject>(): Setup<
  TContext,
  TEvent,
  NoImplementationRefs
> {
  return withImplementations({ guards: {}, actions: {}, actors: {} });
}

function withImplementations<TContext extends object, TEvent extends EventObject, TRefs extends ImplementationRefs>(
  defaults: MachineImplementations<TContext, TEvent>,
): Setup<TContext, TEvent, TRefs> {
  return {
    createMachine: config => _createMachine(config, defaults),

    assign: fn => _assign(fn),

    /**
     * Wraps an async function so its resolved type flows into `onDone.actions`.
     *
     * ```ts
     * const { createMachine, assign, fromPromise } = setup<Ctx, Event>();
     *
     * states: {
     *   loading: {
     *     invoke: fromPromise(
     *       ctx => ctx.fetchFn(),                              // infers TOutput = Resource
     *       { onDone: { target: 'success',
     *                   actions: assign((_, e) => ({ data: e.output })) } }, // e.output: Resource ✓
     *     ),
     *   },
     * }
     * ```
     *
     * A raw `src` function (without `fromPromise`) still works — `e.output` is `any`.
     */
    fromPromise: <TOutput, TStates extends string = string>(
      fn: (context: TContext) => Promise<TOutput>,
      config?: {
        onDone?: Transition<TContext, DoneInvokeEvent<TOutput>, TStates, TRefs>;
        onError?: Transition<TContext, ErrorInvokeEvent, TStates, TRefs>;
      },
    ): InvokeConfig<TContext, TEvent, TOutput, TStates, TRefs> => ({
      src: fn as unknown as InvokeConfig<TContext, TEvent, TOutput, TStates, TRefs>['src'],
      ...config,
    }),

    extend: implementations =>
      withImplementations({
        guards: { ...defaults.guards, ...implementations.guards },
        actions: { ...defaults.actions, ...implementations.actions },
        actors: { ...defaults.actors, ...implementations.actors },
      }),
  };
}
