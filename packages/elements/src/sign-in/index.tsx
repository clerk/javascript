'use client';

import { useClerk } from '@clerk/clerk-react';

import {
  SignInFlowProvider as SignInFlowContextProvider,
  useSSOCallbackHandler,
} from '../internals/machines/sign-in.context';
import type { LoadedClerkWithEnv } from '../internals/machines/sign-in.types';
import { useNextRouter } from '../internals/router';
import { Route, Router, useClerkRouter } from '../internals/router-react';

type WithChildren<T = unknown> = T & { children?: React.ReactNode };

function SignInFlowProvider({ children }: WithChildren) {
  const clerk = useClerk() as unknown as LoadedClerkWithEnv;
  const router = useClerkRouter();

  if (!router) {
    throw new Error('clerk: Unable to locate ClerkRouter, make sure this is rendered within `<Router>`.');
  }

  return (
    <SignInFlowContextProvider
      options={{
        input: {
          clerk,
          router,
        },
      }}
    >
      {children}
    </SignInFlowContextProvider>
  );
}

export function SignIn({ children }: { children: React.ReactNode }): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  // TODO: Do something about `__unstable__environment` typing
  const router = useNextRouter();

  return (
    <Router
      router={router}
      basePath='/sign-in'
    >
      <SignInFlowProvider>{children}</SignInFlowProvider>
    </Router>
  );
}

export function SignInStart({ children }: WithChildren) {
  return <Route index>{children}</Route>;
}

export function SignInFactorOne({ children }: WithChildren) {
  return (
    <Route path='factor-one'>
      <h1>Factor One</h1>
      {children}
    </Route>
  );
}

export function SignInFactorTwo({ children }: WithChildren) {
  return (
    <Route path='factor-two'>
      <h1>Factor Two</h1>
      {children}
    </Route>
  );
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
