'use client';

import { ClerkLoaded, useClerk } from '@clerk/clerk-react';
import type { PropsWithChildren } from 'react';

import { FormStoreProvider, useFormStore } from '~/internals/machines/form/form.context';
import { Router, useClerkRouter, useNextRouter } from '~/react/router';
import { SignInCtx } from '~/react/sign-in/contexts/sign-in.context';
import { createBrowserInspectorReactHook } from '~/react/utils/xstate';

const { useBrowserInspector } = createBrowserInspectorReactHook();

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
    <SignInCtx.Provider
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
    </SignInCtx.Provider>
  );
}

export function SignInRoot({ children, path = '/sign-in' }: PropsWithChildren<{ path?: string }>): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();

  return (
    <Router
      router={router}
      basePath={path}
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
