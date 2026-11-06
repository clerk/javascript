import { logger } from '@clerk/shared/logger';

import type {
  ActionMap,
  Actor,
  ActorMap,
  ActorRef,
  ActorStatus,
  AfterEvent,
  AnyEventObject,
  AsyncLogic,
  CreateActorOptions,
  Enqueue,
  EventObject,
  InputArgs,
  PersistedSnapshot,
  RouteEvent,
  SettledInvoke,
  Snapshot,
  SnapshotListener,
  StateMachine,
  TransitionArgs,
  Unsubscribe,
} from './types';
import { AFTER, INIT, INVOKE_DONE, INVOKE_ERROR, ROUTE } from './types';

const INIT_EVENT: AnyEventObject = { type: INIT };

type Effect = () => void;

type RuntimeTransitionFn<TContext, TStates extends string> = (
  args: TransitionArgs<TContext, EventObject>,
  enq: Enqueue,
) => { target?: TStates; context?: Partial<TContext> } | undefined | void;

type RuntimeTransition<TContext, TStates extends string> = { target: TStates } | RuntimeTransitionFn<TContext, TStates>;

interface RuntimeInvoke<TContext, TStates extends string> {
  src?: string;
  input?: (args: InputArgs<TContext, EventObject>) => unknown;
  onDone?: RuntimeTransition<TContext, TStates>;
  onError?: RuntimeTransition<TContext, TStates>;
  run?: (
    args: InputArgs<TContext, EventObject>,
    signal: AbortSignal,
    settle: (settled: SettledInvoke<TContext, EventObject, TStates>) => void,
  ) => void;
}

interface RuntimeState<TContext, TStates extends string> {
  id?: string;
  on?: Record<string, RuntimeTransition<TContext, TStates> | undefined>;
  always?: RuntimeTransitionFn<TContext, TStates>;
  after?: Record<number, RuntimeTransition<TContext, TStates> | undefined>;
  invoke?: RuntimeInvoke<TContext, TStates>;
  entry?: RuntimeTransitionFn<TContext, TStates>;
  exit?: RuntimeTransitionFn<TContext, TStates>;
  route?:
    | ((args: TransitionArgs<TContext, EventObject>) => boolean | { context?: Partial<TContext> } | undefined)
    | { context?: Partial<TContext> };
  type?: 'final' | 'choice';
  choice?: (args: TransitionArgs<TContext, EventObject>) => { target: TStates };
}

interface RuntimeMachine<TContext, TStates extends string> {
  initial: TStates;
  states: Record<string, RuntimeState<TContext, TStates> | undefined>;
  config: { context: TContext | ((args: { input: unknown }) => TContext) };
  implementations: { actions: ActionMap; actors: Record<string, AsyncLogic<unknown, unknown> | undefined> };
}

interface Taken<TContext, TStates extends string> {
  target: TStates | undefined;
  context: Partial<TContext> | undefined;
  effects: Effect[];
}

interface At<TContext, TStates extends string> {
  value: TStates;
  context: TContext;
  status: ActorStatus;
}

interface AfterTimer {
  id: ReturnType<typeof setTimeout>;
  delay: number;
}

/**
 * Wrap a machine definition in a running instance (an "actor").
 *
 * Construction is lazy: the snapshot reflects the initial state, but entry,
 * immediate (`always`) transitions, and invokes don't run until
 * {@link Actor.start} is called.
 *
 * ```ts
 * const actor = createActor(machine);
 * actor.subscribe(snap => console.log(snap.value));
 * actor.start();
 * actor.send({ type: 'TOGGLE' });
 * ```
 */
export function createActor<
  TContext extends object,
  TEvent extends EventObject,
  TStates extends string,
  TActions extends ActionMap,
  TActors extends ActorMap,
  TInput,
>(
  machine: StateMachine<TContext, TEvent, TStates, TActions, TActors, TInput>,
  options: CreateActorOptions<TInput> = {},
): Actor<TContext, TEvent, TStates> {
  return runActor(machine, options.input, undefined);
}

