import { useEffect } from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { SignInStartCtx } from '~/react/sign-in/start';
import { SignInFirstFactorCtx, SignInSecondFactorCtx } from '~/react/sign-in/verifications';

import { SignInRouterCtx } from './context';

export type LoadingProps =
  | {
      scope: 'start' | 'verifications' | 'choose-strategy';
      children: (isLoading: { isLoading: boolean }) => React.ReactNode;
    }
  | {
      scope: 'global';
      children: (isGlobalLoading: { isGlobalLoading: boolean }) => React.ReactNode;
    };

export function Loading({ children, scope }: LoadingProps) {
  let startLoading = false;
  let firstFactorLoading = false;
  let secondFactorLoading = false;

  const ref = SignInRouterCtx.useActorRef();

  useEffect(() => {
    ref.subscribe(() => {
      const snap = ref.getPersistedSnapshot();
      console.log('snapshot', snap);
    });
  }, [ref]);

  // SignInRouterCtx.useSelector((state) => state

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
      return children({ isGlobalLoading });
    default:
      throw new ClerkElementsRuntimeError(
        `Invalid scope. Use 'start', 'verifications', 'choose-strategy', or 'global'.`,
      );
  }
}
