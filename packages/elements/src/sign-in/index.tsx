'use client';
import { type ClerkHostRouter, useNextRouter } from '../internals/router';
import { Route, Router } from '../internals/router-react';

export function SignIn({ children }: { router?: ClerkHostRouter; children: React.ReactNode }): JSX.Element {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();

  return (
    <Router
      router={router}
      basePath='/sign-in'
    >
      {children}
    </Router>
  );
}

export function SignInStart({ children }: { children: React.ReactNode }) {
  return (
    <Route index>
      Start
      {children}
    </Route>
  );
}

export function SignInFactorOne({ children }: { children: React.ReactNode }) {
  return (
    <Route path='factor-one'>
      Factor One
      {children}
    </Route>
  );
}

export function SignInFactorTwo({ children }: { children: React.ReactNode }) {
  return (
    <Route path='factor-two'>
      Factor Two
      {children}
    </Route>
  );
}

export function SignInSSOCallback() {
  return <Route path='sso-callback'>SSOCallback</Route>;
}
