/**
 * Shared types for the Mosaic state-machine library.
 *
 * Machines are plain config objects, so they are statically introspectable
 * (see {@link StateMachine.states}). No parallel states, history, or spawned actors.
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
export type ActionFunction<TContext, TEvent extends EventObject> = (context: TContext, event: TEvent) => void;

/** Internal tag identifying an {@link assign} action. A symbol so it can never collide with a user value. */
export const ASSIGN = Symbol('assign');

/**
 * The object produced by {@link assign}. Tagged so the runtime can tell a
 * context-updating action apart from a plain side-effect action.
 */
export interface AssignAction<TContext, TEvent extends EventObject> {
  type: typeof ASSIGN;
  assignment: (context: TContext, event: TEvent) => Partial<TContext>;
}

/** Either a side-effect or an `assign` context update. */
export type Action<TContext, TEvent extends EventObject> =
  | ActionFunction<TContext, TEvent>
  | AssignAction<TContext, TEvent>;

/**
 * The names a machine's config may reference, keyed by implementation kind.
 * `actorOutputs` maps each actor name to the value its promise resolves with.
 */
export interface ImplementationRefs {
  actors: string;
  actorOutputs: Record<string, unknown>;
}

/** No named implementations: only inline `src` functions are accepted. */
export interface NoImplementationRefs {
  actors: never;
  actorOutputs: Record<never, never>;
}

/** Any named implementations. The default for {@link StateMachine}, so every machine is assignable to it. */
export interface AnyImplementationRefs {
  actors: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each named actor declares its own output type; `unknown` would reject every typed `onDone` handler when widened to this shape.
  actorOutputs: Record<string, any>;
}

export type Actions<TContext, TEvent extends EventObject> = Action<TContext, TEvent> | Action<TContext, TEvent>[];

/** The long form of a transition. */
export interface TransitionConfig<TContext, TEvent extends EventObject, TStates extends string = string> {
  /** State to enter. Omit for an internal transition (runs actions, stays put). */
  target?: NoInfer<TStates>;
  /** Actions to run during the transition, in order. */
  actions?: Actions<TContext, TEvent>;
  /** Only take this transition when the guard passes. */
  guard?: Guard<TContext, TEvent>;
}

/** What an inline transition function returns. `undefined` means the event is unhandled. */
export interface TransitionResult<TContext, TStates extends string = string> {
  /** State to enter. Omit for an internal transition (updates context, stays put). */
  target?: NoInfer<TStates>;
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
export type Transition<TContext, TEvent extends EventObject, TStates extends string = string> =
  | NoInfer<TStates>
  | TransitionConfig<TContext, TEvent, TStates>
  | TransitionConfig<TContext, TEvent, TStates>[]
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
> {
  /** Started on entry. The resolved value lands on `onDone` events as `output`. */
  src: ActorSrc<TContext, TEvent, TOutput>;
  onDone?: Transition<TContext, DoneInvokeEvent<TOutput>, TStates>;
  onError?: Transition<TContext, ErrorInvokeEvent, TStates>;
}

/** Invoke an actor by name. `onDone` sees the output type that actor was registered with. */
export type NamedInvokeConfig<
  TContext,
  TStates extends string = string,
  TRefs extends ImplementationRefs = NoImplementationRefs,
> = {
  [K in TRefs['actors']]: {
    src: K;
    onDone?: Transition<TContext, DoneInvokeEvent<ResolvedOutput<TRefs['actorOutputs'][K]>>, TStates>;
    onError?: Transition<TContext, ErrorInvokeEvent, TStates>;
  };
}[TRefs['actors']];

type ResolvedOutput<TOutput> = [TOutput] extends [never] ? unknown : TOutput;

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
  guard?: Guard<TContext, TEvent>;
  /**
   * Event-name → transition map. Each key is constrained to `TEvent['type']`
   * and the transition's guards/actions receive the narrowed event member —
   * e.g. a guard under `on['SUBMIT']` sees `Extract<TEvent, { type: 'SUBMIT' }>`,
   * not the full union.
   */
  on?: { [K in TEvent['type']]?: Transition<TContext, Extract<TEvent, { type: K }>, TStates> };
  /** Eventless / immediate transitions, evaluated on entry and on {@link Actor.recheck}. */
  always?: Transition<TContext, TEvent, TStates>;
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
  after?: { [delay: number]: Transition<TContext, AfterEvent, TStates> };
  /**
   * A promise to invoke on entry. Use {@link PromiseSrc} (created by
   * `setup().fromPromise`) to carry the resolved type to `onDone.actions`.
   * A name from `setup().extend({ actors })` also carries its output type.
   * A raw `src` function is also accepted — `e.output` is `any` in that case, so
   * `mosaic/no-raw-invoke` rejects it outside tests.
   */
  invoke?:
    | NamedInvokeConfig<TContext, TStates, TRefs>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each state invokes its own output type, and TypeScript cannot express that per-state type here; `unknown` would reject typed `onDone` handlers.
    | InvokeConfig<TContext, TEvent, any, TStates>;
  /** Actions run when the state is entered. */
  entry?: Actions<TContext, TEvent>;
  /** Actions run when the state is exited. */
  exit?: Actions<TContext, TEvent>;
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
  initial: NoInfer<TStates> | InitialResolver<TContext, NoInfer<TStates>>;
  context?: TContext;
  states: Record<TStates, StateConfig<TContext, TEvent, NoInfer<TStates>, TRefs>>;
}

