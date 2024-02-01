'use client';

import type { PropsWithChildren } from 'react';

import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { SignInCtx } from '~/react/sign-in/contexts/sign-in.context';

export type SignInStartProps = PropsWithChildren;

export function SignInStart({ children }: SignInStartProps) {
  const ref = SignInCtx.useActorRef();
  const activeState = useActiveTags(ref, 'state:start');

  return activeState ? <Form flowActor={ref}>{children}</Form> : null;
}
