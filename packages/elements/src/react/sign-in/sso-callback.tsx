import type { PropsWithChildren } from 'react';

import { useActiveTags } from '~/react/hooks';
import { SignInRouterCtx } from '~/react/sign-in/context';

export type SignInSSOCallbackProps = PropsWithChildren;

export function SignInSSOCallback({ children }: SignInSSOCallbackProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'step:callback');

  return activeState ? children : null;
}
