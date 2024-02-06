'use client';

import type { PropsWithChildren } from 'react';

import type { SignInStrategyName } from '~/internals/machines/sign-in/types';
import { useActiveTags } from '~/react/hooks';
import { useStrategy } from '~/react/sign-in/contexts';

import { SignInRouterCtx } from './contexts/router.context';

export type SignInFactorProps = PropsWithChildren;

export function SignInSecondFactor({ children }: SignInFactorProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:first-factor');
  return activeState ? children : null;
}

export function SignInFirstFactor({ children }: SignInFactorProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:second-factor');

  return activeState ? children : null;
}

export type SignInVerificationProps = React.PropsWithChildren<{ name: SignInStrategyName }>;

export function SignInVerification({ children, name }: SignInVerificationProps) {
  const { active } = useStrategy(name);
  return active ? children : null;
}
