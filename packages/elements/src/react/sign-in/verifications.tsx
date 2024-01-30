'use client';

import type { SignInStrategyName } from '~/internals/machines/sign-in/sign-in.types';
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { useSignInFlow } from '~/react/sign-in/contexts/machine.context';
import { useStrategy } from '~/react/sign-in/hooks/use-strategy.hook';

export type SignInFactorProps = React.PropsWithChildren<
  { first: true; second?: never } | { first?: never; second: true }
>;

export function SignInFactor({ children, first, second }: SignInFactorProps) {
  const actorRef = useSignInFlow();
  const activeFirstState = useActiveTags(actorRef, 'state:first-factor');
  const activeSecondState = useActiveTags(actorRef, 'state:second-factor');

  const render = (first && activeFirstState) || (second && activeSecondState);
  return render ? children : null;
}

export type SignInVerificationProps = React.PropsWithChildren<{ name: SignInStrategyName }>;

export function SignInVerification({ children, name }: SignInVerificationProps) {
  const { active } = useStrategy(name);
  return active ? children : null;
}
