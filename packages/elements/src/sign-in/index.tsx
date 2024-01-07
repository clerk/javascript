'use client';

import { useClerk } from '@clerk/clerk-react';
import type { SignInStrategy as ClerkSignInStrategy } from '@clerk/types';
import type { createBrowserInspector } from '@statelyai/inspect';
import type { PropsWithChildren } from 'react';

import { Form } from '../common/form';
import { FormStoreProvider, useFormStore } from '../internals/machines/form.context';
import {
  SignInFlowProvider as SignInFlowContextProvider,
  StrategiesContext,
  useSignInFlow,
  useSignInState,
  useSignInStrategies,
  useSSOCallbackHandler,
  useStrategy,
} from '../internals/machines/sign-in.context';
import type { LoadedClerkWithEnv, SignInStrategyName } from '../internals/machines/sign-in.types';
import { useNextRouter } from '../internals/router';
import { Route, Router, useClerkRouter } from '../internals/router-react';

// ================= XState Inspector ================= //

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

// ================= SignInFlowProvider ================= //

function SignInFlowProvider({ children }: PropsWithChildren) {
  // TODO: Do something about `__unstable__environment` typing
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

// ================= SignIn ================= //

export function SignIn({ children }: PropsWithChildren): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
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

// ================= SignInStart ================= //

export function SignInStart({ children }: PropsWithChildren) {
  const state = useSignInState();
  const actorRef = useSignInFlow();

  return state.matches('Start') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

// ================= SignInFactorOne ================= //

export function SignInFactorOne({ children }: PropsWithChildren) {
  const state = useSignInState();
  const actorRef = useSignInFlow();

  return state.matches('FirstFactor') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

// ================= SignInFactorTwo ================= //

export function SignInFactorTwo({ children }: PropsWithChildren) {
  const state = useSignInState();
  const actorRef = useSignInFlow();

  return state.matches('SecondFactor') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

// ================= SignInStrategies ================= //

export type SignInStrategiesProps = PropsWithChildren<{ preferred?: ClerkSignInStrategy }>;

export function SignInStrategies({ children, preferred }: SignInStrategiesProps) {
  const { current, isActive, shouldRender } = useSignInStrategies(preferred);
  const actorRef = useSignInFlow();

  return shouldRender ? (
    <StrategiesContext.Provider value={{ current: current, preferred, isActive }}>
      <Form flowActor={actorRef}>{children}</Form>
    </StrategiesContext.Provider>
  ) : null;
}

// ================= SignInStrategy ================= //

export type SignInStrategyProps = PropsWithChildren<{ name: SignInStrategyName }>;

export function SignInStrategy({ children, name }: SignInStrategyProps) {
  const { shouldRender } = useStrategy(name);
  return shouldRender ? children : null;
}

// ================= SignInSSOCallback ================= //

// TODO: Remove and rely on SignInMachine
export function SignInSSOCallbackInner() {
  useSSOCallbackHandler();
  return null;
}

export function SignInSSOCallback({ children }: PropsWithChildren) {
  return (
    <Route path='sso-callback'>
      <SignInSSOCallbackInner />
      {children ? children : 'Loading...'}
    </Route>
  );
}
