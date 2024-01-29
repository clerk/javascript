'use client';

import type { PropsWithChildren } from 'react';

import { useSignInFlow, useSignInStateMatcher } from '~/internals/machines/sign-in/sign-in.context';
import { Form } from '~/react/common/form';

export type SignInStartProps = PropsWithChildren;

export function SignInStart({ children }: SignInStartProps) {
  const state = useSignInStateMatcher();
  const actorRef = useSignInFlow();

  return state.matches('Start') ? <Form flowActor={actorRef}>{children}</Form> : null;
}
