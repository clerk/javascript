'use client';

import { ClerkLoaded, useClerk } from '@clerk/clerk-react';
import type { SignInStrategy as ClerkSignInStrategy } from '@clerk/types';
import { Slot } from '@radix-ui/react-slot';
import type { PropsWithChildren } from 'react';

import { FormStoreProvider, useFormStore } from '~/internals/machines/form.context';
import {
  SignInFlowProvider as SignInFlowContextProvider,
  StrategiesContext,
  useSignInFlow,
  useSignInStateMatcher,
  useSignInStrategies,
  useSignInThirdPartyProviders,
  useSSOCallbackHandler,
  useStrategy,
} from '~/internals/machines/sign-in.context';
import type { SignInStrategyName } from '~/internals/machines/sign-in.types';
import { Form } from '~/react/common/form';
import { Route, Router, useClerkRouter, useNextRouter } from '~/react/router';
import { createBrowserInspectorReactHook } from '~/react/utils/xstate';
import { type ThirdPartyStrategy } from '~/utils/third-party-strategies';

const { useBrowserInspector } = createBrowserInspectorReactHook();

// ================= SignInFlowProvider ================= //

function SignInFlowProvider({ children }: PropsWithChildren) {
  const clerk = useClerk();
  const router = useClerkRouter();
  const form = useFormStore();
  const { loading: inspectorLoading, inspector } = useBrowserInspector();

  if (!router) {
    throw new Error('clerk: Unable to locate ClerkRouter, make sure this is rendered within `<Router>`.');
  }

  if (inspectorLoading) {
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
      {/* TODO: Temporary hydration fix */}
      <ClerkLoaded>
        <FormStoreProvider>
          <SignInFlowProvider>{children}</SignInFlowProvider>
        </FormStoreProvider>
      </ClerkLoaded>
    </Router>
  );
}

// ================= SignInStart ================= //

export function SignInStart({ children }: PropsWithChildren) {
  const state = useSignInStateMatcher();
  const actorRef = useSignInFlow();

  return state.matches('Start') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

// ================= SignInFactorOne ================= //

export function SignInFactorOne({ children }: PropsWithChildren) {
  const state = useSignInStateMatcher();
  const actorRef = useSignInFlow();

  return state.matches('FirstFactor') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

// ================= SignInFactorTwo ================= //

export function SignInFactorTwo({ children }: PropsWithChildren) {
  const state = useSignInStateMatcher();
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

// ================= SignInSocialProviders ================= //

export type SignInSocialProvidersProps = { render(provider: ThirdPartyStrategy): React.ReactNode };

export function SignInSocialProviders({ render: provider }: SignInSocialProvidersProps) {
  const thirdPartyProviders = useSignInThirdPartyProviders();

  if (!thirdPartyProviders) {
    return null;
  }

  return (
    <>
      {thirdPartyProviders.strategies.map(strategy => (
        <Slot
          key={strategy}
          onClick={thirdPartyProviders.createOnClick(strategy)}
        >
          {provider(thirdPartyProviders.strategyToDisplayData[strategy])}
        </Slot>
      ))}
    </>
  );
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
