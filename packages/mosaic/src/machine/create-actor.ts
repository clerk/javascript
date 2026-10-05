import { logger } from '@clerk/shared/logger';

import { isAssignAction } from './assign';
import type {
  Actions,
  Actor,
  ActorSrc,
  AfterEvent,
  AnyEventObject,
  AnyImplementationRefs,
  AssignAction,
  CreateActorOptions,
  EventObject,
  MachineImplementations,
  Snapshot,
  SnapshotListener,
  StateConfig,
  StateMachine,
  TransitionConfig,
  TransitionFn,
  Unsubscribe,
} from './types';
import { AFTER, ASSIGN, INIT, INVOKE_DONE, INVOKE_ERROR, RECHECK } from './types';

const INIT_EVENT: AnyEventObject = { type: INIT };

interface AfterTimer {
  id: ReturnType<typeof setTimeout>;
  delay: number;
  transitionConfig: unknown;
}

const toArr = <T>(v: T | T[] | undefined): T[] => (!v ? [] : Array.isArray(v) ? v : [v]);

/**
 * Wrap a machine definition in a running instance (an "actor").
 *
 * Construction is lazy: the snapshot reflects the initial state, but entry
 * actions, immediate (`always`) transitions, and invokes don't run until
 * {@link Actor.start} is called.
 *
 * ```ts
 * const actor = createActor(machine);
 * actor.subscribe(snap => console.log(snap.value));
 * actor.start();
 * actor.send({ type: 'TOGGLE' });
 * ```
 */
