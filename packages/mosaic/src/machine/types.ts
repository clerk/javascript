/**
 * Shared types for the Mosaic state-machine library.
 *
 * The design mirrors XState v5's config-object shape (so a machine is statically
 * introspectable — see {@link StateMachine.states}) but is trimmed to a tiny,
 * dependency-free core: no parallel states, history, SCXML, or spawned actors.
 */

/** The minimum shape every event must have. */
export interface EventObject {
  type: string;
}

/** A loosely-typed event accepted by `send`/`can` (e.g. `{ type: 'TYPE', value: 'foo' }`). */
export interface AnyEventObject extends EventObject {
  [key: string]: unknown;
}

/** Pure predicate that gates a transition. */
export type Guard<TContext, TEvent extends EventObject> = (context: TContext, event: TEvent) => boolean;

/** A side-effecting action — runs for its effect, returns nothing. */
export type ActionFunction<TContext, TEvent extends EventObject, TParams = undefined> = (
  context: TContext,
  event: TEvent,
  params: TParams,
) => void;

/** Internal tag identifying an {@link assign} action. A symbol so it can never collide with a user value. */
export const ASSIGN = Symbol('assign');

/**
 * The object produced by {@link assign}. Tagged so the runtime can tell a
 * context-updating action apart from a plain side-effect action.
 */
export interface AssignAction<TContext, TEvent extends EventObject, TParams = undefined> {
  type: typeof ASSIGN;
  assignment: (context: TContext, event: TEvent, params: TParams) => Partial<TContext>;
}

/** Either a side-effect or an `assign` context update. */
export type Action<TContext, TEvent extends EventObject, TParams = undefined> =
  | ActionFunction<TContext, TEvent, TParams>
  | AssignAction<TContext, TEvent, TParams>;

/**
 * The names a machine's config may reference, keyed by implementation kind.
 * `actorOutputs` maps each actor name to the value its promise resolves with;
 * only {@link StateMachine.provide} reads it.
 */
export interface ImplementationRefs {
  guards: string;
  actions: string;
  actors: string;
  actionParams: Record<string, unknown>;
  actorOutputs: Record<string, unknown>;
}

/** No named implementations: only inline guards, actions and `src` functions are accepted. */
export interface NoImplementationRefs {
  guards: never;
  actions: never;
  actors: never;
  actionParams: Record<never, never>;
  actorOutputs: Record<never, never>;
}

/** Any named implementations. The default for {@link StateMachine}, so every machine is assignable to it. */
export interface AnyImplementationRefs {
  guards: string;
  actions: string;
  actors: string;
  actionParams: Record<string, any>;
  actorOutputs: Record<string, unknown>;
}

export type GuardRef<TContext, TEvent extends EventObject, TRefs extends ImplementationRefs = NoImplementationRefs> =
  | Guard<TContext, TEvent>
  | TRefs['guards'];

/** A named action with the params its implementation receives. Mirrors XState v5's `{ type, params }`. */
export type ParameterizedActionRef<TContext, TEvent extends EventObject, TRefs extends ImplementationRefs> = {
  [K in TRefs['actions']]: {
    type: K;
    params: TRefs['actionParams'][K] | ((context: TContext, event: TEvent) => TRefs['actionParams'][K]);
  };
}[TRefs['actions']];

type ParamlessActionName<TRefs extends ImplementationRefs> = {
  [K in TRefs['actions']]: undefined extends TRefs['actionParams'][K] ? K : never;
}[TRefs['actions']];

export type ActionRef<TContext, TEvent extends EventObject, TRefs extends ImplementationRefs = NoImplementationRefs> =
  | Action<TContext, TEvent>
  | ParamlessActionName<TRefs>
  | ParameterizedActionRef<TContext, TEvent, TRefs>;

export type Actions<TContext, TEvent extends EventObject, TRefs extends ImplementationRefs = NoImplementationRefs> =
  | ActionRef<TContext, TEvent, TRefs>
  | ActionRef<TContext, TEvent, TRefs>[];

