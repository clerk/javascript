'use client';

import { type PropsWithChildren } from 'react';

import type { TSignInStartMachine } from '~/internals/machines/sign-in/machines';
import { SignInStartMachine } from '~/internals/machines/sign-in/machines';
import { Form } from '~/react/common/form';
import { useActiveTags, useBrowserInspector } from '~/react/hooks';
import { SignInRouterCtx, useSignInRouteRegistration } from '~/react/sign-in/context';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SignInStartProps = PropsWithChildren;

export const SignInStartCtx = createContextFromActorRef<TSignInStartMachine>('SignInStartCtx');

export function SignInStart(props: SignInStartProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:start');
  const { loading } = useBrowserInspector();

  return activeState && !loading ? <SignInStartInner {...props} /> : null;
}

function SignInStartInner(props: SignInStartProps) {
  const ref = useSignInRouteRegistration('start', SignInStartMachine);

  if (!ref) {
    return null;
  }

  return (
    <SignInStartCtx.Provider actorRef={ref}>
      <Form
        flowActor={ref}
        {...props}
      />
    </SignInStartCtx.Provider>
  );
}
