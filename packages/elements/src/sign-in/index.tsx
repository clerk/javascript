'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';

import { SignInActor } from '../internals/machines/sign-in.context';
import { useNextRouter } from '../internals/router';
import { Route, Router } from '../internals/router-react';

export function SignIn({ children }: { children: React.ReactNode }): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();
  const clerk = useClerk();

  // @ts-expect-error - clerk.clerkjs isn't typed
  if (!router || !clerk?.clerkjs) {
    return null;
  }

  // @ts-expect-error - clerk.clerkjs isn't typed
  const client = clerk.clerkjs.client;

  return (
    <Router
      router={router}
      basePath='/sign-in'
    >
      <SignInActor.Provider options={{ input: { client, router } }}>{children}</SignInActor.Provider>
    </Router>
  );
}

export function SubmitButton() {
  const ref = SignInActor.useActorRef();
  // const fields = SignInRootMachine.useSelector((state) => state.context.fields['identifier']);
  // console.log(ref.getSnapshot());

  return (
    <button
      style={{ fontWeight: 'bold', backgroundColor: '#eee', padding: '0.5rem 1rem', borderRadius: '0.25rem' }}
      onClick={() => ref.send({ type: 'SUBMIT' })}
      type='button'
    >
      Submit
    </button>
  );
}

export function SignInStartInner({ children }: { children: React.ReactNode }) {
  const ref = SignInActor.useActorRef();

  useEffect(() => ref.send({ type: 'START' }), [ref]);

  return <>{children}</>;
}

export function SignInStart({ children }: { children: React.ReactNode }) {
  return (
    <Route index>
      <SignInStartInner>
        <h1>Start</h1>
        {children}
        <SubmitButton />
      </SignInStartInner>
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
