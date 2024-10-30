import type { ActorRefFrom, AnyActorRef, AnyStateMachine, SnapshotFrom } from 'xstate';

import {
  type TSignUpContinueMachine,
  type TSignUpRouterMachine,
  type TSignUpStartMachine,
  type TSignUpVerificationMachine,
} from '~/internals/machines/sign-up';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TSignUpRouterMachine>;

// This fixes the error: "The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed."
type SignUpRouterCtxType = ReturnType<typeof createContextFromActorRef<TSignUpRouterMachine>>;

export const SignUpRouterCtx: SignUpRouterCtxType = createContextFromActorRef<TSignUpRouterMachine>('SignUpRouterCtx');

function useSignUpStep<M extends AnyStateMachine, T = ActorRefFrom<M>>(name: string) {
  return SignUpRouterCtx.useSelector(state => state.children[name] as AnyActorRef) as T;
}

export const useSignUpStartStep = () => useSignUpStep<TSignUpStartMachine>('start');
export const useSignUpContinueStep = () => useSignUpStep<TSignUpContinueMachine>('continue');
export const useSignUpVerificationStep = () => useSignUpStep<TSignUpVerificationMachine>('verification');