/** The long form of a transition. */
export interface TransitionConfig<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TRefs extends ImplementationRefs = NoImplementationRefs,
> {
  /** State to enter. Omit for an internal transition (runs actions, stays put). */
  target?: TStates;
  /** Actions to run during the transition, in order. */
  actions?: Actions<TContext, TEvent, TRefs>;
  /** Only take this transition when the guard passes. */
  guard?: GuardRef<TContext, TEvent, TRefs>;
}

/** What an inline transition function returns. `undefined` means the event is unhandled. */
export interface TransitionResult<TContext, TStates extends string = string> {
  /** State to enter. Omit for an internal transition (updates context, stays put). */
  target?: TStates;
  /** Shallow context patch applied after the transition. */
  context?: Partial<TContext>;
}

/**
 * Inline transition function. Replaces the `guard` + `actions: [assign(...)]`
 * combo for the common case. Returning `undefined` means the event is unhandled
 * (equivalent to a failing guard).
 */
export type TransitionFn<TContext, TEvent extends EventObject, TStates extends string = string> = (args: {
  context: TContext;
  event: TEvent;
}) => TransitionResult<TContext, TStates> | undefined;

/**
 * A transition may be a bare target string, a config object, an array of
 * configs evaluated in order (first passing guard wins), or an inline function.
 */
export type Transition<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TRefs extends ImplementationRefs = NoImplementationRefs,
> =
  | TStates
  | TransitionConfig<TContext, TEvent, TStates, TRefs>
  | TransitionConfig<TContext, TEvent, TStates, TRefs>[]
  | TransitionFn<TContext, TEvent, TStates>;

/** The event type fired when an invoked promise resolves. */
export const INVOKE_DONE = 'machine.invoke.done';
/** The event type fired when an invoked promise rejects. */
export const INVOKE_ERROR = 'machine.invoke.error';
/** The event delivered to a state on entry (and to the initial state on start). */
export const INIT = 'machine.init';
/** The event delivered to guards when {@link Actor.recheck} re-evaluates `always` transitions. */
export const RECHECK = 'machine.recheck';
/** The event type delivered to an `after` transition when its timer fires. */
export const AFTER = 'machine.after';

/** Event delivered to `onDone` when an invoked promise resolves. */
export interface DoneInvokeEvent<TOutput = unknown> extends EventObject {
  type: typeof INVOKE_DONE;
  output: TOutput;
}

/** Event delivered to `onError` when an invoked promise rejects. */
export interface ErrorInvokeEvent extends EventObject {
  type: typeof INVOKE_ERROR;
  error: unknown;
}

/** Event delivered to an `after` transition when its timer fires. */
export interface AfterEvent extends EventObject {
  type: typeof AFTER;
  delay: number;
}

/** A promise-returning function started when a state is entered. */
export type ActorSrc<TContext, TEvent extends EventObject, TOutput = unknown> = (
  context: TContext,
  event: TEvent | DoneInvokeEvent | ErrorInvokeEvent,
) => Promise<TOutput>;

/** Invoke a promise on state entry and branch on its settlement. */
export interface InvokeConfig<
  TContext,
  TEvent extends EventObject,
  TOutput = unknown,
  TStates extends string = string,
  TRefs extends ImplementationRefs = NoImplementationRefs,
> {
  /**
   * Started on entry. The resolved value lands on `onDone` events as `output`.
   * A name resolves through the machine's `actors` implementations.
   */
  src: ActorSrc<TContext, TEvent, TOutput> | TRefs['actors'];
  onDone?: Transition<TContext, DoneInvokeEvent<TOutput>, TStates, TRefs>;
  onError?: Transition<TContext, ErrorInvokeEvent, TStates, TRefs>;
}

