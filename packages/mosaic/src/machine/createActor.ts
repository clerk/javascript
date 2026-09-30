import { isAssignAction } from './assign';
import type {
  Actions,
  Actor,
  ActorOptionsArgs,
  AfterEvent,
  AnyActor,
  AnyEventObject,
  AnyStateMachine,
  AssignAction,
  CreateActorOptions,
  DoneInvokeEvent,
  ErrorInvokeEvent,
  EventObject,
  GuardMeta,
  InvokeConfig,
  ProvidedActors,
  Snapshot,
  SnapshotListener,
  StateConfig,
  StateMachine,
  Transition,
  TransitionConfig,
  TransitionFn,
  Unsubscribe,
} from './types';
import { AFTER, ASSIGN, INIT, INVOKE_DONE, INVOKE_ERROR, RECHECK } from './types';

const INIT_EVENT: AnyEventObject = { type: INIT };

// Collapse toArray into single helper: returns empty array, original if array, or wrapped value
const toArr = <T>(v: T | T[] | undefined): T[] => (!v ? [] : Array.isArray(v) ? v : [v]);

interface StateNode<TContext> {
  path: string;
  parent: StateNode<TContext> | undefined;
  config: StateConfig<TContext, EventObject>;
  children: Record<string, StateNode<TContext>>;
}

interface Activity {
  timers: ReturnType<typeof setTimeout>[];
  childId: string | undefined;
}

const actorMachines = new WeakMap<object, AnyStateMachine>();

function isMachine(src: unknown): src is AnyStateMachine {
  return typeof src === 'object' && src !== null && 'states' in src;
}

function matchesValue(value: string, path: string): boolean {
  return value === path || value.startsWith(`${path}.`);
}

function isAncestor<TContext>(ancestor: StateNode<TContext>, node: StateNode<TContext>): boolean {
  for (let current = node.parent; current; current = current.parent) {
    if (current === ancestor) {
      return true;
    }
  }
  return false;
}

function descend<TContext>(node: StateNode<TContext> | undefined, path: string): StateNode<TContext> | undefined {
  if (path === '') {
    return node;
  }
  return path.split('.').reduce<StateNode<TContext> | undefined>((current, key) => current?.children[key], node);
}

