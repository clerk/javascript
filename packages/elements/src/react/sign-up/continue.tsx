'use client';

import type { PropsWithChildren } from 'react';

import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { SignUpCtx } from '~/react/sign-up/contexts/sign-up.context';

export type SignUpContinueProps = PropsWithChildren;

export function SignUpContinue({ children }: SignUpContinueProps) {
  const ref = SignUpCtx.useActorRef();
  const active = useActiveTags(ref, 'state:continue');

  return active ? <Form flowActor={ref}>{children}</Form> : null;
}
