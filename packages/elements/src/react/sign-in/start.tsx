'use client';

import { useClerk } from '@clerk/clerk-react';
import { useActorRef } from '@xstate/react';
import { type PropsWithChildren } from 'react';

import { useFormStore } from '~/internals/machines/form/form.context';
import type { TSignInStartMachine } from '~/internals/machines/sign-in/start/machine';
import { SignInStartMachine } from '~/internals/machines/sign-in/start/machine';
import { Form } from '~/react/common/form';
import { useActiveTags, useBrowserInspector } from '~/react/hooks';
import { useClerkRouter } from '~/react/router';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

import { SignInRouterCtx } from './contexts/router.context';

export type SignInStartProps = PropsWithChildren;

export const SignInStartCtx = createContextFromActorRef<TSignInStartMachine>('SignInStartCtx');

export function SignInStart(props: SignInStartProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:start');
  const { loading } = useBrowserInspector();

  return activeState && !loading ? <SignInStartInner {...props} /> : null;
}

function SignInStartInner(props: SignInStartProps) {
  const routerRef = SignInRouterCtx.useActorRef();

  const clerk = useClerk();
  const form = useFormStore();
  const router = useClerkRouter();
  const { inspector } = useBrowserInspector();

  const ref = useActorRef(SignInStartMachine, {
    input: { clerk, basePath: router?.basePath, form, router: routerRef },
    inspect: inspector?.inspect,
  });

  return (
    <SignInStartCtx.Provider actorRef={ref}>
      <Form
        flowActor={ref}
        {...props}
      />
    </SignInStartCtx.Provider>
  );
}