/**
 * Create an actor seated in a snapshot from `machine.resolveState(...)`. Restoring runs
 * no entry, `always` or invoke for that state; `start()` then resumes it.
 *
 * ```ts
 * const actor = restoreActor(machine, machine.resolveState({ value: 'deleting', context })).start();
 * ```
 */
export function restoreActor<
  TContext extends object,
  TEvent extends EventObject,
  TStates extends string,
  TActions extends ActionMap,
  TActors extends ActorMap,
  TInput,
>(
  machine: StateMachine<TContext, TEvent, TStates, TActions, TActors, TInput>,
  snapshot: PersistedSnapshot<TContext, TStates>,
): Actor<TContext, TEvent, TStates> {
  return runActor(machine, undefined, snapshot);
}

function runActor<
  TContext extends object,
  TEvent extends EventObject,
  TStates extends string,
  TActions extends ActionMap,
  TActors extends ActorMap,
  TInput,
>(
  machine: StateMachine<TContext, TEvent, TStates, TActions, TActors, TInput>,
  input: TInput | undefined,
  restored: PersistedSnapshot<TContext, TStates> | undefined,
): Actor<TContext, TEvent, TStates> {
  // eslint-disable-next-line typescript/consistent-type-assertions -- The machine runtime erases state and event types; its public generics enforce their relationship.
  const logic = machine as unknown as RuntimeMachine<TContext, TStates>;
  const emptyState: RuntimeState<TContext, TStates> = {};
  const stateOf = (id: string): RuntimeState<TContext, TStates> => {
    const state = logic.states[id];
    if (state) {
      return state;
    }
    if (Object.keys(logic.states).length > 0) {
      logger.warnOnce(`[Clerk] Machine has no state "${id}".`);
    }
    return emptyState;
  };

  const self: ActorRef<TContext, EventObject> = {
    send: event => send(event),
    getSnapshot: () => snapshot,
  };
  const argsFor = <TArgEvent extends EventObject>(event: TArgEvent, at: { context: TContext }) => ({
    context: at.context,
    event,
    self,
    actions: logic.implementations.actions,
  });

  let context: TContext = restored ? restored.context : initialContext();
  let value: TStates = restored ? restored.value : resolveChoice(logic.initial, INIT_EVENT);
  let status: ActorStatus = restored ? restored.status : stateOf(value).type === 'final' ? 'done' : 'active';

  let started = false;
  let initialized = restored !== undefined;

  let invocationToken = 0;
  let invocationAbort: AbortController | undefined;
  const deferred: (() => boolean)[] = [];
  const mailbox: (() => boolean)[] = [];
  let processing = false;
  let effects: Effect[] = [];

  let afterTimers: AfterTimer[] = [];
  let pausedAfterTimers: AfterTimer[] = [];

  let snapshot: Snapshot<TContext, TStates, TEvent> = makeSnapshot();

  const listeners: SnapshotListener<TContext, TStates, TEvent>[] = [];

  function initialContext(): TContext {
    const source = logic.config.context;
    return isContextFn(source) ? source({ input }) : source;
  }

  function resolveChoice(id: TStates, event: EventObject): TStates {
    let current = id;
    for (let state = stateOf(current); state.type === 'choice' && state.choice; state = stateOf(current)) {
      current = state.choice(argsFor(event, { context })).target;
    }
    return current;
  }

  function makeSnapshot(): Snapshot<TContext, TStates, TEvent> {
    const at: At<TContext, TStates> = { value, context, status };
    return { ...at, can: (event: EventObject) => at.status === 'active' && evaluateEvent(event, at) !== undefined };
  }

  function evaluate(
    transition: RuntimeTransition<TContext, TStates> | undefined,
    event: EventObject,
    at: { context: TContext },
  ): Taken<TContext, TStates> | undefined {
    if (transition === undefined) {
      return undefined;
    }
    if (typeof transition !== 'function') {
      return { target: transition.target, context: undefined, effects: [] };
    }
    const queued: Effect[] = [];
    const enq: Enqueue = (fn, ...args) => {
      queued.push(() => fn(...args));
    };
    const result = transition(argsFor(event, at), enq);
    if (!result) {
      return queued.length === 0 ? undefined : { target: undefined, context: undefined, effects: queued };
    }
    return { target: result.target, context: result.context, effects: queued };
  }

  function evaluateRoute(event: EventObject, at: { context: TContext }): Taken<TContext, TStates> | undefined {
    if (!isRouteEvent(event)) {
      return undefined;
    }
    const id = event.to.slice(1);
    for (const target of Object.keys(machine.states)) {
      const { id: stateId, route } = stateOf(target);
      if (stateId !== id || route === undefined) {
        continue;
      }
      const allowed = typeof route === 'function' ? route(argsFor(event, at)) : route;
      if (!allowed || !isState(target)) {
        return undefined;
      }
      return { target, context: allowed === true ? undefined : allowed.context, effects: [] };
    }
    return undefined;
  }

  function isState(id: string): id is TStates {
    return id in machine.states;
  }

  function evaluateEvent(
    event: EventObject,
    at: { value: TStates; context: TContext },
  ): Taken<TContext, TStates> | undefined {
    return evaluate(stateOf(at.value).on?.[event.type], event, at) ?? evaluateRoute(event, at);
  }

  function runEntryExit(fn: RuntimeTransitionFn<TContext, TStates> | undefined, event: EventObject): void {
    const taken = evaluate(fn, event, { context });
    if (taken) {
      applyContext(taken.context);
      effects.push(...taken.effects);
    }
  }

  function applyContext(patch: Partial<TContext> | undefined): void {
    if (patch) {
      context = { ...context, ...patch };
    }
  }

  function takeTransition(taken: Taken<TContext, TStates>, event: EventObject): void {
    if (taken.target !== undefined) {
      runEntryExit(stateOf(value).exit, event);
      invocationToken++;
      invocationAbort?.abort();
      invocationAbort = undefined;
      clearAfterTimers();
    }
    const before = context;
    applyContext(taken.context);
    effects.push(...taken.effects);
    if (taken.target !== undefined) {
      value = resolveChoice(taken.target, event);
      enterState(event);
    } else if (context !== before) {
      takeAlways(event);
    }
  }

  function enterState(event: EventObject): void {
    const stateConfig = stateOf(value);
    runEntryExit(stateConfig.entry, event);

    if (stateConfig.type === 'final') {
      status = 'done';
      return;
    }

    if (takeAlways(event)) {
      return;
    }

    startInvoke(event);
    startAfterTimers();
  }

  function takeAlways(event: EventObject): boolean {
    for (;;) {
      const immediate = evaluate(stateOf(value).always, event, { context });
      if (!immediate) {
        return false;
      }
      if (immediate.target !== undefined) {
        takeTransition(immediate, event);
        return true;
      }
      const before = context;
      applyContext(immediate.context);
      effects.push(...immediate.effects);
      if (context === before) {
        return false;
      }
    }
  }

  function startInvoke(event: EventObject): void {
    const invoke = stateOf(value).invoke;
    if (!invoke) {
      return;
    }
    const token = ++invocationToken;
    const abort = new AbortController();
    invocationAbort = abort;
    const settle = ({ event: settledEvent, transition }: SettledInvoke<TContext, EventObject, TStates>) => {
      if (token !== invocationToken) {
        return;
      }
      const apply = () => {
        const taken = token === invocationToken ? evaluate(transition, settledEvent, { context }) : undefined;
        if (taken) {
          takeTransition(taken, settledEvent);
        }
        return taken !== undefined;
      };
      if (status === 'stopped') {
        deferred.push(apply);
      } else if (status === 'active') {
        process(apply);
      }
    };
    const onError = (error: unknown) => settle({ event: { type: INVOKE_ERROR, error }, transition: invoke.onError });
    const onDone = (output: unknown) => settle({ event: { type: INVOKE_DONE, output }, transition: invoke.onDone });
    try {
      runInvoke(invoke, { context, event, self }, abort.signal, settle, onDone, onError);
    } catch (error) {
      queueMicrotask(() => onError(error));
    }
  }

  function runInvoke(
    invoke: RuntimeInvoke<TContext, TStates>,
    args: InputArgs<TContext, EventObject>,
    signal: AbortSignal,
    settle: (settled: SettledInvoke<TContext, EventObject, TStates>) => void,
    onDone: (output: unknown) => void,
    onError: (error: unknown) => void,
  ): void {
    if (invoke.run) {
      invoke.run(args, signal, settle);
      return;
    }
    const named = invoke.src === undefined ? undefined : logic.implementations.actors[invoke.src];
    if (!named) {
      throw new Error(`[Clerk] Machine has no actor "${String(invoke.src)}".`);
    }
    named.run({ input: invoke.input?.(args), signal }).then(onDone, onError);
  }

  function clearAfterTimers(): void {
    for (const timer of afterTimers) {
      clearTimeout(timer.id);
    }
    afterTimers = [];
  }

  function startAfterTimers(): void {
    const afterConfig = stateOf(value).after;
    if (!afterConfig) {
      return;
    }
    for (const delay of Object.keys(afterConfig)) {
      scheduleAfterTimer(Number(delay));
    }
  }

  function scheduleAfterTimer(delay: number): void {
    const timer: AfterTimer = {
      delay,
      id: setTimeout(() => {
        afterTimers = afterTimers.filter(t => t !== timer);
        if (status !== 'active') {
          return;
        }
        const afterEvent: AfterEvent = { type: AFTER, delay };
        process(() => {
          const taken = evaluate(stateOf(value).after?.[delay], afterEvent, { context });
          if (taken) {
            takeTransition(taken, afterEvent);
          }
          return taken !== undefined;
        });
      }, delay),
    };
    afterTimers.push(timer);
  }

  function takeEventTransition(event: EventObject): boolean {
    if (status !== 'active') {
      return false;
    }
    const taken = evaluateEvent(event, { value, context });
    if (taken) {
      takeTransition(taken, event);
    }
    return taken !== undefined;
  }

  function process(step: () => boolean): void {
    mailbox.push(step);
    if (processing) {
      return;
    }
    processing = true;
    try {
      for (let next = mailbox.shift(); next; next = mailbox.shift()) {
        if (next()) {
          commit();
        }
      }
    } finally {
      processing = false;
    }
  }

  function commit(): void {
    flush();
    notifyListeners();
  }

  function flush(): void {
    const queued = effects;
    effects = [];
    for (const effect of queued) {
      effect();
    }
    snapshot = makeSnapshot();
  }

  function notifyListeners(): void {
    for (const listener of [...listeners].reverse()) {
      if (listeners.includes(listener)) {
        listener(snapshot);
      }
    }
  }

  function send(event: EventObject): void {
    if (!started) {
      deferred.push(() => takeEventTransition(event));
      return;
    }
    process(() => takeEventTransition(event));
  }

  const actor: Actor<TContext, TEvent, TStates> = {
    start() {
      if (started) {
        return actor;
      }
      started = true;
      process(() => {
        if (initialized) {
          status = stateOf(value).type === 'final' ? 'done' : 'active';
          for (const timer of pausedAfterTimers) {
            scheduleAfterTimer(timer.delay);
          }
          pausedAfterTimers = [];
        } else {
          initialized = true;
          status = 'active';
          enterState(INIT_EVENT);
        }
        flush();
        while (status === 'active') {
          const apply = deferred.shift();
          if (!apply) {
            break;
          }
          if (apply()) {
            flush();
          }
        }
        notifyListeners();
        return false;
      });
      return actor;
    },

    stop() {
      if (status === 'stopped') {
        return;
      }
      started = false;
      status = 'stopped';
      pausedAfterTimers = afterTimers;
      clearAfterTimers();
      snapshot = makeSnapshot();
      notifyListeners();
      listeners.length = 0;
    },

    send,

    getSnapshot() {
      return snapshot;
    },

    subscribe(listener): Unsubscribe {
      listeners.push(listener);
      return () => {
        const i = listeners.indexOf(listener);
        if (~i) {
          listeners.splice(i, 1);
        }
      };
    },
  };

  return actor;
}

function isContextFn<TContext>(
  source: TContext | ((args: { input: unknown }) => TContext),
): source is (args: { input: unknown }) => TContext {
  return typeof source === 'function';
}

function isRouteEvent(event: EventObject): event is RouteEvent {
  return event.type === ROUTE && 'to' in event && typeof event.to === 'string' && event.to.startsWith('#');
}
