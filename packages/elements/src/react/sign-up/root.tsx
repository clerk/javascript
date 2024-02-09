'use client';

import { ClerkLoaded, useClerk } from '@clerk/clerk-react';
import { useActorRef } from '@xstate/react';
import type { PropsWithChildren } from 'react';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { FormStoreProvider } from '~/internals/machines/form/form.context';
import { SignUpRouterMachine } from '~/internals/machines/sign-up/machines';
import { useConsoleInspector } from '~/react/hooks';
import { Router, useClerkRouter, useNextRouter } from '~/react/router';
import { SignUpRouterCtx } from '~/react/sign-up/context';

type SignUpFlowProviderProps = Required<PropsWithChildren>;

function SignUpFlowProvider({ children }: SignUpFlowProviderProps) {
  const clerk = useClerk();
  const router = useClerkRouter();
  const inspector = useConsoleInspector();

  const ref = useActorRef(SignUpRouterMachine, {
    input: { clerk, router, signInPath: '/sign-in' },
    inspect: inspector,
  });

  return <SignUpRouterCtx.Provider actorRef={ref}>{children}</SignUpRouterCtx.Provider>;
}

export type SignUpRootProps = SignUpFlowProviderProps & { path?: string };

/**
 * Root component for the sign-up flow. It sets up providers and state management for its children.
 * Must wrap all sign-up related components.
 *
 * @example
 * import { SignUp } from "@clerk/elements/sign-up"
 *
 * export default SignUpPage = () => (
 *  <SignUp>
 *  </SignUp>
 * )
 */
export function SignUpRoot({ children, path = SIGN_UP_DEFAULT_BASE_PATH }: SignUpRootProps): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();

  return (
    <ClerkLoaded>
      <Router
        basePath={path}
        router={router}
      >
        <FormStoreProvider>
          <SignUpFlowProvider>{children}</SignUpFlowProvider>
        </FormStoreProvider>
      </Router>
    </ClerkLoaded>
  );
}
