import { useSelector } from '@xstate/react';
import type { AnyActorRef, SnapshotFrom } from 'xstate';

import type { TSignInRouterMachine } from '~/internals/machines/sign-in/machines';
import type { SignInRouterLoadingContext } from '~/internals/machines/sign-in/types';

type TMachineSnapshot = SnapshotFrom<TSignInRouterMachine>;
type TContext = SignInRouterLoadingContext;

type UseLoadingReturn = [boolean, { step: TContext['step']; strategy: TContext['strategy'] }];

const selectLoading = (snapshot: TMachineSnapshot) => snapshot?.context?.loading;
const compareLoadingValue = (prev: TContext, next: TContext) => prev?.value === next?.value;

// TODO: Restrict actor to only allow SignInRouterCtx or SignUpRouterCtx

/**
 * Generic hook to check the loading state inside the context of a machine. Should only be used with `SignInRouterCtx` or `SignUpRouterCtx`.
 *
 * @example
 * const ref = SignInRouterCtx.useActorRef();
 *
 * useLoading(ref);
 */
export function useLoading<TActor extends AnyActorRef>(actor: TActor): UseLoadingReturn {
  const ctx = useSelector<TActor, TContext>(actor, selectLoading, compareLoadingValue);

  if (!ctx) {
    return [false, { step: undefined, strategy: undefined }];
  }

  return [ctx.value, { step: ctx.step, strategy: ctx.strategy }];
}
