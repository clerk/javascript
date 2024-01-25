'use client';

import { useClerk } from '@clerk/clerk-react';
import type { OAuthProvider, SignInStrategy as ClerkSignInStrategy, Web3Provider } from '@clerk/types';
import { Slot } from '@radix-ui/react-slot';
import type { PropsWithChildren } from 'react';

import { FormStoreProvider, useFormStore } from '~/internals/machines/form/form.context';
import {
  SignInFlowProvider as SignInFlowContextProvider,
  StrategiesContext,
  useSignInFlow,
  useSignInStateMatcher,
  useSignInStrategies,
  useSignInThirdPartyProvider,
  useSignInThirdPartyProviders,
  useStrategy,
} from '~/internals/machines/sign-in/sign-in.context';
import type { SignInStrategyName } from '~/internals/machines/sign-in/sign-in.types';
import { Form } from '~/react/common/form';
import { Router, useClerkRouter, useNextRouter } from '~/react/router';
import { createBrowserInspectorReactHook } from '~/react/utils/xstate';
import type { ThirdPartyStrategy } from '~/utils/third-party-strategies';

import type { SocialProviderProps } from '../common/third-party-providers/social-provider';
import { SocialProvider, SocialProviderIcon } from '../common/third-party-providers/social-provider';

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
          signUpPath: '/sign-up',
        },
        inspect: inspector?.inspect,
      }}
    >
      {children}
    </SignInFlowContextProvider>
  );
}

// ================= SignIn ================= //

export function SignIn({ children, path = '/sign-in' }: PropsWithChildren<{ path?: string }>): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();

  return (
    <Router
      router={router}
      basePath={path}
    >
      <FormStoreProvider>
        <SignInFlowProvider>{children}</SignInFlowProvider>
      </FormStoreProvider>
    </Router>
  );
}

// ================= SignInStart ================= //

export function SignInStart({ children }: PropsWithChildren) {
  const router = useClerkRouter();
  const state = useSignInStateMatcher();
  const actorRef = useSignInFlow();

  return state.matches('Start') || router?.match(undefined, true) ? <Form flowActor={actorRef}>{children}</Form> : null;
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

// ================= SignInContinue ================= //

export type SignInContinueProps = PropsWithChildren<{ preferred?: ClerkSignInStrategy }>;

export function SignInContinue({ children, preferred }: SignInContinueProps) {
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

// ================= SignInSocialProvider ================= //

export interface SignInSocialProviderProps extends Omit<SocialProviderProps, 'provider'> {
  name: OAuthProvider | Web3Provider;
}

export function SignInSocialProvider({ name, ...rest }: SignInSocialProviderProps) {
  const thirdPartyProvider = useSignInThirdPartyProvider(name);

  return (
    <SocialProvider
      {...rest}
      provider={thirdPartyProvider}
    />
  );
}

export const SignInSocialProviderIcon = SocialProviderIcon;
