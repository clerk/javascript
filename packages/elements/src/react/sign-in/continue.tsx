'use client';

import type { SignInStrategy as ClerkSignInStrategy } from '@clerk/types';
import { type PropsWithChildren } from 'react';

import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { useSignInFlow } from '~/react/sign-in/contexts/machine.context';
import { StrategiesContext } from '~/react/sign-in/contexts/strategies.context';
import { useStrategies } from '~/react/sign-in/hooks/use-strategies.hook';

export type SignInContinueProps = PropsWithChildren<{ preferred?: ClerkSignInStrategy }>;

export function SignInContinue({ children, preferred }: SignInContinueProps) {
  const actorRef = useSignInFlow();
  const activeState = useActiveTags(actorRef, ['state:first-factor', 'state:second-factor']);
  const { current, isActive } = useStrategies(preferred);

  return activeState ? (
    <StrategiesContext.Provider value={{ current: current, preferred, isActive }}>
      <Form flowActor={actorRef}>{children}</Form>
    </StrategiesContext.Provider>
  ) : null;
}
