/**
 * Shared types for the Mosaic state-machine library.
 *
 * A machine is a static config object (so it is introspectable — see {@link StateMachine.states})
 * trimmed to a tiny, dependency-free core: flat states only, with no nested or parallel states,
 * history, or spawned actors.
 */

/** The minimum shape every event must have. */
export interface EventObject {
  type: string;
}

/** A loosely-typed event accepted by `send`/`can` (e.g. `{ type: 'TYPE', value: 'foo' }`). */
export interface AnyEventObject extends EventObject {
  [key: string]: unknown;
}

export type AnyFunction = (...args: never[]) => unknown;

export type ActionMap = Record<string, AnyFunction>;

export interface AsyncArgs<TInput> {
  input: TInput;
  signal: AbortSignal;
}

export interface AsyncLogic<TInput, TOutput> {
  run: (args: AsyncArgs<TInput>) => Promise<TOutput>;
}

export type ActorMap = Record<string, AsyncLogic<never, unknown>>;

export type InputOf<TLogic> = TLogic extends AsyncLogic<infer TInput, unknown> ? TInput : never;
export type OutputOf<TLogic> = TLogic extends AsyncLogic<never, infer TOutput> ? TOutput : never;

export type Enqueue = <TArgs extends unknown[]>(fn: (...args: TArgs) => unknown, ...args: TArgs) => void;

export interface ActorRef<TContext, TEvent extends EventObject> {
  send: (event: TEvent | RouteEvent) => void;
  getSnapshot: () => Snapshot<TContext, string, TEvent>;
}

export interface TransitionArgs<
  TContext,
  TEvent extends EventObject,
  TActions extends ActionMap = ActionMap,
  TMachineEvent extends EventObject = TEvent,
> {
  context: TContext;
  event: TEvent;
  self: ActorRef<TContext, TMachineEvent>;
  actions: TActions;
}

/** What an inline transition function returns. `undefined` means the event is unhandled. */
export interface TransitionResult<TContext, TStates extends string = string> {
  /** State to enter. Omit for an internal transition (updates context, stays put). */
  target?: NoInfer<TStates>;
  /** Shallow context patch applied after the transition. */
  context?: Partial<TContext>;
  /**
   * Exit and enter `target` again when it is the current state, restarting its invoke and
   * `after` timers. Without it, a transition to the current state stays put.
   */
  reenter?: boolean;
}

export type TransitionFn<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TActions extends ActionMap = ActionMap,
  TMachineEvent extends EventObject = TEvent,
> = (
  args: TransitionArgs<TContext, TEvent, TActions, TMachineEvent>,
  enq: Enqueue,
) => TransitionResult<TContext, TStates> | undefined | void;

export type Transition<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TActions extends ActionMap = ActionMap,
  TMachineEvent extends EventObject = TEvent,
> = { target: NoInfer<TStates>; reenter?: boolean } | TransitionFn<TContext, TEvent, TStates, TActions, TMachineEvent>;

export type EntryExitFn<TContext, TEvent extends EventObject, TActions extends ActionMap = ActionMap> = (
  args: TransitionArgs<TContext, EventObject, TActions, TEvent>,
  enq: Enqueue,
) => { context?: Partial<TContext> } | undefined | void;

/** The event type fired when an invoked promise resolves. */
export const INVOKE_DONE = 'machine.invoke.done';
/** The event type fired when an invoked promise rejects. */
export const INVOKE_ERROR = 'machine.invoke.error';
/** The event delivered to a state on entry (and to the initial state on start). */
export const INIT = 'machine.init';
/** The event type delivered to an `after` transition when its timer fires. */
export const AFTER = 'machine.after';
export const ROUTE = 'machine.route';

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

export interface RouteEvent extends EventObject {
  type: typeof ROUTE;
  to: `#${string}`;
}

export interface InputArgs<TContext, TEvent extends EventObject> {
  context: TContext;
  event: EventObject;
  self: ActorRef<TContext, TEvent>;
}

export interface SettledInvoke<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TActions extends ActionMap = ActionMap,
> {
  event: DoneInvokeEvent | ErrorInvokeEvent;
  transition: Transition<TContext, EventObject, TStates, TActions, TEvent> | undefined;
}

export interface CreatedInvoke<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TActions extends ActionMap = ActionMap,
> {
  run: (
    args: InputArgs<TContext, TEvent>,
    signal: AbortSignal,
    settle: (settled: SettledInvoke<TContext, TEvent, TStates, TActions>) => void,
  ) => void;
}

type NamedInvoke<
  TContext,
  TEvent extends EventObject,
  TStates extends string,
  TActions extends ActionMap,
  TActors extends ActorMap,
> = {
  [K in keyof TActors & string]: {
    src: K;
    onDone?: Transition<TContext, DoneInvokeEvent<OutputOf<TActors[K]>>, TStates, TActions, TEvent>;
    onError?: Transition<TContext, ErrorInvokeEvent, TStates, TActions, TEvent>;
  } & ({ input: (args: InputArgs<TContext, TEvent>) => InputOf<TActors[K]> } | OptionalInput<InputOf<TActors[K]>>);
}[keyof TActors & string];

type OptionalInput<TInput> = undefined extends TInput ? { input?: undefined } : never;

export type Invoke<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TActions extends ActionMap = ActionMap,
  TActors extends ActorMap = ActorMap,
> = NamedInvoke<TContext, TEvent, TStates, TActions, TActors> | CreatedInvoke<TContext, TEvent, TStates, TActions>;

export type ChoiceFn<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TActions extends ActionMap = ActionMap,
> = (args: TransitionArgs<TContext, EventObject, TActions, TEvent>) => { target: NoInfer<TStates> };

