import type { ActorRefFrom, AnyActorRef, AnyStateMachine, SnapshotFrom } from 'xstate';

import {
  type TSignUpContinueMachine,
  type TSignUpRouterMachine,
  type TSignUpStartMachine,
  type TSignUpVerificationMachine,
} from '~/internals/machines/sign-up';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TSignUpRouterMachine>;

export const SignUpRouterCtx = createContextFromActorRef<TSignUpRouterMachine>('SignUpRouterCtx');

function useSignUpStep<M extends AnyStateMachine, T = ActorRefFrom<M>>(name: string) {
  return SignUpRouterCtx.useSelector(state => state.children[name] as AnyActorRef) as T;
}

export const useSignUpStartStep = () => useSignUpStep<TSignUpStartMachine>('start');
export const useSignUpContinueStep = () => useSignUpStep<TSignUpContinueMachine>('continue');
export const useSignUpVerificationStep = () => useSignUpStep<TSignUpVerificationMachine>('verification');
