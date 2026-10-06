import { isAssignAction } from './assign';
import type {
  Action,
  Actions,
  Actor,
  ActorSrc,
  AfterEvent,
  AnyEventObject,
  AnyImplementationRefs,
  AssignAction,
  CreateActorOptions,
  EventObject,
  Guard,
  GuardRef,
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
interface RuntimeImplementations<TContext> {
  guards: MachineImplementations<TContext, EventObject>['guards'];
  actions: Partial<Record<string, Action<TContext, EventObject, unknown>>>;
  actors: MachineImplementations<TContext, EventObject>['actors'];
}

function isParamsResolver<TContext>(params: unknown): params is (context: TContext, event: EventObject) => unknown {
  return typeof params === 'function';
}

export function createActor<TContext extends object, TEvent extends EventObject>(
  machine: StateMachine<TContext, TEvent>,
  options: CreateActorOptions<TContext> = {},
): Actor<TContext, TEvent> {
  const teleport = options.snapshot;

  // Invoke done/error events aren't in `TEvent`, so the runtime reads the config with `EventObject`.
  const states = machine.states as unknown as Record<
    string,
    StateConfig<TContext, EventObject, string, AnyImplementationRefs>
  >;

  function implementations(): RuntimeImplementations<TContext> {
    return actor.logic.implementations as unknown as RuntimeImplementations<TContext>;
  }

  function resolveGuard(guard: GuardRef<TContext, EventObject, AnyImplementationRefs>): Guard<TContext, EventObject> {
    if (typeof guard !== 'string') {
      return guard;
    }
    const resolved = implementations().guards[guard];
    if (resolved === undefined) {
      throw new Error(`Guard '${guard}' is not implemented.`);
    }
    return resolved;
  }

  function namedAction(name: string): Action<TContext, EventObject, unknown> {
    const resolved = implementations().actions[name];
    if (resolved === undefined) {
      throw new Error(`Action '${name}' is not implemented.`);
    }
    return resolved;
  }

  function runAction<TParams>(
    action: Action<TContext, EventObject, TParams>,
    event: EventObject,
    params: TParams,
  ): void {
    if (isAssignAction<TContext, EventObject, TParams>(action)) {
      context = { ...context, ...action.assignment(context, event, params) };
    } else {
      action(context, event, params);
    }
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

  const seed: Partial<TContext> = options.context ?? {};
  let context: TContext = { ...machine.context, ...seed, ...teleport?.context };
  const resolveInitial = () => (typeof machine.initial === 'function' ? machine.initial(context) : machine.initial);
  let value = teleport?.value ?? resolveInitial();

  // A teleported actor is already "started" and inert: start() must not re-run
  // entry/always/invoke for the state it was dropped into.
  let started = teleport !== undefined;
  let status: Snapshot<TContext>['status'] = states[value]?.type === 'final' ? 'done' : 'active';

  // Bumped whenever we leave an invoking state (or stop), so a stale promise
  // resolving after the fact is ignored — no transition, no setState-after-stop.
  let invocationToken = 0;

  let afterTimers: ReturnType<typeof setTimeout>[] = [];

  // The snapshot is cached and only replaced on an actual change, so
  // getSnapshot() is referentially stable for useSyncExternalStore.
  let snapshot: Snapshot<TContext> = { value, context, status };

  const listeners: SnapshotListener<TContext>[] = [];

  function normalizeTransition(
    raw: unknown,
    event: EventObject,
  ): TransitionConfig<TContext, EventObject, string, AnyImplementationRefs>[] {
    if (typeof raw === 'function') {
      const result = (raw as TransitionFn<TContext, EventObject>)({ context, event });
      if (result === undefined) {
        return [];
      }
      const cfg: TransitionConfig<TContext, EventObject, string, AnyImplementationRefs> = { target: result.target };
      if (result.context !== undefined) {
        const patch = result.context;
        cfg.actions = { type: ASSIGN, assignment: () => patch } as AssignAction<TContext, EventObject>;
      }
      return [cfg];
    }
    return toArr(raw as any).map(e =>
      typeof e === 'string'
        ? { target: e }
        : (e as TransitionConfig<TContext, EventObject, string, AnyImplementationRefs>),
    );
  }

  function runActions(
    actions: Actions<TContext, EventObject, AnyImplementationRefs> | undefined,
    event: EventObject,
  ): void {
    for (const ref of toArr(actions)) {
      if (typeof ref === 'function' || isAssignAction<TContext, EventObject>(ref)) {
        runAction(ref, event, undefined);
      } else if (typeof ref === 'string') {
        runAction(namedAction(ref), event, undefined);
      } else {
        runAction(namedAction(ref.type), event, isParamsResolver(ref.params) ? ref.params(context, event) : ref.params);
      }
    }
  }

  function pickTransition(
    transitions: TransitionConfig<TContext, EventObject, string, AnyImplementationRefs>[],
    event: EventObject,
  ): TransitionConfig<TContext, EventObject, string, AnyImplementationRefs> | undefined {
    return transitions.find(transition => !transition.guard || resolveGuard(transition.guard)(context, event));
  }

  function canEnter(stateId: string, event: EventObject): boolean {
    const guard = states[stateId]?.guard;
    return !guard || resolveGuard(guard)(context, event);
  }

  /**
   * Run a chosen transition: exit (if external) → actions → enter target.
   * Returns `false` — a true no-op — when the target's entry guard blocks it, so
   * the caller skips the commit and subscribers are never notified.
   */
  function takeTransition(
    transition: TransitionConfig<TContext, EventObject, string, AnyImplementationRefs>,
    event: EventObject,
  ): boolean {
    const external = transition.target !== undefined;
    if (external && !canEnter(transition.target as string, event)) {
      return false;
    }
    if (external) {
      runActions(states[value].exit, event);
      invocationToken++;
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
    const src = resolveSrc(invoke.src);
    const token = ++invocationToken;
    const onDone = (output: unknown) => {
      if (status !== 'active' || token !== invocationToken) {
        return;
      }
      const doneEvent = { type: INVOKE_DONE, output };
      const transition = pickTransition(normalizeTransition(invoke.onDone, doneEvent), doneEvent);
      if (!transition) {
        return;
      }
      if (takeTransition(transition, doneEvent)) {
        commit();
      }
    };
    const onError = (error: unknown) => {
      if (status !== 'active' || token !== invocationToken) {
        return;
      }
      const errorEvent = { type: INVOKE_ERROR, error };
      const transition = pickTransition(normalizeTransition(invoke.onError, errorEvent), errorEvent);
      if (!transition) {
        return;
      }
      if (takeTransition(transition, errorEvent)) {
        commit();
      }
    };
    try {
      Promise.resolve(src(context, event)).then(onDone, onError);
    } catch (error) {
      queueMicrotask(() => onError(error));
    }
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
    logic: machine,

    start() {
      if (started) {
        return actor;
      }
      started = true;
      status = 'active';
      // Reset state and context so a restart (e.g. after StrictMode stop/start)
      // begins from idle rather than re-entering and re-invoking a mid-flight state.
      context = { ...machine.context, ...seed };
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
      invocationToken++;
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
      }
      if (takeTransition(transition, event)) {
        commit();
      }
    },

    getSnapshot() {
      return snapshot;
    },

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

    recheck() {
      if (status !== 'active') {
        return;
      }
      const event = { type: RECHECK };

      if (!canEnter(value, event)) {
        const reseated = resolveInitial();
        if (reseated !== value) {
          runActions(states[value]?.exit, event);
          invocationToken++;
          clearAfterTimers();
          value = reseated;
          enterState(event);
          commit();
        }
        return;
      }

      const immediate = pickTransition(normalizeTransition(states[value]?.always, event), event);
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
export function mockActor<TContext extends object, TEvent extends EventObject>(
  machine: StateMachine<TContext, TEvent>,
  snapshot: { value: string; context?: Partial<TContext> },
): Actor<TContext, TEvent> {
  return createActor(machine, { snapshot });
}