export function createActor<TContext extends object, TEvent extends EventObject, TStates extends string = string>(
  machine: StateMachine<TContext, TEvent, TStates>,
  options: CreateActorOptions<TContext, TStates> = {},
): Actor<TContext, TEvent, TStates> {
  const teleport = options.snapshot;

  // Invoke done/error events aren't in `TEvent`, so the runtime reads the config with `EventObject`.
  // eslint-disable-next-line typescript/consistent-type-assertions -- The machine runtime erases state and event types; its public generics enforce their relationship.
  const states = machine.states as unknown as Record<
    string,
    StateConfig<TContext, EventObject, TStates, AnyImplementationRefs>
  >;
  const emptyState: StateConfig<TContext, EventObject, TStates, AnyImplementationRefs> = {};
  const stateOf = (id: string): StateConfig<TContext, EventObject, TStates, AnyImplementationRefs> => {
    const state = states[id];
    if (state) {
      return state;
    }
    if (Object.keys(states).length > 0) {
      logger.warnOnce(`[Clerk] Machine has no state "${id}".`);
    }
    return emptyState;
  };

  function implementations(): MachineImplementations<TContext, EventObject> {
    // eslint-disable-next-line typescript/consistent-type-assertions -- The machine runtime erases state and event types; its public generics enforce their relationship.
    return actor.logic.implementations as unknown as MachineImplementations<TContext, EventObject>;
  }

  function resolveSrc(src: ActorSrc<TContext, EventObject> | string): ActorSrc<TContext, EventObject> {
    if (typeof src !== 'string') {
      return src;
    }
    const resolved = implementations().actors[src];
    if (resolved === undefined) {
      throw new Error(`Actor '${src}' is not implemented.`);
    }
    return resolved;
  }

  // Tracks the latest setContext patch so it survives a stop/start cycle.
  let liveContextPatch: Partial<TContext> = options.context ?? {};
  let context: TContext = { ...machine.context, ...liveContextPatch, ...teleport?.context };
  // `initial` may be derived from context (e.g. furthest-reachable step).
  const resolveInitial = () => (typeof machine.initial === 'function' ? machine.initial(context) : machine.initial);
  let value = teleport?.value ?? resolveInitial();

  // A teleported actor is already "started" and inert: start() must not re-run
  // entry/always/invoke for the state it was dropped into.
  let started = teleport !== undefined;
  let initialized = started;
  let status: Snapshot<TContext>['status'] = stateOf(value).type === 'final' ? 'done' : 'active';

  // Bumped whenever we leave an invoking state, so a stale promise resolving
  // after the fact is ignored — no transition.
  let invocationToken = 0;
  const deferred: (() => boolean)[] = [];

  let afterTimers: AfterTimer[] = [];
  let pausedAfterTimers: AfterTimer[] = [];

  // The snapshot is cached and only replaced on an actual change, so
  // getSnapshot() is referentially stable for useSyncExternalStore.
  let snapshot: Snapshot<TContext, TStates> = { value, context, status };

  const listeners: SnapshotListener<TContext, TStates>[] = [];

  function normalizeTransition(raw: unknown, event: EventObject): TransitionConfig<TContext, EventObject, TStates>[] {
    if (typeof raw === 'function') {
      // eslint-disable-next-line typescript/consistent-type-assertions -- The machine runtime erases state and event types; its public generics enforce their relationship.
      const result = (raw as TransitionFn<TContext, EventObject, TStates>)({ context, event });
      if (result === undefined) {
        return [];
      }
      const cfg: TransitionConfig<TContext, EventObject, TStates> = { target: result.target };
      if (result.context !== undefined) {
        const patch = result.context;
        // eslint-disable-next-line typescript/consistent-type-assertions -- The machine runtime erases state and event types; its public generics enforce their relationship.
        cfg.actions = { type: ASSIGN, assignment: () => patch } as AssignAction<TContext, EventObject>;
      }
      return [cfg];
    }
    // eslint-disable-next-line typescript/consistent-type-assertions -- The machine runtime erases state and event types; its public generics enforce their relationship.
    return toArr(raw as TStates | TransitionConfig<TContext, EventObject, TStates>).map(e =>
      typeof e === 'string' ? { target: e } : e,
    );
  }

  function runActions(actions: Actions<TContext, EventObject> | undefined, event: EventObject): void {
    for (const action of toArr(actions)) {
      if (isAssignAction<TContext, EventObject>(action)) {
        context = { ...context, ...action.assignment(context, event) };
      } else {
        action(context, event);
      }
    }
  }

  function pickTransition(
    transitions: TransitionConfig<TContext, EventObject, TStates>[],
    event: EventObject,
  ): TransitionConfig<TContext, EventObject, TStates> | undefined {
    return transitions.find(transition => !transition.guard || transition.guard(context, event));
  }

  function canEnter(stateId: string, event: EventObject): boolean {
    const guard = stateOf(stateId).guard;
    return !guard || guard(context, event);
  }

  /**
   * Run a chosen transition: exit (if external) → actions → enter target.
   * Returns `false` — a true no-op — when the target's entry guard blocks it, so
   * the caller skips the commit and subscribers are never notified.
   */
  function takeTransition(transition: TransitionConfig<TContext, EventObject, TStates>, event: EventObject): boolean {
    const { target } = transition;
    if (target !== undefined && !canEnter(target, event)) {
      return false;
    }
    if (target !== undefined) {
      runActions(stateOf(value).exit, event);
      invocationToken++;
      clearAfterTimers();
    }
    runActions(transition.actions, event);
    if (target !== undefined) {
      value = target;
      enterState(event);
    }
    return true;
  }

  function startInvoke(event: EventObject): void {
    const invoke = stateOf(value).invoke;
    if (!invoke) {
      return;
    }
    const src = resolveSrc(invoke.src);
    const token = ++invocationToken;
    const settle = (transitionConfig: unknown, settledEvent: AnyEventObject) => {
      if (token !== invocationToken) {
        return;
      }
      if (status === 'stopped') {
        deferred.push(() => token === invocationToken && takeInvokeTransition(transitionConfig, settledEvent));
        return;
      }
      if (status === 'active' && takeInvokeTransition(transitionConfig, settledEvent)) {
        commit();
      }
    };
    const onDone = (output: unknown) => settle(invoke.onDone, { type: INVOKE_DONE, output });
    const onError = (error: unknown) => settle(invoke.onError, { type: INVOKE_ERROR, error });
    try {
      Promise.resolve(src(context, event)).then(onDone, onError);
    } catch (error) {
      queueMicrotask(() => onError(error));
    }
  }

  function takeInvokeTransition(transitionConfig: unknown, event: EventObject): boolean {
    const transition = pickTransition(normalizeTransition(transitionConfig, event), event);
    return transition !== undefined && takeTransition(transition, event);
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
    for (const [delayStr, raw] of Object.entries(afterConfig)) {
      scheduleAfterTimer(Number(delayStr), raw);
    }
  }

  function scheduleAfterTimer(delay: number, transitionConfig: unknown): void {
    const timer: AfterTimer = {
      delay,
      transitionConfig,
      id: setTimeout(() => {
        afterTimers = afterTimers.filter(t => t !== timer);
        if (status !== 'active') {
          return;
        }
        const afterEvent: AfterEvent = { type: AFTER, delay };
        const transition = pickTransition(normalizeTransition(transitionConfig, afterEvent), afterEvent);
        if (!transition) {
          return;
        }
        if (takeTransition(transition, afterEvent)) {
          commit();
        }
      }, delay),
    };
    afterTimers.push(timer);
  }

  function resume(): void {
    status = stateOf(value).type === 'final' ? 'done' : 'active';
    for (const timer of pausedAfterTimers) {
      scheduleAfterTimer(timer.delay, timer.transitionConfig);
    }
    pausedAfterTimers = [];
  }

  function applyDeferred(): void {
    while (status === 'active') {
      const apply = deferred.shift();
      if (!apply) {
        return;
      }
      apply();
    }
  }

  function takeEventTransition(event: EventObject): boolean {
    if (status !== 'active') {
      return false;
    }
    const transition = pickTransition(normalizeTransition(stateOf(value).on?.[event.type], event), event);
    return transition !== undefined && takeTransition(transition, event);
  }

  function enterState(event: EventObject): void {
    const stateConfig = stateOf(value);
    runActions(stateConfig.entry, event);

    if (stateConfig.type === 'final') {
      status = 'done';
      return;
    }

    const immediate = pickTransition(normalizeTransition(stateConfig.always, event), event);
    if (immediate && immediate.target !== undefined && takeTransition(immediate, event)) {
      return;
    }

    startInvoke(event);
    startAfterTimers();
  }

  function commit(): void {
    snapshot = { value, context, status };
    notifyListeners();
  }

  function notifyListeners(): void {
    for (const listener of [...listeners].reverse()) {
      if (listeners.includes(listener)) {
        listener(snapshot);
      }
    }
  }

  const actor: Actor<TContext, TEvent, TStates> = {
    logic: machine,

    start() {
      if (started) {
        return actor;
      }
      started = true;
      if (initialized) {
        resume();
      } else {
        initialized = true;
        status = 'active';
        // The first start seats on the initial state resolved from the latest injected context.
        context = { ...machine.context, ...liveContextPatch };
        value = resolveInitial();
        enterState(INIT_EVENT);
      }
      applyDeferred();
      commit();
      return actor;
    },

    stop() {
      if (status === 'stopped') {
        return;
      }
      started = false; // allow restart (e.g. StrictMode effect cleanup + remount)
      status = 'stopped';
      pausedAfterTimers = afterTimers;
      clearAfterTimers();
      snapshot = { value, context, status };
      notifyListeners();
      listeners.length = 0;
    },

    send(event) {
      if (!started) {
        deferred.push(() => takeEventTransition(event));
        return;
      }
      if (takeEventTransition(event)) {
        commit();
      }
    },

    getSnapshot() {
      return snapshot;
    },

    subscribe(listener: SnapshotListener<TContext, TStates>): Unsubscribe {
      listeners.push(listener);
      return () => {
        const i = listeners.indexOf(listener);
        if (~i) {
          listeners.splice(i, 1);
        }
      };
    },

    can(event) {
      if (status !== 'active') {
        return false;
      }
      const transition = pickTransition(normalizeTransition(stateOf(value).on?.[event.type], event), event);
      if (!transition) {
        return false;
      }
      return transition.target === undefined || canEnter(transition.target, event);
    },

    setContext(patch: Partial<TContext>) {
      liveContextPatch = { ...liveContextPatch, ...patch };
      context = { ...context, ...patch };
      if (!initialized) {
        value = resolveInitial();
      }
    },

    recheck() {
      if (status !== 'active') {
        return;
      }
      const event = { type: RECHECK };

      if (!canEnter(value, event)) {
        const reseated = resolveInitial();
        if (reseated !== value) {
          runActions(stateOf(value).exit, event);
          invocationToken++;
          clearAfterTimers();
          value = reseated;
          enterState(event);
          commit();
        }
        return;
      }

      const immediate = pickTransition(normalizeTransition(stateOf(value).always, event), event);
      if (immediate && immediate.target !== undefined && takeTransition(immediate, event)) {
        commit();
      }
    },
  };

  return actor;
}

/**
 * Create an actor teleported to an arbitrary `{ value, context }`.
 *
 * The actor is started but inert: no entry actions, immediate transitions, or
 * invokes run for the teleported state. This is the key docs/testing affordance
 * — transient states (e.g. a `deleting` step hidden behind a 2s mutation) can't
 * be reached by clicking through, so teleport straight to them for a snapshot.
 *
 * ```ts
 * const actor = mockActor(machine, { value: 'deleting', context: { error: null } });
 * actor.getSnapshot(); // → { value: 'deleting', context: {...}, status: 'active' }
 * ```
 */
export function mockActor<TContext extends object, TEvent extends EventObject, TStates extends string = string>(
  machine: StateMachine<TContext, TEvent, TStates>,
  snapshot: { value: TStates; context?: Partial<TContext> },
): Actor<TContext, TEvent, TStates> {
  return createActor(machine, { snapshot });
}
