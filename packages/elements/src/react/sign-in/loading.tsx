import { useSelector } from "@xstate/react";
import * as React from "react"
import type { SnapshotFrom } from "xstate";

import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { TSignInRouterMachine } from "~/internals/machines/sign-in/machines";
import { matchLoadingScope } from "~/internals/machines/utils/loading";
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { SignInStartCtx } from '~/react/sign-in/start';
import { SignInFirstFactorCtx, SignInSecondFactorCtx } from '~/react/sign-in/verifications';

import { SignInRouterCtx } from "./context";

const loadingSelector = (state: SnapshotFrom<TSignInRouterMachine>) => state.context.loading

type LoadingScope = 'start' | 'verifications' | 'choose-strategy' | 'global';

export type LoadingProps = {
  scope: LoadingScope;
  children: (isLoading: { isLoading: boolean }) => React.ReactNode;
}

export function Loading({ children, scope }: LoadingProps) {
  let startLoading = false;
  let firstFactorLoading = false;
  let secondFactorLoading = false;

  const routerRef = SignInRouterCtx.useActorRef();
  const loadingDetails = useSelector(routerRef, loadingSelector)

  const isScopeLoading = React.useCallback((scope: LoadingScope) => (scope ? matchLoadingScope(scope, loadingDetails) : false), [loadingDetails])

  const startRef = SignInStartCtx.useActorRef(true);
  if (startRef) {
    startLoading = useActiveTags(startRef, 'state:loading');
  }

  const firstFactorRef = SignInFirstFactorCtx.useActorRef(true);
  if (firstFactorRef) {
    firstFactorLoading = useActiveTags(firstFactorRef, 'state:loading');
  }

  const secondFactorRef = SignInSecondFactorCtx.useActorRef(true);
  if (secondFactorRef) {
    secondFactorLoading = useActiveTags(secondFactorRef, 'state:loading');
  }

  const isGlobalLoading = startLoading || firstFactorLoading || secondFactorLoading;

  switch (scope) {
    case 'start':
      return children({ isLoading: startLoading });
    case 'verifications':
      return children({ isLoading: firstFactorLoading || secondFactorLoading });
    case 'choose-strategy':
      return children({ isLoading: firstFactorLoading });
    case 'global':
      return children({ isLoading: isGlobalLoading });
    default:
      throw new ClerkElementsRuntimeError(
        `Invalid scope. Use 'start', 'verifications', 'choose-strategy', or 'global'.`,
      );
  }
}
