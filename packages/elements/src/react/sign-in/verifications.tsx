'use client';

import type { SignInStrategyName } from '~/internals/machines/sign-in/sign-in.types';
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { SignInCtx } from '~/react/sign-in/contexts/sign-in.context';
import { useStrategy } from '~/react/sign-in/hooks/use-strategy.hook';

export type SignInFactorProps = React.PropsWithChildren<
  { first: true; second?: never } | { first?: never; second: true }
>;

export function SignInFactor({ children, first, second }: SignInFactorProps) {
  const ref = SignInCtx.useActorRef();
  const activeFirstState = useActiveTags(ref, 'state:first-factor');
  const activeSecondState = useActiveTags(ref, 'state:second-factor');

  const render = (first && activeFirstState) || (second && activeSecondState);
  return render ? children : null;
}

export type SignInVerificationProps = React.PropsWithChildren<{ name: SignInStrategyName }>;

export function SignInVerification({ children, name }: SignInVerificationProps) {
  const { active } = useStrategy(name);
  return active ? children : null;
}
