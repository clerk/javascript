'use client';

import { useClerk } from '@clerk/clerk-react';
import type { createBrowserInspector } from '@statelyai/inspect';

import { Form } from '../common/form';
import { FormStoreProvider, useFormStore } from '../internals/machines/form.context';
import {
  SignInFlowProvider as SignInFlowContextProvider,
  useSignInFlow,
  useSignInState,
  useSSOCallbackHandler,
} from '../internals/machines/sign-in.context';
import type { LoadedClerkWithEnv } from '../internals/machines/sign-in.types';
import { useNextRouter } from '../internals/router';
import { Route, Router, useClerkRouter } from '../internals/router-react';

type WithChildren<T = unknown> = T & { children?: React.ReactNode };

const DEBUG = process.env.NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG === 'true';
let inspector: ReturnType<typeof createBrowserInspector>;

if (DEBUG && typeof window !== 'undefined') {
  const getInspector = async () => {
    const { createBrowserInspector } = (await import('@statelyai/inspect')).default;
    return createBrowserInspector();
  };

  getInspector()
    .then(mod => (inspector = mod))
    .catch(console.error);
}

function SignInFlowProvider({ children }: WithChildren) {
  const clerk = useClerk() as unknown as LoadedClerkWithEnv;
  const router = useClerkRouter();
  const form = useFormStore();

  if (!router) {
    throw new Error('clerk: Unable to locate ClerkRouter, make sure this is rendered within `<Router>`.');
  }

  if (DEBUG && !inspector) {
    return null;
  }

  return (
    <SignInFlowContextProvider
      options={{
        input: {
          clerk,
          router,
          form,
        },
        inspect: inspector?.inspect,
      }}
    >
      {children}
    </SignInFlowContextProvider>
  );
}

export function SignIn({ children }: WithChildren): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  // TODO: Do something about `__unstable__environment` typing
  const router = useNextRouter();

  return (
    <Router
      router={router}
      basePath='/sign-in'
    >
      <FormStoreProvider>
        <SignInFlowProvider>{children}</SignInFlowProvider>
      </FormStoreProvider>
    </Router>
  );
}

export function SignInStart({ children }: WithChildren) {
  const state = useSignInState();
  const actorRef = useSignInFlow();

  return state.matches('Start') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

export function SignInFactorOne({ children }: WithChildren) {
  const state = useSignInState();
  const actorRef = useSignInFlow();

  return state.matches('FirstFactor') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

export function SignInFactorTwo({ children }: WithChildren) {
  const state = useSignInState();
  const actorRef = useSignInFlow();

  return state.matches('SecondFactor') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

export function SignInSSOCallbackInner() {
  useSSOCallbackHandler();
  return null;
}

export function SignInSSOCallback({ children }: WithChildren) {
  return (
    <Route path='sso-callback'>
      <SignInSSOCallbackInner />
      {children ? children : 'Loading...'}
    </Route>
  );
}
