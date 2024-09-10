import type { ActorRefFrom, AnyActorRef, AnyStateMachine, SnapshotFrom } from 'xstate';

import type {
  TSignInFirstFactorMachine,
  TSignInRouterMachine,
  TSignInSecondFactorMachine,
} from '~/internals/machines/sign-in';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TSignInRouterMachine>;

export const SignInRouterCtx = createContextFromActorRef<TSignInRouterMachine>('SignInRouterCtx');

function useSignInStep<M extends AnyStateMachine, T = ActorRefFrom<M>>(name: string) {
  return SignInRouterCtx.useSelector(state => state.children[name] as AnyActorRef) as T;
}

export const useSignInFirstFactorStep = () => useSignInStep<TSignInFirstFactorMachine>('firstFactor');
export const useSignInSecondFactorStep = () => useSignInStep<TSignInSecondFactorMachine>('secondFactor');

export const useSignInPasskeyAutofill = () =>
  SignInRouterCtx.useSelector(state => state.context.webAuthnAutofillSupport);
