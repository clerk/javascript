'use client';

import { ClerkLoaded, useClerk } from '@clerk/clerk-react';
import type { PropsWithChildren } from 'react';

import { FormStoreProvider, useFormStore } from '~/internals/machines/form/form.context';
import { Router, useClerkRouter, useNextRouter } from '~/react/router';
import { SignUpCtx } from '~/react/sign-up/contexts/sign-up.context';
import { createBrowserInspectorReactHook } from '~/react/utils/xstate';

const { useBrowserInspector } = createBrowserInspectorReactHook();

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
    <SignUpCtx.Provider
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
    </SignUpCtx.Provider>
  );
}
export type SignUpRootProps = PropsWithChildren<{ path?: string }>;

export function SignUpRoot({ children, path = '/sign-up' }: SignUpRootProps): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();

  return (
    <Router
      basePath={path}
      router={router}
    >
      <ClerkLoaded>
        <FormStoreProvider>
          <SignUpFlowProvider>{children}</SignUpFlowProvider>
        </FormStoreProvider>
      </ClerkLoaded>
    </Router>
  );
}