export interface StateConfig<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TRefs extends ImplementationRefs = NoImplementationRefs,
> {
  /**
   * Entry precondition — "may navigation LAND on this state right now?". Checked
   * uniformly by *every* transition (and the derived initial) that targets this
   * state: when it fails, the transition is a true no-op (snapshot unchanged, no
   * notify). Distinct from a transition `guard`, which gates a single edge. An
   * omitted entry guard means "always enterable". Often reads live external data
   * via closure rather than `context` — pair with {@link Actor.recheck}.
   */
  guard?: GuardRef<TContext, TEvent, TRefs>;
  /**
   * Event-name → transition map. Each key is constrained to `TEvent['type']`
   * and the transition's guards/actions receive the narrowed event member —
   * e.g. a guard under `on['SUBMIT']` sees `Extract<TEvent, { type: 'SUBMIT' }>`,
   * not the full union.
   */
  on?: { [K in TEvent['type']]?: Transition<TContext, Extract<TEvent, { type: K }>, TStates, TRefs> };
  /** Eventless / immediate transitions, evaluated on entry and on {@link Actor.recheck}. */
  always?: Transition<TContext, TEvent, TStates, TRefs>;
  /**
   * Delayed transitions — each key is a delay in milliseconds. The matching
   * transition fires automatically after the delay unless the state is exited
   * first (by an explicit event, `always`, or `invoke`). Timers are cancelled
   * on exit and on `stop()`, so they never outlive the state or the actor.
   *
   * ```ts
   * codeSent: {
   *   after: { 60_000: 'expired' },
   *   on: { SUBMIT: 'verifying' },
   * }
   * ```
   */
  after?: { [delay: number]: Transition<TContext, AfterEvent, TStates, TRefs> };
  /**
   * A promise to invoke on entry. Use {@link PromiseSrc} (created by
   * `setup().fromPromise`) to carry the resolved type to `onDone.actions`.
   * A raw `src` function is also accepted — `e.output` is `any` in that case.
   */
  invoke?: InvokeConfig<TContext, TEvent, any, TStates, TRefs>;
  /** Actions run when the state is entered. */
  entry?: Actions<TContext, TEvent, TRefs>;
  /** Actions run when the state is exited. */
  exit?: Actions<TContext, TEvent, TRefs>;
  /** A terminal state — no further events are processed once reached. */
  type?: 'final';
}

/**
 * The initial state may be a static id or derived from context at start time
 * (e.g. the Wizard computes the "furthest-reachable" step from its entry guards).
 */
export type InitialResolver<TContext, TStates extends string = string> = (context: TContext) => TStates;

export interface MachineConfig<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TRefs extends ImplementationRefs = NoImplementationRefs,
> {
  id?: string;
  initial: TStates | InitialResolver<TContext, TStates>;
  context?: TContext;
  states: Record<TStates, StateConfig<TContext, TEvent, TStates, TRefs>>;
}

/**
 * The implementations a machine resolves named references against at
 * evaluation time. Every kind is partial: a missing name throws when used.
 */
export interface MachineImplementations<TContext, TEvent extends EventObject> {
  guards: Partial<Record<string, Guard<TContext, TEvent>>>;
  actions: Partial<Record<string, Action<TContext, TEvent, never>>>;
  actors: Partial<Record<string, ActorSrc<TContext, TEvent>>>;
}

/** An empty name set is `{}`, which skips excess-property checks; reject every key instead. */
type KnownKeysOnly<TKeys extends string, TMap> = [TKeys] extends [never] ? Partial<Record<string, never>> : TMap;

/** What {@link StateMachine.provide} accepts: any subset of the existing names, with matching signatures. */
export interface ProvidedImplementations<TContext, TEvent extends EventObject, TRefs extends ImplementationRefs> {
  guards?: KnownKeysOnly<TRefs['guards'], { [K in TRefs['guards']]?: Guard<TContext, TEvent> }>;
  actions?: KnownKeysOnly<
    TRefs['actions'],
    { [K in TRefs['actions']]?: Action<TContext, TEvent, TRefs['actionParams'][K]> }
  >;
  actors?: KnownKeysOnly<
    TRefs['actors'],
    { [K in TRefs['actors']]?: ActorSrc<TContext, TEvent, TRefs['actorOutputs'][K]> }
  >;
}

