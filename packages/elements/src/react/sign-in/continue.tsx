'use client';

import type { SignInStrategy as ClerkSignInStrategy } from '@clerk/types';
import type { PropsWithChildren } from 'react';

import { StrategiesContext, useSignInFlow, useSignInStrategies } from '~/internals/machines/sign-in/sign-in.context';
import { Form } from '~/react/common/form';

export type SignInContinueProps = PropsWithChildren<{ preferred?: ClerkSignInStrategy }>;

export function SignInContinue({ children, preferred }: SignInContinueProps) {
  const { current, isActive, shouldRender } = useSignInStrategies(preferred);
  const actorRef = useSignInFlow();

  return shouldRender ? (
    <StrategiesContext.Provider value={{ current: current, preferred, isActive }}>
      <Form flowActor={actorRef}>{children}</Form>
    </StrategiesContext.Provider>
  ) : null;
}
