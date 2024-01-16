'use client';

import { ClerkLoaded, useClerk } from '@clerk/clerk-react';
import { Slot } from '@radix-ui/react-slot';
import type { PropsWithChildren } from 'react';

import { FormStoreProvider, useFormStore } from '~/internals/machines/form/form.context';
import {
  SignUpFlowProvider as SignUpFlowContextProvider,
  useSignUpFlow,
  useSignUpStateMatcher,
  useSignUpThirdPartyProviders,
} from '~/internals/machines/sign-up/sign-up.context';
import { Form } from '~/react/common/form';
import { Router, useClerkRouter, useNextRouter } from '~/react/router';
import { createBrowserInspectorReactHook } from '~/react/utils/xstate';
import type { ThirdPartyStrategy } from '~/utils/third-party-strategies';

const { useBrowserInspector } = createBrowserInspectorReactHook();

// ================= SignUpFlowProvider ================= //

function SignUpFlowProvider({ children }: PropsWithChildren) {
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
    <SignUpFlowContextProvider
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
    </SignUpFlowContextProvider>
  );
}

// ================= SignUp ================= //

export function SignUp({ children }: PropsWithChildren): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();

  return (
    <Router
      router={router}
      basePath='/sign-in'
    >
      <ClerkLoaded>
        <FormStoreProvider>
          <SignUpFlowProvider>{children}</SignUpFlowProvider>
        </FormStoreProvider>
      </ClerkLoaded>
    </Router>
  );
}

// ================= SignUpStart ================= //

export function SignUpStart({ children }: PropsWithChildren) {
  const state = useSignUpStateMatcher();
  const actorRef = useSignUpFlow();

  return state.matches('Start') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

// ================= SignUpContinue ================= //

export function SignUpContinue({ children }: PropsWithChildren) {
  const state = useSignUpStateMatcher();
  const actorRef = useSignUpFlow();

  return state.matches('Continue') ? <Form flowActor={actorRef}>{children}</Form> : null;
}

// ================= SignUpSocialProviders ================= //

export type SignUpSocialProvidersProps = { render(provider: ThirdPartyStrategy): React.ReactNode };

export function SignUpSocialProviders({ render: provider }: SignUpSocialProvidersProps) {
  const thirdPartyProviders = useSignUpThirdPartyProviders();

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