/**
 * The static, runnable-instance-free machine definition returned by
 * {@link createMachine}. `states` is exposed so docs/tests can enumerate every
 * step without running anything.
 */
export interface StateMachine<
  TContext,
  TEvent extends EventObject,
  TRefs extends ImplementationRefs = AnyImplementationRefs,
> {
  id: string | undefined;
  initial: string | InitialResolver<TContext>;
  context: TContext;
  states: Record<string, StateConfig<TContext, TEvent, string, TRefs>>;
  config: MachineConfig<TContext, TEvent, string, TRefs>;
  implementations: MachineImplementations<TContext, TEvent>;
  /** A new machine with the same config and these implementations merged over the current ones. */
  provide(implementations: ProvidedImplementations<TContext, TEvent, TRefs>): StateMachine<TContext, TEvent, TRefs>;
}

export type ActorStatus = 'active' | 'done' | 'stopped';

/** A point-in-time view of a running actor. */
export interface Snapshot<TContext> {
  value: string;
  context: TContext;
  status: ActorStatus;
}

/** A subscriber receives the latest snapshot on every transition. */
export type SnapshotListener<TContext> = (snapshot: Snapshot<TContext>) => void;

/** Standard observable contract: `subscribe` returns its own unsubscribe fn. */
export type Unsubscribe = () => void;

export interface Actor<TContext, TEvent extends EventObject> {
  /** The machine this actor runs. Named guards, actions and `src` resolve through its `implementations` when used. */
  logic: StateMachine<TContext, TEvent>;
  /** Run entry actions / immediate transitions / invokes of the initial state. */
  start: () => Actor<TContext, TEvent>;
  /** Stop the actor and abandon any in-flight invoke. */
  stop: () => void;
  /** Send an event. Ignored once the actor is `done` or `stopped`. */
  send: (event: TEvent) => void;
  getSnapshot: () => Snapshot<TContext>;
  /** Subscribe to snapshots; returns an unsubscribe fn (usable with `useSyncExternalStore`). */
  subscribe: (listener: SnapshotListener<TContext>) => Unsubscribe;
  /** Whether the event would be handled (a guard-passing, enterable transition exists) right now. */
  can: (event: TEvent) => boolean;
  /**
   * Silently merge a partial context patch into the running actor — no snapshot
   * emitted, no transitions triggered. Use this to keep injected dependencies
   * (e.g. an async function from a React prop) current without restarting the actor.
   * Patches survive a stop/start cycle (e.g. React StrictMode).
   */
  setContext: (patch: Partial<TContext>) => void;
  /**
   * Re-evaluate the current state against live data. Call this when external data
   * a guard reads (an SWR cache, a store) has changed, so the machine can
   * self-correct:
   *  - if the *current* state's entry guard no longer holds, re-seat to the
   *    freshly resolved initial state (e.g. the Wizard's furthest-reachable step);
   *  - otherwise re-run the current state's `always` transitions, resolving one
   *    that was parked waiting on the now-arrived data.
   * A no-op (no notify) when the current state is still enterable and no `always`
   * transition applies.
   */
  recheck: () => void;
}

export interface CreateActorOptions<TContext> {
  /**
   * Runtime context merged over machine defaults at actor creation time.
   * Use this to inject dependencies (e.g. an async function from a hook)
   * without putting them in the module-level machine definition.
   * Snapshot context takes precedence when both are provided.
   */
  context?: Partial<TContext>;
  /**
   * Start the actor teleported to this snapshot instead of the machine's
   * initial state. Used by {@link mockActor} — the actor is inert (no entry
   * actions, immediates, or invokes run for the teleported state).
   */
  snapshot?: { value: string; context?: Partial<TContext> };
}
