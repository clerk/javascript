/**
 * Shared types for the Mosaic state-machine library.
 *
 * The design mirrors XState v5's config-object shape (so a machine is statically
 * introspectable — see {@link StateMachine.states}) but is trimmed to a tiny,
 * dependency-free core: no parallel states, history, delayed transitions, SCXML,
 * or spawned actors.
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
export interface TransitionConfig<TContext, TEvent extends EventObject> {
  /** State to enter. Omit for an internal transition (runs actions, stays put). */
  target?: string;
  /** Actions to run during the transition, in order. */
  actions?: Actions<TContext, TEvent>;
  /** Only take this transition when the guard passes. */
  guard?: Guard<TContext, TEvent>;
}

/**
 * A transition may be a bare target string, a config object, or an array of
 * configs evaluated in order (first passing guard wins).
 */
export type Transition<TContext, TEvent extends EventObject> =
  | string
  | TransitionConfig<TContext, TEvent>
  | TransitionConfig<TContext, TEvent>[];

/** The event type fired when an invoked promise resolves. */
export const INVOKE_DONE = 'machine.invoke.done';
/** The event type fired when an invoked promise rejects. */
export const INVOKE_ERROR = 'machine.invoke.error';
/** The event delivered to a state on entry (and to the initial state on start). */
export const INIT = 'machine.init';

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

/** Invoke a promise on state entry and branch on its settlement. */
export interface InvokeConfig<TContext, TEvent extends EventObject, TOutput = unknown> {
  /** Started on entry. The resolved value lands on `onDone` events as `output`. */
  src: (context: TContext, event: TEvent | DoneInvokeEvent | ErrorInvokeEvent) => Promise<TOutput>;
  onDone?: Transition<TContext, DoneInvokeEvent<TOutput>>;
  onError?: Transition<TContext, ErrorInvokeEvent>;
}

export interface StateConfig<TContext, TEvent extends EventObject> {
  /** Event-name → transition map. */
  on?: Record<string, Transition<TContext, TEvent>>;
  /** Eventless / immediate transitions, evaluated on entry. */
  always?: Transition<TContext, TEvent>;
  /** A promise to invoke on entry. */
  invoke?: InvokeConfig<TContext, TEvent>;
  /** Actions run when the state is entered. */
  entry?: Actions<TContext, TEvent>;
  /** Actions run when the state is exited. */
  exit?: Actions<TContext, TEvent>;
  /** A terminal state — no further events are processed once reached. */
  type?: 'final';
}

export interface MachineConfig<TContext, TEvent extends EventObject> {
  id?: string;
  initial: string;
  context?: TContext;
  states: Record<string, StateConfig<TContext, TEvent>>;
}

/**
 * The static, runnable-instance-free machine definition returned by
 * {@link createMachine}. `states` is exposed so docs/tests can enumerate every
 * step without running anything.
 */
export interface StateMachine<TContext, TEvent extends EventObject> {
  id: string | undefined;
  initial: string;
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
  send: (event: TEvent | AnyEventObject) => void;
  getSnapshot: () => Snapshot<TContext>;
  /** Subscribe to snapshots; returns an unsubscribe fn (usable with `useSyncExternalStore`). */
  subscribe: (listener: SnapshotListener<TContext>) => Unsubscribe;
  /** Whether the event would be handled (a guard-passing transition exists) right now. */
  can: (event: TEvent | AnyEventObject) => boolean;
}

export interface CreateActorOptions<TContext> {
  /**
   * Start the actor teleported to this snapshot instead of the machine's
   * initial state. Used by {@link mockActor} — the actor is inert (no entry
   * actions, immediates, or invokes run for the teleported state).
   */
  snapshot?: { value: string; context?: Partial<TContext> };
}
