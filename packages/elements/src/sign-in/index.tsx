'use client';

import { useClerk } from '@clerk/clerk-react';
import type { SignInStrategy as ClerkSignInStrategy } from '@clerk/types';
import type { createBrowserInspector } from '@statelyai/inspect';
import { createContext, type PropsWithChildren } from 'react';

import { Form } from '../common/form';
import { FormStoreProvider, useFormStore } from '../internals/machines/form.context';
import {
  SignInFlowProvider as SignInFlowContextProvider,
  useSignInFlow,
  useSignInFlowSelector,
  useSignInState,
  useSignInStrategies,
  useSSOCallbackHandler,
} from '../internals/machines/sign-in.context';
import type { LoadedClerkWithEnv } from '../internals/machines/sign-in.types';
import { useNextRouter } from '../internals/router';
import { Route, Router, useClerkRouter } from '../internals/router-react';

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

// ================= SELECTORS ================= //

export function SignInStart({ children }: PropsWithChildren) {
  const state = useSignInState();
  const actorRef = useSignInFlow();

  return state.matches('Start') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

// ================= SELECTORS ================= //

export function SignInFactorOne({ children }: PropsWithChildren) {
  const state = useSignInState();
  const actorRef = useSignInFlow();

  return state.matches('FirstFactor') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

// ================= SELECTORS ================= //

export function SignInFactorTwo({ children }: PropsWithChildren) {
  const state = useSignInState();
  const actorRef = useSignInFlow();

  return state.matches('SecondFactor') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

type StrategiesContextValue = {
  current: ClerkSignInStrategy | undefined;
  isActive: (name: string) => boolean;
  preferred: ClerkSignInStrategy | undefined;
};

const StrategiesContext = createContext<StrategiesContextValue>({
  current: undefined,
  isActive: () => false,
  preferred: undefined,
});

type SignInStrategiesProps = PropsWithChildren<{ preferred?: ClerkSignInStrategy }>;

// function _useStrategy(name: ClerkSignInStrategy | 'oauth' | 'web3') {
//   const ctx = useContext(StrategiesContext);

//   if (ctx) {
//     throw new ClerkElementsRuntimeError('useSignInStrategy must be used within a <SignInStrategies> component.');
//   }

//   const { current, preferred, isActive } = ctx;

//   return {
//     current,
//     preferred,
//     get shouldRender() {
//       return isActive(name);
//     },
//   };
// }

export function SignInStrategies({ children, preferred }: SignInStrategiesProps) {
  const { current, isActive, shouldRender } = useSignInStrategies(preferred);

  return shouldRender ? (
    <StrategiesContext.Provider value={{ current: current, preferred, isActive }}>
      {children}
    </StrategiesContext.Provider>
  ) : null;
}

export function SignInStrategy({ children, name }: PropsWithChildren<{ name: string }>) {
  const currentStrategy = useSignInFlowSelector(state => state.context.currentFactor?.strategy);
  return currentStrategy === name ? children : null;
}

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
