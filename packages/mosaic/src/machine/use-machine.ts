import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';

import { createActor } from './create-actor';
import type { ActionMap, Actor, ActorMap, CreateActorOptions, EventObject, Snapshot, StateMachine } from './types';

export interface UseMachineOptions<TInput> extends CreateActorOptions<TInput> {
  /** Called once when the machine reaches a final state (`type: 'final'`). */
  onDone?: () => void;
}

/**
 * Bind an already-created actor to a component. Re-renders on every transition.
 *
 * Use this for a **shared** actor (one instance several components read from).
 * The actor's lifecycle (`start`/`stop`) is the caller's responsibility — this
 * hook only subscribes. A {@link restoreActor} can be passed directly to render a
 * restored step.
 */
export function useActor<TContext extends object, TEvent extends EventObject, TStates extends string = string>(
  actor: Actor<TContext, TEvent, TStates>,
): [Snapshot<TContext, TStates, TEvent>, Actor<TContext, TEvent, TStates>['send']] {
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
export function useMachine<
  TContext extends object,
  TEvent extends EventObject,
  TStates extends string,
  TActions extends ActionMap,
  TActors extends ActorMap,
  TInput,
>(
  machine: StateMachine<TContext, TEvent, TStates, TActions, TActors, TInput>,
  options?: UseMachineOptions<TInput>,
): [Snapshot<TContext, TStates, TEvent>, Actor<TContext, TEvent, TStates>['send'], Actor<TContext, TEvent, TStates>] {
  const ownedRef = useRef<{
    logic: StateMachine<TContext, TEvent, TStates, TActions, TActors, TInput>;
    actor: Actor<TContext, TEvent, TStates>;
  } | null>(null);
  if (ownedRef.current === null) {
    const logic = machine.provide({});
    ownedRef.current = { logic, actor: createActor(logic, options) };
  }
  const { logic, actor } = ownedRef.current;
  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
  const snapshot = useSyncExternalStore(actor.subscribe, actor.getSnapshot, actor.getSnapshot);

  useEffect(() => {
    actor.start();
    return () => actor.stop();
    // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
  }, [actor]);

  useLayoutEffect(() => {
    if (machine.config === logic.config) {
      logic.implementations = machine.implementations;
    }
  });

  const onDoneRef = useRef(options?.onDone);
  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
  onDoneRef.current = options?.onDone;
  const doneReportedRef = useRef(false);
  useEffect(() => {
    if (snapshot.status === 'done' && !doneReportedRef.current) {
      doneReportedRef.current = true;
      onDoneRef.current?.();
    }
  }, [snapshot.status]);

  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
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
  selector: (snapshot: Snapshot<TContext, TStates, TEvent>) => TSelected,
  equals: (a: TSelected, b: TSelected) => boolean = Object.is,
): TSelected {
  const selectorRef = useRef(selector);
  const equalsRef = useRef(equals);
  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
  selectorRef.current = selector;
  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
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
export function useMachineLogger<TContext extends object>(
  label: string,
  snapshot: Pick<Snapshot<TContext>, 'value' | 'context'>,
): void {
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
