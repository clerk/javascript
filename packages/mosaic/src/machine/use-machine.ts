import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';

import { createActor } from './create-actor';
import type { Actor, CreateActorOptions, EventObject, Snapshot, StateMachine } from './types';

export interface UseMachineOptions<TContext, TStates extends string = string> extends CreateActorOptions<
  TContext,
  TStates
> {
  /** Called once when the machine reaches a final state (`type: 'final'`). */
  onDone?: () => void;
}

/**
 * Bind an already-created actor to a component. Re-renders on every transition.
 *
 * Use this for a **shared** actor (one instance several components read from).
 * The actor's lifecycle (`start`/`stop`) is the caller's responsibility — this
 * hook only subscribes. A {@link mockActor} can be passed directly to render a
 * teleported step.
 */
export function useActor<TContext extends object, TEvent extends EventObject, TStates extends string = string>(
  actor: Actor<TContext, TEvent, TStates>,
): [Snapshot<TContext, TStates>, Actor<TContext, TEvent, TStates>['send']] {
  const snapshot = useSyncExternalStore(actor.subscribe, actor.getSnapshot, actor.getSnapshot);
  return [snapshot, actor.send];
}

/**
 * Create-and-own an actor for a machine, started for the component's lifetime.
 *
 * Convenience wrapper for the common "one component drives one flow" case:
 * returns `[snapshot, send]`, starts the actor on mount and stops it on unmount.
 *
 * ```tsx
 * const [snapshot, send] = useMachine(machine);
 * return <button onClick={() => send({ type: 'TOGGLE' })}>{snapshot.value}</button>;
 * ```
 */
export function useMachine<TContext extends object, TEvent extends EventObject, TStates extends string = string>(
  machine: StateMachine<TContext, TEvent, TStates>,
  options?: UseMachineOptions<TContext, TStates>,
): [Snapshot<TContext, TStates>, Actor<TContext, TEvent, TStates>['send'], Actor<TContext, TEvent, TStates>] {
  const actorRef = useRef<Actor<TContext, TEvent, TStates> | null>(null);
  if (actorRef.current === null) {
    actorRef.current = createActor(machine, options);
  }
  const actor = actorRef.current;
  const snapshot = useSyncExternalStore(actor.subscribe, actor.getSnapshot, actor.getSnapshot);

  useEffect(() => {
    actor.start();
    return () => actor.stop();
  }, [actor]);

  // Keep injected context (e.g. a function from props) current on every render.
  // useLayoutEffect with no deps runs synchronously after every render, before
  // paint — ensuring setContext fires before any user event triggers an invoke.
  useLayoutEffect(() => {
    if (options?.context) {
      actor.setContext(options.context);
    }
  });

  const onDoneRef = useRef(options?.onDone);
  onDoneRef.current = options?.onDone;
  const doneReportedRef = useRef(false);
  useEffect(() => {
    if (snapshot.status === 'done' && !doneReportedRef.current) {
      doneReportedRef.current = true;
      onDoneRef.current?.();
    }
  }, [snapshot.status]);

  return [snapshot, actor.send, actor];
}

/**
 * Subscribe to a memoised slice of an actor's snapshot. The component only
 * re-renders when the *selected* projection changes (per `equals`, default
 * `Object.is`) — not on every transition.
 *
 * This is the primary way to consume a shared actor; reach for it whenever a
 * component cares about one field rather than the whole snapshot.
 *
 * ```ts
 * const error = useSelector(actor, snap => snap.context.error);
 * ```
 */
export function useSelector<
  TContext extends object,
  TEvent extends EventObject,
  TSelected,
  TStates extends string = string,
>(
  actor: Actor<TContext, TEvent, TStates>,
  selector: (snapshot: Snapshot<TContext, TStates>) => TSelected,
  equals: (a: TSelected, b: TSelected) => boolean = Object.is,
): TSelected {
  const selectorRef = useRef(selector);
  const equalsRef = useRef(equals);
  selectorRef.current = selector;
  equalsRef.current = equals;

  const selectedRef = useRef<{ value: TSelected } | null>(null);

  const getSelection = useCallback(() => {
    const next = selectorRef.current(actor.getSnapshot());
    const previous = selectedRef.current;
    if (previous !== null && equalsRef.current(previous.value, next)) {
      // Return the cached reference so useSyncExternalStore bails out of the render.
      return previous.value;
    }
    selectedRef.current = { value: next };
    return next;
  }, [actor]);

  return useSyncExternalStore(actor.subscribe, getSelection, getSelection);
}

/**
 * Logs machine state transitions to the console. Drop it directly below a
 * `useMachine` or `useActor` call; remove before shipping.
 *
 * ```ts
 * const [snapshot, send] = useMachine(machine);
 * useMachineLogger('deleteOrg', snapshot);
 * ```
 *
 * Output: `[deleteOrg] idle → confirming {error: null}`
 */
export function useMachineLogger<TContext extends object>(label: string, snapshot: Snapshot<TContext>): void {
  const prevValue = useRef<string | undefined>(undefined);

  useEffect(() => {
    const current = snapshot.value;
    const previous = prevValue.current;
    prevValue.current = current;

    if (previous === undefined) {
      console.log(`[${label}] ${current}`, snapshot.context);
    } else if (previous !== current) {
      console.log(`[${label}] ${previous} → ${current}`, snapshot.context);
    }
  });
}
