'use client';

import { ClerkLoaded, useClerk } from '@clerk/clerk-react';
import { useActorRef } from '@xstate/react';
import type { PropsWithChildren } from 'react';

import { FormStoreProvider } from '~/internals/machines/form/form.context';
import { SignInRouterMachine } from '~/internals/machines/sign-in/machines';
import { useBrowserInspector } from '~/react/hooks';
import { Router, useClerkRouter, useNextRouter } from '~/react/router';
import { SignInRouterCtx } from '~/react/sign-in/context';

type SignInFlowProviderProps = Required<PropsWithChildren>;

function SignInFlowProvider({ children }: SignInFlowProviderProps) {
  const clerk = useClerk();
  const router = useClerkRouter();
  const { inspector } = useBrowserInspector();

  const ref = useActorRef(SignInRouterMachine, {
    input: { clerk, router, signUpPath: '/sign-up' },
    inspect: inspector?.inspect,
  });

  return <SignInRouterCtx.Provider actorRef={ref}>{children}</SignInRouterCtx.Provider>;
}

export type SignInRootProps = SignInFlowProviderProps & { path?: string };

/**
 * Root component for the sign-in flow. It sets up providers and state management for its children.
 * Must wrap all sign-in related components.
 * @example
 * import { SignIn } from "@clerk/elements/sign-in"
 *
 * export default SignInPage = () => (
 *  <SignIn>
 *  </SignIn>
 * )
 */
export function SignInRoot({ children, path = '/sign-in' }: SignInRootProps): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();
  const { loading: inspectorLoading } = useBrowserInspector();

  if (inspectorLoading) {
    return null;
  }

  return (
    <Router
      basePath={path}
      router={router}
    >
      <ClerkLoaded>
        <FormStoreProvider>
          <SignInFlowProvider>{children}</SignInFlowProvider>
        </FormStoreProvider>
      </ClerkLoaded>
    </Router>
  );
}