/**
 * The implementations a machine resolves named references against at
 * evaluation time. Every kind is partial: a missing name throws when used.
 */
export interface MachineImplementations<TContext, TEvent extends EventObject> {
  actors: Partial<Record<string, ActorSrc<TContext, TEvent>>>;
}

/**
 * The static, runnable-instance-free machine definition returned by
 * {@link createMachine}. `states` is exposed so docs/tests can enumerate every
 * step without running anything.
 */
export interface StateMachine<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TRefs extends ImplementationRefs = AnyImplementationRefs,
> {
  id: string | undefined;
  initial: TStates | InitialResolver<TContext, TStates>;
  context: TContext;
  states: Record<TStates, StateConfig<TContext, TEvent, TStates, TRefs>>;
  config: MachineConfig<TContext, TEvent, TStates, TRefs>;
  implementations: MachineImplementations<TContext, TEvent>;
}

export type ActorStatus = 'active' | 'done' | 'stopped';

/** A point-in-time view of a running actor. */
export interface Snapshot<TContext, TStates extends string = string> {
  value: TStates;
  context: TContext;
  status: ActorStatus;
}

/** A subscriber receives the latest snapshot on every transition. */
export type SnapshotListener<TContext, TStates extends string = string> = (
  snapshot: Snapshot<TContext, TStates>,
) => void;

/** Standard observable contract: `subscribe` returns its own unsubscribe fn. */
export type Unsubscribe = () => void;

export interface Actor<TContext, TEvent extends EventObject, TStates extends string = string> {
  /** The machine this actor runs. A named `src` resolves through its `implementations` when used. */
  logic: StateMachine<TContext, TEvent, TStates>;
  /**
   * Run entry actions / immediate transitions / invokes of the initial state,
   * then apply the events sent before this first start, in order. After a `stop()`, resume in the current state instead: re-arm its `after`
   * timers, then apply the invoke results and events that arrived while stopped,
   * in arrival order.
   */
  start: () => Actor<TContext, TEvent, TStates>;
  /** Stop the actor, pausing its `after` timers and holding in-flight invoke results and sent events for a later `start()`. */
  stop: () => void;
  /** Send an event. Ignored once the actor is `done`; queued until `start()` before the first start and while `stopped`. */
  send: (event: TEvent) => void;
  getSnapshot: () => Snapshot<TContext, TStates>;
  /** Subscribe to snapshots; returns an unsubscribe fn (usable with `useSyncExternalStore`). */
  subscribe: (listener: SnapshotListener<TContext, TStates>) => Unsubscribe;
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
   * a guard reads (a cache, a store) has changed, so the machine can
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

export interface CreateActorOptions<TContext, TStates extends string = string> {
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
  snapshot?: { value: TStates; context?: Partial<TContext> };
}