export function childActor<TContext extends object, TEvent extends EventObject, TActors extends ProvidedActors>(
  child: AnyActor | undefined,
  machine: StateMachine<TContext, TEvent, TActors>,
): Actor<TContext, TEvent> | undefined {
  if (child === undefined || actorMachines.get(child)?.config !== machine.config) {
    return undefined;
  }
  return child as unknown as Actor<TContext, TEvent>;
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
export function createActor<
  TContext extends object,
  TEvent extends EventObject,
  TActors extends ProvidedActors = ProvidedActors,
>(
  machine: StateMachine<TContext, TEvent, TActors>,
  ...[options = {}]: ActorOptionsArgs<TActors, CreateActorOptions<TContext, TActors>>
): Actor<TContext, TEvent> {
  const teleport = options.snapshot;
  const findActor = (name: string) => machine.actors[name] ?? options.actors?.[name];

  const ids = new Map<string, StateNode<TContext>>();
  function buildNode(
    config: StateConfig<TContext, EventObject>,
    path: string,
    parent: StateNode<TContext> | undefined,
  ): StateNode<TContext> {
    const node: StateNode<TContext> = { path, parent, config, children: {} };
    if (config.id !== undefined) {
      ids.set(config.id, node);
    }
    for (const [key, child] of Object.entries(config.states ?? {})) {
      node.children[key] = buildNode(child, path === '' ? key : `${path}.${key}`, node);
    }
    return node;
  }
  // Internally the actor operates on the broader `EventObject`: invoke done/error
  // events aren't part of the user's `TEvent` union, so the config is viewed
  // through an event-agnostic lens to keep the runtime helpers honestly typed.
  const root = buildNode(
    { states: machine.states as unknown as Record<string, StateConfig<TContext, EventObject>> },
    '',
    undefined,
  );
  if (machine.id !== undefined) {
    ids.set(machine.id, root);
  }

  // Tracks the latest setContext patch so it survives a stop/start cycle.
  let liveContextPatch: Partial<TContext> = options.context ?? {};
  let context: TContext = { ...machine.context, ...liveContextPatch, ...teleport?.context };
  // `initial` may be derived from context (e.g. furthest-reachable step).
  const resolveInitial = () => (typeof machine.initial === 'function' ? machine.initial(context) : machine.initial);

  function initialLeaf(node: StateNode<TContext>): StateNode<TContext> | undefined {
    const self = node === root ? undefined : node;
    if (Object.keys(node.children).length === 0) {
      return self;
    }
    const key = node === root ? resolveInitial() : node.config.initial;
    const next = key === undefined ? undefined : node.children[key];
    return next ? initialLeaf(next) : self;
  }

  let leaf = teleport ? descend(root, teleport.value) : initialLeaf(root);
  leaf = leaf && initialLeaf(leaf);
  let fallbackValue = teleport?.value ?? resolveInitial();

  // A teleported actor is already "started" and inert: start() must not re-run
  // entry/always/invoke for the state it was dropped into.
  let started = teleport !== undefined;
  let status: Snapshot<TContext>['status'] = leaf?.config.type === 'final' ? 'done' : 'active';
  let error: unknown;

  // Invokes and `after` timers of every active state node. Leaving a node (or
  // stopping) drops its entry, so a stale promise or child resolving after the
  // fact is ignored — no transition, no setState-after-stop.
  const activities = new Map<StateNode<TContext>, Activity>();
  let children: Record<string, AnyActor> = {};

  const currentValue = () => leaf?.path ?? fallbackValue;
  const guardMeta: GuardMeta = { matches: path => matchesValue(currentValue(), path), child: id => children[id] };

  function makeSnapshot(): Snapshot<TContext> {
    const value = currentValue();
    const tags = new Set(activeNodes().flatMap(node => node.config.tags ?? []));
    return {
      value,
      context,
      status,
      error,
      children,
      matches: path => matchesValue(value, path),
      hasTag: tag => tags.has(tag),
    };
  }

  // The snapshot is cached and only replaced on an actual change, so
  // getSnapshot() is referentially stable for useSyncExternalStore.
  let snapshot = makeSnapshot();

  const listeners: SnapshotListener<TContext>[] = [];

  function activeNodes(): StateNode<TContext>[] {
    const nodes: StateNode<TContext>[] = [];
    for (let node = leaf; node && node !== root; node = node.parent) {
      nodes.unshift(node);
    }
    return nodes;
  }

  function pathTo(node: StateNode<TContext>): StateNode<TContext>[] {
    const nodes: StateNode<TContext>[] = [];
    for (let current: StateNode<TContext> | undefined = node; current && current !== root; current = current.parent) {
      nodes.unshift(current);
    }
    return nodes;
  }

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
    return transitions.find(transition => !transition.guard || transition.guard(context, event, guardMeta));
  }

  /** Whether a state's entry guard currently permits landing on it. */
  function canEnter(node: StateNode<TContext>, event: EventObject): boolean {
    const guard = node.config.guard;
    return !guard || guard(context, event, guardMeta);
  }

  function resolveTarget(source: StateNode<TContext>, target: string): StateNode<TContext> | undefined {
    if (target.startsWith('#')) {
      const [id = '', ...rest] = target.slice(1).split('.');
      return descend(ids.get(id), rest.join('.'));
    }
    if (target.startsWith('.')) {
      return descend(source, target.slice(1));
    }
    return descend(source.parent ?? root, target);
  }

  function plan(
    source: StateNode<TContext>,
    targetPath: string,
    event: EventObject,
  ): { nextLeaf: StateNode<TContext>; exiting: StateNode<TContext>[]; entering: StateNode<TContext>[] } | undefined {
    const target = resolveTarget(source, targetPath);
    const nextLeaf = target && initialLeaf(target);
    if (!target || !nextLeaf) {
      throw new Error(`Unknown transition target "${targetPath}" from "${source.path}"`);
    }
    let domain = isAncestor(source, target) ? source : (source.parent ?? root);
    while (domain !== root && domain !== source && !isAncestor(domain, target)) {
      domain = domain.parent ?? root;
    }
    const exiting = activeNodes()
      .filter(node => domain === root || isAncestor(domain, node))
      .reverse();
    const entering = pathTo(nextLeaf).filter(node => domain === root || isAncestor(domain, node));
    if (!entering.every(node => canEnter(node, event))) {
      return undefined;
    }
    return { nextLeaf, exiting, entering };
  }

  /**
   * Run a chosen transition: exit → actions → enter target.
   * Returns `false` — a true no-op — when an entry guard blocks it, so the
   * caller skips the commit and subscribers are never notified.
   */
  function takeTransition(
    transition: TransitionConfig<TContext, EventObject>,
    event: EventObject,
    source: StateNode<TContext>,
  ): boolean {
    if (transition.target === undefined) {
      runActions(transition.actions, event);
      return true;
    }
    const steps = plan(source, transition.target, event);
    if (!steps) {
      return false;
    }
    for (const node of steps.exiting) {
      runActions(node.config.exit, event);
      stopActivity(node);
    }
    runActions(transition.actions, event);
    leaf = steps.nextLeaf;
    for (const node of steps.entering) {
      runActions(node.config.entry, event);
    }
    settle(event);
    return true;
  }

  function findTransition(
    event: EventObject,
  ): { transition: TransitionConfig<TContext, EventObject>; source: StateNode<TContext> } | undefined {
    for (const source of activeNodes().reverse()) {
      const transition = pickTransition(normalizeTransition(source.config.on?.[event.type], event), event);
      if (transition) {
        return { transition, source };
      }
    }
    return undefined;
  }

  function takeAlways(event: EventObject): boolean {
    for (const source of activeNodes().reverse()) {
      const immediate = pickTransition(normalizeTransition(source.config.always, event), event);
      if (immediate && immediate.target !== undefined && takeTransition(immediate, event, source)) {
        return true;
      }
    }
    return false;
  }

  function settle(event: EventObject): void {
    if (leaf?.config.type === 'final' && leaf.parent === root) {
      const toError = leaf.config.error;
      status = toError ? 'error' : 'done';
      error = toError?.(context);
      stopAllActivities();
      return;
    }
    if (takeAlways(event)) {
      return;
    }
    for (const node of activeNodes()) {
      if (!activities.has(node)) {
        const activity: Activity = { timers: [], childId: undefined };
        activities.set(node, activity);
        startInvoke(node, activity, event);
        startAfterTimers(node, activity);
      }
    }
  }

  function fire(node: StateNode<TContext>, activity: Activity, raw: unknown, event: EventObject): void {
    if (status !== 'active' || activities.get(node) !== activity) {
      return;
    }
    const transition = pickTransition(normalizeTransition(raw, event), event);
    if (transition && takeTransition(transition, event, node)) {
      commit();
    }
  }

  function startInvoke(node: StateNode<TContext>, activity: Activity, event: EventObject): void {
    const invoke = node.config.invoke;
    if (!invoke) {
      return;
    }
    if (typeof invoke.src === 'string') {
      const provided = findActor(invoke.src);
      if (provided === undefined) {
        throw new Error(`Unknown actor "${invoke.src}" invoked from "${node.path}"`);
      }
      if (isMachine(provided)) {
        startChild(node, activity, invoke, provided);
      } else {
        settlePromise(node, activity, invoke, new Promise(resolve => resolve(provided(invoke.input?.(context)))));
      }
      return;
    }
    if (isMachine(invoke.src)) {
      startChild(node, activity, invoke, invoke.src);
      return;
    }
    // SAFETY: an inline src receives the actor's internal EventObject, but
    // InvokeConfig.src is typed to accept (context, TEvent | DoneInvokeEvent | ErrorInvokeEvent).
    // src implementations receive the INIT event on state entry and typically ignore it.
    settlePromise(node, activity, invoke, invoke.src(context, event as never));
  }

  function settlePromise(
    node: StateNode<TContext>,
    activity: Activity,
    invoke: InvokeConfig<TContext, EventObject>,
    promise: Promise<unknown>,
  ): void {
    Promise.resolve(promise).then(
      output => {
        const done: DoneInvokeEvent = { type: INVOKE_DONE, output };
        fire(node, activity, invoke.onDone, done);
      },
      (error: unknown) => {
        const failed: ErrorInvokeEvent = { type: INVOKE_ERROR, error };
        fire(node, activity, invoke.onError, failed);
      },
    );
  }

  function startChild(
    node: StateNode<TContext>,
    activity: Activity,
    invoke: InvokeConfig<TContext, EventObject>,
    logic: AnyStateMachine,
  ): void {
    const id = invoke.id ?? node.path;
    const input = invoke.input?.(context);
    const child = createActor(logic, {
      context: typeof input === 'object' && input !== null ? input : {},
      actors: { ...machine.actors, ...options.actors },
    });
    activity.childId = id;
    children = { ...children, [id]: child };
    child.subscribe(childSnapshot => {
      if (childSnapshot.status === 'done') {
        const done: DoneInvokeEvent = { type: INVOKE_DONE, output: childSnapshot.context };
        queueMicrotask(() => fire(node, activity, invoke.onDone, done));
      }
      if (childSnapshot.status === 'error') {
        const failed: ErrorInvokeEvent = { type: INVOKE_ERROR, error: childSnapshot.error };
        queueMicrotask(() => fire(node, activity, invoke.onError, failed));
      }
    });
    child.start();
  }

  function startAfterTimers(node: StateNode<TContext>, activity: Activity): void {
    const afterConfig = node.config.after;
    if (!afterConfig) {
      return;
    }
    for (const [delayStr, raw] of Object.entries<Transition<TContext, AfterEvent>>(afterConfig)) {
      const delay = Number(delayStr);
      const id = setTimeout(() => {
        activity.timers = activity.timers.filter(t => t !== id);
        const afterEvent: AfterEvent = { type: AFTER, delay };
        fire(node, activity, raw, afterEvent);
      }, delay);
      activity.timers.push(id);
    }
  }

  function stopActivity(node: StateNode<TContext>): void {
    const activity = activities.get(node);
    if (!activity) {
      return;
    }
    activities.delete(node);
    for (const id of activity.timers) {
      clearTimeout(id);
    }
    const { childId } = activity;
    if (childId !== undefined) {
      const { [childId]: child, ...rest } = children;
      children = rest;
      child?.stop();
    }
  }

  function stopAllActivities(): void {
    for (const node of [...activities.keys()]) {
      stopActivity(node);
    }
  }

  function commit(): void {
    snapshot = makeSnapshot();
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
      error = undefined;
      // Reset state and context so a restart (e.g. after StrictMode stop/start)
      // begins from idle rather than re-entering and re-invoking a mid-flight state.
      context = { ...machine.context, ...liveContextPatch };
      leaf = initialLeaf(root);
      fallbackValue = resolveInitial();
      for (const node of activeNodes()) {
        runActions(node.config.entry, INIT_EVENT);
      }
      settle(INIT_EVENT);
      commit();
      return actor;
    },

    stop() {
      if (status === 'stopped') {
        return;
      }
      started = false; // allow restart (e.g. StrictMode effect cleanup + remount)
      status = 'stopped';
      stopAllActivities();
      snapshot = makeSnapshot();
      for (let i = listeners.length; i--; ) {
        listeners[i](snapshot);
      }
      listeners.length = 0;
    },

    send(event) {
      if (!started || status !== 'active') {
        return;
      }
      const found = findTransition(event);
      if (!found) {
        return;
      } // event not handled in this state → ignored
      if (takeTransition(found.transition, event, found.source)) {
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
      const found = findTransition(event);
      if (!found) {
        return false;
      }
      const { transition, source } = found;
      return transition.target === undefined || plan(source, transition.target, event) !== undefined;
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
      const active = activeNodes();
      if (!active.every(node => canEnter(node, event))) {
        const reseated = initialLeaf(root);
        if (reseated && reseated !== leaf) {
          for (const node of active.reverse()) {
            runActions(node.config.exit, event);
            stopActivity(node);
          }
          leaf = reseated;
          for (const node of activeNodes()) {
            runActions(node.config.entry, event);
          }
          settle(event);
          commit();
        }
        return;
      }

      if (takeAlways(event)) {
        commit(); // nothing applies → no commit, no notify
      }
    },
  };

  actorMachines.set(actor, machine);
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
export function mockActor<TContext extends object, TEvent extends EventObject, TActors extends ProvidedActors>(
  machine: StateMachine<TContext, TEvent, TActors>,
  snapshot: { value: string; context?: Partial<TContext> },
): Actor<TContext, TEvent> {
  const inert: StateMachine<TContext, TEvent> = machine;
  return createActor(inert, { snapshot });
}
