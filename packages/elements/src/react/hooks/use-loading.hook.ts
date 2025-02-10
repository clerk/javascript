import { useSelector } from '@xstate/react';
import type { ActorRefFrom, SnapshotFrom } from 'xstate';

import type { SignInRouterLoadingContext, TSignInRouterMachine } from '~/internals/machines/sign-in';
import type { SignUpRouterLoadingContext, TSignUpRouterMachine } from '~/internals/machines/sign-up';

export type ActorSignIn = ActorRefFrom<TSignInRouterMachine>;
export type ActorSignUp = ActorRefFrom<TSignUpRouterMachine>;

type LoadingContext<T> = T extends ActorSignIn ? SignInRouterLoadingContext : SignUpRouterLoadingContext;
type UseLoadingReturn<T> = [
  isLoading: boolean,
  { step: LoadingContext<T>['step']; strategy: LoadingContext<T>['strategy']; action: LoadingContext<T>['action'] },
];

const selectLoading = <T extends SnapshotFrom<TSignInRouterMachine> | SnapshotFrom<TSignUpRouterMachine>>(
  snapshot: T,
) => snapshot?.context?.loading;
const compareLoadingValue = <T extends SignInRouterLoadingContext | SignUpRouterLoadingContext>(prev: T, next: T) =>
  prev?.isLoading === next?.isLoading;

/**
 * Generic hook to check the loading state inside the context of a machine. Should only be used with `SignInRouterCtx` or `SignUpRouterCtx`.
 *
 * @param actor - The actor reference of the machine
 *
 * @example
 * const ref = SignInRouterCtx.useActorRef();
 *
 * useLoading(ref);
 */
export function useLoading<TActor extends ActorSignIn | ActorSignUp>(actor: TActor): UseLoadingReturn<TActor> {
  const loadingCtx = useSelector(actor, selectLoading, compareLoadingValue) as LoadingContext<TActor>;

  if (!loadingCtx) {
    return [false, { step: undefined, strategy: undefined, action: undefined }];
  }

  return [loadingCtx.isLoading, { step: loadingCtx.step, strategy: loadingCtx.strategy, action: loadingCtx.action }];
}
