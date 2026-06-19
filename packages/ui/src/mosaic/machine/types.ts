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

export type Actions<TContext, TEvent extends EventObject> = Action<TContext, TEvent> | Action<TContext, TEvent>[];

/** The long form of a transition. */
export interface TransitionConfig<TContext, TEvent extends EventObject, TStates extends string = string> {
  /** State to enter. Omit for an internal transition (runs actions, stays put). */
  target?: TStates;
  /** Actions to run during the transition, in order. */
  actions?: Actions<TContext, TEvent>;
  /** Only take this transition when the guard passes. */
  guard?: Guard<TContext, TEvent>;
}

/**
 * A transition may be a bare target string, a config object, or an array of
 * configs evaluated in order (first passing guard wins).
 */
export type Transition<TContext, TEvent extends EventObject, TStates extends string = string> =
  | TStates
  | TransitionConfig<TContext, TEvent, TStates>
  | TransitionConfig<TContext, TEvent, TStates>[];

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

/** Invoke a promise on state entry and branch on its settlement. */
export interface InvokeConfig<
  TContext,
  TEvent extends EventObject,
  TOutput = unknown,
  TStates extends string = string,
> {
  /** Started on entry. The resolved value lands on `onDone` events as `output`. */
  src: (context: TContext, event: TEvent | DoneInvokeEvent | ErrorInvokeEvent) => Promise<TOutput>;
  onDone?: Transition<TContext, DoneInvokeEvent<TOutput>, TStates>;
  onError?: Transition<TContext, ErrorInvokeEvent, TStates>;
}

export interface StateConfig<TContext, TEvent extends EventObject, TStates extends string = string> {
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
   * A raw `src` function is also accepted — `e.output` is `any` in that case.
   */
  invoke?: InvokeConfig<TContext, TEvent, any, TStates>;
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

export interface MachineConfig<TContext, TEvent extends EventObject, TStates extends string = string> {
  id?: string;
  initial: TStates | InitialResolver<TContext, TStates>;
  context?: TContext;
  states: Record<TStates, StateConfig<TContext, TEvent, TStates>>;
}

/**
 * The static, runnable-instance-free machine definition returned by
 * {@link createMachine}. `states` is exposed so docs/tests can enumerate every
 * step without running anything.
 */
export interface StateMachine<TContext, TEvent extends EventObject> {
  id: string | undefined;
  initial: string | InitialResolver<TContext>;
  context: TContext;
  states: Record<string, StateConfig<TContext, TEvent>>;
  config: MachineConfig<TContext, TEvent>;
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
