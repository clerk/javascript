'use client';

import type { PropsWithChildren } from 'react';

import { useSignUpFlow, useSignUpStateMatcher } from '~/internals/machines/sign-up/sign-up.context';
import { Form } from '~/react/common/form';

export type SignUpStartProps = PropsWithChildren;

export function SignUpStart({ children }: SignUpStartProps) {
  const state = useSignUpStateMatcher();
  const actorRef = useSignUpFlow();

  return state.matches('Start') ? <Form flowActor={actorRef}>{children}</Form> : null;
}
