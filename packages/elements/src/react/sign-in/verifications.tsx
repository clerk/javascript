'use client';

import { useSignInStateMatcher, useStrategy } from '~/internals/machines/sign-in/sign-in.context';
import type { SignInStrategyName } from '~/internals/machines/sign-in/sign-in.types';

export type SignInFactorProps = React.PropsWithChildren<
  { first: true; second?: never } | { first?: never; second: true }
>;

export function SignInFactor({ children, first, second }: SignInFactorProps) {
  const state = useSignInStateMatcher();
  const render = (first && state.matches('FirstFactor')) || (second && state.matches('SecondFactor'));
  return render ? children : null;
}

export type SignInVerificationProps = React.PropsWithChildren<{ name: SignInStrategyName }>;

export function SignInVerification({ children, name }: SignInVerificationProps) {
  const { shouldRender } = useStrategy(name);
  return shouldRender ? children : null;
}
