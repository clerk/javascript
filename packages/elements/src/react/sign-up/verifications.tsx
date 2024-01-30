'use client';

import type { PropsWithChildren } from 'react';

import { useSignUpFlow, useSignUpStateMatcher } from '~/internals/machines/sign-up/sign-up.context';
import type { SignUpVerificationTags } from '~/internals/machines/sign-up/sign-up.machine';
import { Form } from '~/react/common/form';

export type SignUpVerifyProps = PropsWithChildren;

export function SignUpVerify({ children }: SignUpVerifyProps) {
  const actorRef = useSignUpFlow();
  const state = useSignUpStateMatcher();

  return state.matches('Verification') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

export type SignUpVerificationProps = PropsWithChildren<{ name: SignUpVerificationTags }>;

export function SignUpVerification({ children, name }: SignUpVerificationProps) {
  const state = useSignUpStateMatcher();
  return state.hasTag(name) ? children : null;
}
