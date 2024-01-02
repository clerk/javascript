'use client';

import { useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';

import { SignInFlowProvider, useSignInFlow } from '../internals/machines/sign-in.context';
import { useNextRouter } from '../internals/router';
import { Route, Router } from '../internals/router-react';

export function SignIn({ children }: { children: React.ReactNode }): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();
  const clerk = useClerk();

  return (
    <Router
      router={router}
      basePath='/sign-in'
    >
      <SignInFlowProvider options={{ input: { clerk, router } }}>{children}</SignInFlowProvider>
    </Router>
  );
}

export function SignInStartInner({ children }: { children: React.ReactNode }) {
  const ref = useSignInFlow();

  useEffect(() => ref.send({ type: 'START' }), [ref]);

  return children;
}

export function SignInStart({ children }: { children: React.ReactNode }) {
  return (
    <Route index>
      <SignInStartInner>{children}</SignInStartInner>
    </Route>
  );
}

export function SignInFactorOne({ children }: { children: React.ReactNode }) {
  return (
    <Route path='factor-one'>
      <h1>Factor One</h1>
      {children}
    </Route>
  );
}

export function SignInFactorTwo({ children }: { children: React.ReactNode }) {
  return (
    <Route path='factor-two'>
      <h1>Factor Two</h1>
      {children}
    </Route>
  );
}

export function SignInSSOCallback() {
  return <Route path='sso-callback'>SSOCallback</Route>;
}
