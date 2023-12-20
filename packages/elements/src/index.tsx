'use client';
import type { ClerkHostRouter } from './internals/router';
import { Route, Router, useNextRouter } from './internals/router';

export function HelloWorld(): JSX.Element {
  return <p>Hello World!</p>;
}

export function SignIn({ router, children }: { router: ClerkHostRouter; children: React.ReactNode }): JSX.Element {
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

export { useNextRouter };
