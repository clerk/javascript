import { logger } from '@clerk/shared/logger';

import { isAssignAction } from './assign';
import type {
  Actions,
  Actor,
  AfterEvent,
  AnyEventObject,
  AssignAction,
  CreateActorOptions,
  EventObject,
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

// Collapse toArray into single helper: returns empty array, original if array, or wrapped value
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

  // Internally the actor operates on the broader `EventObject`: invoke done/error
  // events aren't part of the user's `TEvent` union, so the config is viewed
  // through an event-agnostic lens to keep the runtime helpers honestly typed.
  const states = machine.states as unknown as Record<string, StateConfig<TContext, EventObject, TStates>>;
  const emptyState: StateConfig<TContext, EventObject, TStates> = {};
  const stateOf = (id: string): StateConfig<TContext, EventObject, TStates> => {
    const state = states[id];
    if (state) {
      return state;
    }
    if (Object.keys(states).length > 0) {
      logger.warnOnce(`[Clerk] Machine has no state "${id}".`);
    }
    return emptyState;
  };

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

  // Pending `after` timers — cleared when the state is exited, paused while the actor is stopped.
  let afterTimers: AfterTimer[] = [];
  let pausedAfterTimers: AfterTimer[] = [];

  // The snapshot is cached and only replaced on an actual change, so
  // getSnapshot() is referentially stable for useSyncExternalStore.
  let snapshot: Snapshot<TContext, TStates> = { value, context, status };

  const listeners: SnapshotListener<TContext, TStates>[] = [];

  /**
   * Normalise a raw `Transition` value into a `TransitionConfig[]` the runtime
   * can process uniformly. Handles all four arms of the `Transition` union:
   * - string → `{ target: string }`
   * - `TransitionConfig` → as-is
   * - `TransitionConfig[]` → as-is
   * - `TransitionFn` → called immediately; `undefined` return → `[]` (unhandled)
   */
  function normalizeTransition(raw: unknown, event: EventObject): TransitionConfig<TContext, EventObject, TStates>[] {
    if (typeof raw === 'function') {
      // SAFETY: raw is a TransitionFn — (args: {context, event}) => TransitionResult | undefined.
      // The cast is required because raw arrives untyped at this internal boundary; callers
      // have already narrowed the event type via StateConfig.on[K].
      const result = (raw as TransitionFn<TContext, EventObject, TStates>)({ context, event });
      if (result === undefined) {
        return [];
      }
      const cfg: TransitionConfig<TContext, EventObject, TStates> = { target: result.target };
      if (result.context !== undefined) {
        const patch = result.context;
        // SAFETY: Constructing AssignAction inline avoids importing the assign() helper here.
        // The ASSIGN symbol is the exact tag isAssignAction checks in runActions.
        cfg.actions = { type: ASSIGN, assignment: () => patch } as AssignAction<TContext, EventObject>;
      }
      return [cfg];
    }
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

  /** Whether a target state's entry guard currently permits landing on it. */
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
      return false; // entry guard blocks landing → snapshot unchanged, no notify
    }
    if (target !== undefined) {
      runActions(stateOf(value).exit, event);
      invocationToken++; // abandon the invoke of the state we're leaving
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
    // SAFETY: startInvoke is called with the actor's internal EventObject, but
    // InvokeConfig.src is typed to accept (context, TEvent | DoneInvokeEvent | ErrorInvokeEvent).
    // The cast suppresses that mismatch; src implementations receive the INIT event
    // on state entry and typically ignore it. The runtime views events through an
    // event-agnostic lens (line 57) for this reason.
    Promise.resolve(invoke.src(context, event as never)).then(
      (output: unknown) => settle(invoke.onDone, { type: INVOKE_DONE, output }),
      (error: unknown) => settle(invoke.onError, { type: INVOKE_ERROR, error }),
    );
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

  /** Entry side of a state: entry actions, then immediate/invoke resolution. */
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

    // Standard observable contract: `subscribe(cb)` returns an unsubscribe fn.
    // This is deliberately the same shape as a nanostores atom's `subscribe`, so
    // if nanostores is adopted repo-wide later a `toAtom(actor)` adapter is a
    // trivial, non-breaking wrapper over `subscribe` + `getSnapshot` — no need to
    // pull the dependency in now.
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

      // Self-correct first: if live external data has made the *current* state
      // unenterable (its entry guard no longer holds), re-seat to the freshly
      // resolved initial state — the same derivation used on start (e.g. the
      // Wizard's furthest-reachable step). `resolveInitial` always lands on an
      // enterable step, so this is provably one-shot and cannot loop.
      if (!canEnter(value, event)) {
        const reseated = resolveInitial();
        if (reseated !== value) {
          runActions(stateOf(value).exit, event);
          invocationToken++; // abandon the invoke of the state we're leaving
          clearAfterTimers();
          value = reseated;
          enterState(event);
          commit();
        }
        return;
      }

      const immediate = pickTransition(normalizeTransition(stateOf(value).always, event), event);
      if (immediate && immediate.target !== undefined && takeTransition(immediate, event)) {
        commit(); // nothing applies → no commit, no notify
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
