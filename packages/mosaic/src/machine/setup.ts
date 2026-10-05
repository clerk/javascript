import { assign as _assign } from './assign';
import { createMachine as _createMachine } from './create-machine';
import type {
  ActorSrc,
  AssignAction,
  DoneInvokeEvent,
  ErrorInvokeEvent,
  EventObject,
  ImplementationRefs,
  InvokeConfig,
  MachineConfig,
  MachineImplementations,
  NoImplementationRefs,
  StateMachine,
  Transition,
} from './types';

/** The refs of a setup after `extend` adds more named implementations. */
type ExtendedRefs<TRefs extends ImplementationRefs, TActors> = {
  actors: TRefs['actors'] | (keyof TActors & string);
  actorOutputs: Omit<TRefs['actorOutputs'], keyof TActors> & TActors;
};

export interface Setup<TContext extends object, TEvent extends EventObject, TRefs extends ImplementationRefs> {
  createMachine: <TStates extends string>(
    config: MachineConfig<TContext, TEvent, TStates, TRefs>,
  ) => StateMachine<TContext, TEvent, TStates, TRefs>;
  assign: <TEvt extends EventObject = EventObject>(
    fn: (context: TContext, event: TEvt) => Partial<TContext>,
  ) => AssignAction<TContext, TEvt>;
  fromPromise: ReturnType<typeof fromPromiseFor<TContext, TEvent>>;
  /** Register actors that the config can reference by name in `invoke.src`. */
  extend: <TActors extends Record<string, unknown>>(implementations: {
    actors: { [K in keyof TActors]: ActorSrc<TContext, TEvent, TActors[K]> };
  }) => Setup<TContext, TEvent, ExtendedRefs<TRefs, TActors>>;
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
  return withImplementations({ actors: {} });
}

function withImplementations<TContext extends object, TEvent extends EventObject, TRefs extends ImplementationRefs>(
  defaults: MachineImplementations<TContext, TEvent>,
): Setup<TContext, TEvent, TRefs> {
  return {
    createMachine: config => _createMachine(config, defaults),

    assign: fn => _assign(fn),

    /**
     * Wraps an async function so its resolved type flows into `onDone.actions`.
     * Mirrors XState v5's `fromPromise<TOutput>()` — a typed wrapper that carries
     * `TOutput` to `DoneInvokeEvent<TOutput>` without needing a full actor registry.
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
     * A raw `src` function (without `fromPromise`) still type-checks with `e.output: any`, so
     * `mosaic/no-raw-invoke` rejects it outside tests.
     */
    fromPromise: fromPromiseFor<TContext, TEvent>(),

    extend: implementations =>
      withImplementations({
        actors: { ...defaults.actors, ...implementations.actors },
      }),
  };
}

function fromPromiseFor<TContext extends object, TEvent extends EventObject>() {
  return <TOutput, const TDone extends string = never, const TError extends string = never>(
    fn: (context: TContext) => Promise<TOutput>,
    config?: {
      onDone?: InferredTransition<TContext, DoneInvokeEvent<TOutput>, TDone>;
      onError?: InferredTransition<TContext, ErrorInvokeEvent, TError>;
    },
  ) =>
    // SAFETY: fn only uses context (no event param), but InvokeConfig.src accepts
    // (context, event) for parity with state-entry event access. The extra event
    // parameter is unused; callers receive only context at runtime. The config's
    // inference slots are all forms of Transition.
    // eslint-disable-next-line typescript/consistent-type-assertions -- The machine runtime erases state and event types; its public generics enforce their relationship.
    ({ src: fn, ...config }) as unknown as InvokeConfig<TContext, TEvent, TOutput, TDone | TError>;
}

type InferredTransition<TContext, TEvent extends EventObject, TStates extends string> =
  | `${TStates}`
  | { target: TStates }
  | { target: TStates }[]
  | ((args: { context: TContext; event: TEvent }) => { target?: TStates; context?: Partial<TContext> } | undefined)
  | Transition<TContext, TEvent, TStates>;