export type RouteFn<TContext, TEvent extends EventObject, TActions extends ActionMap = ActionMap> = (
  args: TransitionArgs<TContext, RouteEvent, TActions, TEvent>,
) => boolean | { context?: Partial<TContext> } | undefined;

export interface StateConfig<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TActions extends ActionMap = ActionMap,
  TActors extends ActorMap = ActorMap,
> {
  id?: string;
  /**
   * Event-name → transition map. Each key is constrained to `TEvent['type']`
   * and the transition receives the narrowed event member —
   * e.g. a transition under `on['SUBMIT']` sees `Extract<TEvent, { type: 'SUBMIT' }>`,
   * not the full union.
   */
  on?: {
    [K in TEvent['type']]?: Transition<TContext, Extract<TEvent, { type: K }>, TStates, TActions, TEvent>;
  };
  /**
   * Eventless transition, checked after the state's entry and again after any transition that
   * stays in the state, whether or not it changes context. An event the state does not handle
   * skips it. A result with only `context` is applied and
   * `always` is checked again, until it targets a state or stops changing context. When it
   * leaves on entry, this state's invoke and `after` timers never start.
   */
  always?: TransitionFn<TContext, EventObject, TStates, TActions, TEvent>;
  /**
   * Delayed transitions, keyed by delay in milliseconds. The timers start when the state
   * is entered. Any transition that leaves the state clears them. One back into this state
   * keeps them running, unless it sets `reenter`, which starts them again. `stop()` pauses
   * them and `start()` restarts them from the full delay.
   */
  after?: { [delay: number]: Transition<TContext, AfterEvent, TStates, TActions, TEvent> };
  invoke?: Invoke<TContext, TEvent, TStates, TActions, TActors>;
  entry?: EntryExitFn<TContext, TEvent, TActions>;
  exit?: EntryExitFn<TContext, TEvent, TActions>;
  route?: RouteFn<TContext, TEvent, TActions> | { context?: Partial<TContext> };
  type?: 'final' | 'choice';
  choice?: ChoiceFn<TContext, TEvent, TStates, TActions>;
}

export interface MachineConfig<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TActions extends ActionMap = ActionMap,
  TActors extends ActorMap = ActorMap,
  TInput = undefined,
> {
  id?: string;
  initial: NoInfer<TStates>;
  context: TContext | ((args: { input: TInput }) => TContext);
  actions?: TActions;
  actors?: TActors;
  states: Record<TStates, StateConfig<TContext, TEvent, NoInfer<TStates>, NoInfer<TActions>, NoInfer<TActors>>>;
}

export interface Implementations<TActions extends ActionMap, TActors extends ActorMap> {
  actions?: Partial<TActions>;
  actors?: Partial<TActors>;
}

/**
 * The static machine definition returned by {@link createMachine}. `states` is exposed so
 * docs and tests can enumerate every step without running anything.
 */
export interface StateMachine<
  TContext,
  TEvent extends EventObject,
  TStates extends string = string,
  TActions extends ActionMap = ActionMap,
  TActors extends ActorMap = ActorMap,
  TInput = undefined,
> {
  id: string | undefined;
  initial: TStates;
  states: Record<TStates, StateConfig<TContext, TEvent, TStates, TActions, TActors>>;
  config: MachineConfig<TContext, TEvent, TStates, TActions, TActors, TInput>;
  implementations: { actions: TActions; actors: TActors };
  provide: (
    implementations: Implementations<TActions, TActors>,
  ) => StateMachine<TContext, TEvent, TStates, TActions, TActors, TInput>;
  resolveState: (state: { value: TStates; context: TContext }) => PersistedSnapshot<TContext, TStates>;
}

export type ActorStatus = 'active' | 'done' | 'stopped';

export interface PersistedSnapshot<TContext, TStates extends string = string> {
  value: TStates;
  context: TContext;
  status: ActorStatus;
}

/** A point-in-time view of a running actor. */
export interface Snapshot<
  TContext,
  TStates extends string = string,
  TEvent extends EventObject = EventObject,
> extends PersistedSnapshot<TContext, TStates> {
  can(event: TEvent | RouteEvent): boolean;
}

/** A subscriber receives the latest snapshot on every transition. */
export type SnapshotListener<TContext, TStates extends string = string, TEvent extends EventObject = EventObject> = (
  snapshot: Snapshot<TContext, TStates, TEvent>,
) => void;

/** Standard observable contract: `subscribe` returns its own unsubscribe fn. */
export type Unsubscribe = () => void;

export interface Actor<TContext, TEvent extends EventObject, TStates extends string = string> {
  /**
   * Enter the initial state (entry, `always`, invoke and `after` timers), then apply the
   * events sent before this first start, in order. After a `stop()`, resume in the current
   * state instead: restart its `after` timers from the full delay, then apply the invoke
   * results and events that arrived while stopped, in arrival order. An invoke that was
   * running across the stop is not restarted. Does nothing while already started.
   */
  start: () => Actor<TContext, TEvent, TStates>;
  /**
   * Stop the actor, pausing its `after` timers and holding in-flight invoke results and sent
   * events for a later `start()`. Subscribers get the stopped snapshot once, then all are removed.
   */
  stop: () => void;
  /** Send an event. Ignored once the actor is `done`; queued until `start()` before the first start and while `stopped`. */
  send: (event: TEvent | RouteEvent) => void;
  getSnapshot: () => Snapshot<TContext, TStates, TEvent>;
  /** Subscribe to snapshots; returns an unsubscribe fn (usable with `useSyncExternalStore`). */
  subscribe: (listener: SnapshotListener<TContext, TStates, TEvent>) => Unsubscribe;
}

export interface CreateActorOptions<TInput> {
  input?: TInput;
}
