import { useSelector } from '@xstate/react';
import type { ActorRef, AnyActorRef, AnyMachineSnapshot, MachineSnapshot } from 'xstate';

type StatefulActor<TActor extends AnyActorRef> =
  TActor extends ActorRef<MachineSnapshot<any, any, any, infer TStateValue, any, any, any>, any> ? TStateValue : never;

/**
 * Generic hook to check if a state is active.
 *
 * @example
 * const ref = SignUpCtx.useActorRef();

 * useActiveStates(ref, { Start: 'Attempting' });
 * useActiveStates(ref, [{ Start: 'AwaitingInput' }, { Start: 'Attempting' }]);
 *
 * @param actor {ActorRef} Machine actor reference
 * @param state {StateValue | StateValue[]} The state(s) to check
 * @param exact {boolean} Whether to match all tags or any tag
 *
 * @returns {boolean}
 */
export function useActiveStates<TActor extends AnyActorRef, TState extends StatefulActor<TActor>>(
  actor: TActor,
  state: TState,
): boolean;
export function useActiveStates<TActor extends AnyActorRef, TState extends StatefulActor<TActor>>(
  actor: TActor,
  states: TState[],
): boolean;
export function useActiveStates<TActor extends AnyActorRef, TState extends StatefulActor<TActor>>(
  actor: TActor,
  states: TState | TState[],
): boolean {
  const currentState = useSelector<TActor, AnyMachineSnapshot>(
    actor,
    s => s,
    (prev, next) => prev.value === next.value,
  );

  if (Array.isArray(states)) {
    return states.some(s => currentState.matches(s));
  }

  return currentState.matches(states);
}
