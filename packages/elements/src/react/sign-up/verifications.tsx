'use client';

import type { PropsWithChildren } from 'react';

import type { SignUpVerificationTags } from '~/internals/machines/sign-up/sign-up.machine';
import { Form } from '~/react/common/form';
import { SignUpCtx } from '~/react/sign-up/contexts/sign-up.context';

import { useActiveTags } from '../hooks/use-active-tags.hook';

export type SignUpVerifyProps = PropsWithChildren;

export function SignUpVerify({ children }: SignUpVerifyProps) {
  const ref = SignUpCtx.useActorRef();
  const active = useActiveTags(ref, 'state:verification');

  return active ? <Form flowActor={ref}>{children}</Form> : null;
}

export type SignUpVerificationProps = PropsWithChildren<{ name: SignUpVerificationTags }>;

export function SignUpVerification({ children, name: tag }: SignUpVerificationProps) {
  const ref = SignUpCtx.useActorRef();
  const active = useActiveTags(ref, tag);

  return active ? children : null;
}
