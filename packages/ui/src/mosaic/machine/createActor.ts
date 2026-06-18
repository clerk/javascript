import { isAssignAction } from './assign';
import { INIT, INVOKE_DONE, INVOKE_ERROR } from './types';
import type {
  Actions,
  Actor,
  AnyEventObject,
  CreateActorOptions,
  EventObject,
  Snapshot,
  SnapshotListener,
  StateConfig,
  StateMachine,
  TransitionConfig,
  Unsubscribe,
} from './types';

const INIT_EVENT: AnyEventObject = { type: INIT };

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** Normalise a transition (string | object | array) into an ordered list of configs. */
function normalizeTransitions<TContext, TEvent extends EventObject>(
  raw: unknown,
): TransitionConfig<TContext, TEvent>[] {
  return toArray(raw as TransitionConfig<TContext, TEvent> | string | undefined).map(entry =>
    typeof entry === 'string' ? { target: entry } : entry,
  );
}

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

  let value = teleport?.value ?? machine.initial;
  let context: TContext = teleport ? { ...machine.context, ...teleport.context } : { ...machine.context };

  // A teleported actor is already "started" and inert: start() must not re-run
  // entry/always/invoke for the state it was dropped into.
  let started = teleport !== undefined;
  let status: Snapshot<TContext>['status'] = states[value]?.type === 'final' ? 'done' : 'active';

  // Bumped whenever we leave an invoking state (or stop), so a stale promise
  // resolving after the fact is ignored — no transition, no setState-after-stop.
  let invocationToken = 0;

  // The snapshot is cached and only replaced on an actual change, so
  // getSnapshot() is referentially stable for useSyncExternalStore.
  let snapshot: Snapshot<TContext> = { value, context, status };

  const listeners = new Set<SnapshotListener<TContext>>();

  function runActions(actions: Actions<TContext, EventObject> | undefined, event: EventObject): void {
    for (const action of toArray(actions)) {
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

  /** Run a chosen transition: exit (if external) → actions → enter target. */
  function takeTransition(transition: TransitionConfig<TContext, EventObject>, event: EventObject): void {
    const external = transition.target !== undefined;
    if (external) {
      runActions(states[value].exit, event);
      invocationToken++; // abandon the invoke of the state we're leaving
    }
    runActions(transition.actions, event);
    if (external) {
      value = transition.target as string;
      enterState(event);
    }
  }

  function startInvoke(event: EventObject): void {
    const invoke = states[value].invoke;
    if (!invoke) return;
    const token = ++invocationToken;
    Promise.resolve(invoke.src(context, event as never)).then(
      output => {
        if (status !== 'active' || token !== invocationToken) return;
        const doneEvent = { type: INVOKE_DONE, output };
        const transition = pickTransition(normalizeTransitions(invoke.onDone), doneEvent);
        if (!transition) return;
        takeTransition(transition, doneEvent);
        commit();
      },
      (error: unknown) => {
        if (status !== 'active' || token !== invocationToken) return;
        const errorEvent = { type: INVOKE_ERROR, error };
        const transition = pickTransition(normalizeTransitions(invoke.onError), errorEvent);
        if (!transition) return;
        takeTransition(transition, errorEvent);
        commit();
      },
    );
  }

  /** Entry side of a state: entry actions, then immediate/invoke resolution. */
  function enterState(event: EventObject): void {
    const stateConfig = states[value];
    runActions(stateConfig.entry, event);

    if (stateConfig.type === 'final') {
      status = 'done';
      return;
    }

    const immediate = pickTransition(normalizeTransitions(stateConfig.always), event);
    if (immediate && immediate.target !== undefined) {
      takeTransition(immediate, event);
      return;
    }

    startInvoke(event);
  }

  function commit(): void {
    snapshot = { value, context, status };
    for (const listener of listeners) {
      listener(snapshot);
    }
  }

  const actor: Actor<TContext, TEvent> = {
    start() {
      if (started) return actor;
      started = true;
      enterState(INIT_EVENT);
      commit();
      return actor;
    },

    stop() {
      if (status === 'stopped') return;
      status = 'stopped';
      invocationToken++; // abandon any in-flight invoke
      snapshot = { value, context, status };
      for (const listener of listeners) {
        listener(snapshot);
      }
      listeners.clear();
    },

    send(event) {
      if (status !== 'active') return;
      const transition = pickTransition(normalizeTransitions(states[value].on?.[event.type]), event);
      if (!transition) return; // event not handled in this state → ignored
      takeTransition(transition, event);
      commit();
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
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    can(event) {
      if (status !== 'active') return false;
      return pickTransition(normalizeTransitions(states[value].on?.[event.type]), event) !== undefined;
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
