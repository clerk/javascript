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
export function createActor<TContext extends object, TEvent extends EventObject>(
  machine: StateMachine<TContext, TEvent>,
  options: CreateActorOptions<TContext> = {},
): Actor<TContext, TEvent> {
  const teleport = options.snapshot;

  // Internally the actor operates on the broader `EventObject`: invoke done/error
  // events aren't part of the user's `TEvent` union, so the config is viewed
  // through an event-agnostic lens to keep the runtime helpers honestly typed.
  const states = machine.states as unknown as Record<string, StateConfig<TContext, EventObject>>;

  // Tracks the latest setContext patch so it survives a stop/start cycle.
  let liveContextPatch: Partial<TContext> = options.context ?? {};
  let context: TContext = { ...machine.context, ...liveContextPatch, ...teleport?.context };
  // `initial` may be derived from context (e.g. furthest-reachable step).
  const resolveInitial = () => (typeof machine.initial === 'function' ? machine.initial(context) : machine.initial);
  let value = teleport?.value ?? resolveInitial();

  // A teleported actor is already "started" and inert: start() must not re-run
  // entry/always/invoke for the state it was dropped into.
  let started = teleport !== undefined;
  let status: Snapshot<TContext>['status'] = states[value]?.type === 'final' ? 'done' : 'active';

  // Bumped whenever we leave an invoking state (or stop), so a stale promise
  // resolving after the fact is ignored — no transition, no setState-after-stop.
  let invocationToken = 0;

  // Pending `after` timer IDs — cleared when the state is exited or the actor stops.
  let afterTimers: ReturnType<typeof setTimeout>[] = [];

  // The snapshot is cached and only replaced on an actual change, so
  // getSnapshot() is referentially stable for useSyncExternalStore.
  let snapshot: Snapshot<TContext> = { value, context, status };

  const listeners: SnapshotListener<TContext>[] = [];

  /**
   * Normalise a raw `Transition` value into a `TransitionConfig[]` the runtime
   * can process uniformly. Handles all four arms of the `Transition` union:
   * - string → `{ target: string }`
   * - `TransitionConfig` → as-is
   * - `TransitionConfig[]` → as-is
   * - `TransitionFn` → called immediately; `undefined` return → `[]` (unhandled)
   */
  function normalizeTransition(raw: unknown, event: EventObject): TransitionConfig<TContext, EventObject>[] {
    if (typeof raw === 'function') {
      // SAFETY: raw is a TransitionFn — (args: {context, event}) => TransitionResult | undefined.
      // The cast is required because the generic TStates parameter is erased at this internal
      // boundary; callers have already narrowed the event type via StateConfig.on[K].
      const result = (raw as TransitionFn<TContext, EventObject>)({ context, event });
      if (result === undefined) {
        return [];
      }
      const cfg: TransitionConfig<TContext, EventObject> = { target: result.target };
      if (result.context !== undefined) {
        const patch = result.context;
        // SAFETY: Constructing AssignAction inline avoids importing the assign() helper here.
        // The ASSIGN symbol is the exact tag isAssignAction checks in runActions.
        cfg.actions = { type: ASSIGN, assignment: () => patch } as AssignAction<TContext, EventObject>;
      }
      return [cfg];
    }
    return toArr(raw as any).map(e =>
      typeof e === 'string' ? { target: e } : (e as TransitionConfig<TContext, EventObject>),
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
    transitions: TransitionConfig<TContext, EventObject>[],
    event: EventObject,
  ): TransitionConfig<TContext, EventObject> | undefined {
    return transitions.find(transition => !transition.guard || transition.guard(context, event));
  }

  /** Whether a target state's entry guard currently permits landing on it. */
  function canEnter(stateId: string, event: EventObject): boolean {
    const guard = states[stateId]?.guard;
    return !guard || guard(context, event);
  }

  /**
   * Run a chosen transition: exit (if external) → actions → enter target.
   * Returns `false` — a true no-op — when the target's entry guard blocks it, so
   * the caller skips the commit and subscribers are never notified.
   */
  function takeTransition(transition: TransitionConfig<TContext, EventObject>, event: EventObject): boolean {
    const external = transition.target !== undefined;
    if (external && !canEnter(transition.target as string, event)) {
      return false; // entry guard blocks landing → snapshot unchanged, no notify
    }
    if (external) {
      runActions(states[value].exit, event);
      invocationToken++; // abandon the invoke of the state we're leaving
      clearAfterTimers();
    }
    runActions(transition.actions, event);
    if (external) {
      value = transition.target as string;
      enterState(event);
    }
    return true;
  }

  function startInvoke(event: EventObject): void {
    const invoke = states[value].invoke;
    if (!invoke) {
      return;
    }
    const token = ++invocationToken;
    // SAFETY: startInvoke is called with the actor's internal EventObject, but
    // InvokeConfig.src is typed to accept (context, TEvent | DoneInvokeEvent | ErrorInvokeEvent).
    // The cast suppresses that mismatch; src implementations receive the INIT event
    // on state entry and typically ignore it. The runtime views events through an
    // event-agnostic lens (line 57) for this reason.
    Promise.resolve(invoke.src(context, event as never)).then(
      output => {
        if (status !== 'active' || token !== invocationToken) {
          return;
        }
        const doneEvent = { type: INVOKE_DONE, output };
        const transition = pickTransition(normalizeTransition(invoke.onDone, doneEvent), doneEvent);
        if (!transition) {
          return;
        }
        takeTransition(transition, doneEvent);
        commit();
      },
      (error: unknown) => {
        if (status !== 'active' || token !== invocationToken) {
          return;
        }
        const errorEvent = { type: INVOKE_ERROR, error };
        const transition = pickTransition(normalizeTransition(invoke.onError, errorEvent), errorEvent);
        if (!transition) {
          return;
        }
        takeTransition(transition, errorEvent);
        commit();
      },
    );
  }

  function clearAfterTimers(): void {
    for (const id of afterTimers) {
      clearTimeout(id);
    }
    afterTimers = [];
  }

  function startAfterTimers(): void {
    const afterConfig = states[value].after;
    if (!afterConfig) {
      return;
    }
    for (const [delayStr, raw] of Object.entries(afterConfig)) {
      const delay = Number(delayStr);
      const id = setTimeout(() => {
        afterTimers = afterTimers.filter(t => t !== id);
        if (status !== 'active') {
          return;
        }
        const afterEvent: AfterEvent = { type: AFTER, delay };
        const transition = pickTransition(normalizeTransition(raw, afterEvent), afterEvent);
        if (!transition) {
          return;
        }
        if (takeTransition(transition, afterEvent)) {
          commit();
        }
      }, delay);
      afterTimers.push(id);
    }
  }

  /** Entry side of a state: entry actions, then immediate/invoke resolution. */
  function enterState(event: EventObject): void {
    const stateConfig = states[value];
    if (!stateConfig) {
      return;
    } // degenerate graph (e.g. empty wizard) — nothing to enter
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
    for (let i = listeners.length; i--; ) {
      listeners[i](snapshot);
    }
  }

  const actor: Actor<TContext, TEvent> = {
    start() {
      if (started) {
        return actor;
      }
      started = true;
      status = 'active';
      // Reset state and context so a restart (e.g. after StrictMode stop/start)
      // begins from idle rather than re-entering and re-invoking a mid-flight state.
      context = { ...machine.context, ...liveContextPatch };
      value = resolveInitial();
      enterState(INIT_EVENT);
      commit();
      return actor;
    },

    stop() {
      if (status === 'stopped') {
        return;
      }
      started = false; // allow restart (e.g. StrictMode effect cleanup + remount)
      status = 'stopped';
      invocationToken++; // abandon any in-flight invoke
      clearAfterTimers();
      snapshot = { value, context, status };
      for (let i = listeners.length; i--; ) {
        listeners[i](snapshot);
      }
      listeners.length = 0;
    },

    send(event) {
      if (!started || status !== 'active') {
        return;
      }
      const transition = pickTransition(normalizeTransition(states[value]?.on?.[event.type], event), event);
      if (!transition) {
        return;
      } // event not handled in this state → ignored
      if (takeTransition(transition, event)) {
        commit();
      } // entry-blocked → no commit, no notify
    },

    getSnapshot() {
      return snapshot;
    },

    // Standard observable contract: `subscribe(cb)` returns an unsubscribe fn.
    // This is deliberately the same shape as a nanostores atom's `subscribe`, so
    // if nanostores is adopted repo-wide later a `toAtom(actor)` adapter is a
    // trivial, non-breaking wrapper over `subscribe` + `getSnapshot` — no need to
    // pull the dependency in now.
    subscribe(listener: SnapshotListener<TContext>): Unsubscribe {
      listeners.push(listener);
      return () => {
        const i = listeners.indexOf(listener);
        if (~i) {
          listeners.splice(i, 1);
        }
      };
    },

    can(event) {
      if (!started || status !== 'active') {
        return false;
      }
      const transition = pickTransition(normalizeTransition(states[value]?.on?.[event.type], event), event);
      if (!transition) {
        return false;
      }
      return transition.target === undefined || canEnter(transition.target, event);
    },

    setContext(patch: Partial<TContext>) {
      liveContextPatch = { ...liveContextPatch, ...patch };
      context = { ...context, ...patch };
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
          runActions(states[value]?.exit, event);
          invocationToken++; // abandon the invoke of the state we're leaving
          clearAfterTimers();
          value = reseated;
          enterState(event);
          commit();
        }
        return;
      }

      const immediate = pickTransition(normalizeTransition(states[value]?.always, event), event);
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
export function mockActor<TContext extends object, TEvent extends EventObject>(
  machine: StateMachine<TContext, TEvent>,
  snapshot: { value: string; context?: Partial<TContext> },
): Actor<TContext, TEvent> {
  return createActor(machine, { snapshot });
}
