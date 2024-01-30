'use client';

import type { PropsWithChildren } from 'react';

import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { useSignInFlow } from '~/react/sign-in/contexts/machine.context';

export type SignInStartProps = PropsWithChildren;

export function SignInStart({ children }: SignInStartProps) {
  const actorRef = useSignInFlow();
  const activeState = useActiveTags(actorRef, 'state:start');

  return activeState ? <Form flowActor={actorRef}>{children}</Form> : null;
}
