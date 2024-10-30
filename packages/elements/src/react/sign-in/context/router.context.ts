import type { ActorRefFrom, AnyActorRef, AnyStateMachine, SnapshotFrom } from 'xstate';

import type {
  TSignInFirstFactorMachine,
  TSignInResetPasswordMachine,
  TSignInRouterMachine,
  TSignInSecondFactorMachine,
  TSignInStartMachine,
} from '~/internals/machines/sign-in';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TSignInRouterMachine>;

// This fixes the error: "The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed."
type SignInRouterCtxType = ReturnType<typeof createContextFromActorRef<TSignInRouterMachine>>;

export const SignInRouterCtx: SignInRouterCtxType = createContextFromActorRef<TSignInRouterMachine>('SignInRouterCtx');

function useSignInStep<M extends AnyStateMachine, T = ActorRefFrom<M>>(name: string) {
  return SignInRouterCtx.useSelector(state => state.children[name] as AnyActorRef) as T;
}

export const useSignInStartStep = () => useSignInStep<TSignInStartMachine>('start');
export const useSignInFirstFactorStep = () => useSignInStep<TSignInFirstFactorMachine>('firstFactor');
export const useSignInSecondFactorStep = () => useSignInStep<TSignInSecondFactorMachine>('secondFactor');
export const useSignInResetPasswordStep = () => useSignInStep<TSignInResetPasswordMachine>('resetPassword');

export const useSignInPasskeyAutofill = () =>
  SignInRouterCtx.useSelector(state => state.context.webAuthnAutofillSupport);
