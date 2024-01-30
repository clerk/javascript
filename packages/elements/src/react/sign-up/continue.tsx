'use client';

import type { PropsWithChildren } from 'react';

import { useSignUpFlow, useSignUpStateMatcher } from '~/internals/machines/sign-up/sign-up.context';
import { Form } from '~/react/common/form';

export type SignUpContinueProps = PropsWithChildren;

export function SignUpContinue({ children }: SignUpContinueProps) {
  const state = useSignUpStateMatcher();
  const actorRef = useSignUpFlow();

  return state.matches('Continue') ? <Form flowActor={actorRef}>{children}</Form> : null;
}
