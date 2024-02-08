'use client';

import { type PropsWithChildren } from 'react';

import type { TSignUpStartMachine } from '~/internals/machines/sign-up/machines';
import { SignUpStartMachine } from '~/internals/machines/sign-up/machines';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx, useSignUpRouteRegistration } from '~/react/sign-up/context';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SignUpStartProps = PropsWithChildren;

export const SignUpStartCtx = createContextFromActorRef<TSignUpStartMachine>('SignUpStartCtx');

export function SignUpStart(props: SignUpStartProps) {
  const routerRef = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:start');

  return activeState ? <SignUpStartInner {...props} /> : null;
}

function SignUpStartInner(props: SignUpStartProps) {
  const ref = useSignUpRouteRegistration('start', SignUpStartMachine);

  if (!ref) {
    return null;
  }

  return (
    <SignUpStartCtx.Provider actorRef={ref}>
      <Form
        flowActor={ref}
        {...props}
      />
    </SignUpStartCtx.Provider>
  );
}
