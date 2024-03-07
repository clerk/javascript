'use client';

import { ClerkLoaded, useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { createActor } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { FormStoreProvider } from '~/internals/machines/form/form.context';
import { SignInRouterMachine } from '~/internals/machines/sign-in/machines';
import type { SignInRouterInitEvent } from '~/internals/machines/sign-in/types';
import { consoleInspector } from '~/internals/utils/inspector';
import { Router, useClerkRouter, useNextRouter } from '~/react/router';
import { SignInRouterCtx } from '~/react/sign-in/context';

type SignInFlowProviderProps = WithChildrenProp;

const actor = createActor(SignInRouterMachine, { inspect: consoleInspector });
const ref = actor.start();

function SignInFlowProvider({ children }: SignInFlowProviderProps) {
  const clerk = useClerk();
  const router = useClerkRouter();

  useEffect(() => {
    if (!clerk || !router) return;

    const evt: SignInRouterInitEvent = {
      type: 'INIT',
      clerk,
      router,
      signUpPath: SIGN_UP_DEFAULT_BASE_PATH,
    };

    if (ref.getSnapshot().can(evt)) {
      ref.send(evt);
    }
  }, [clerk, router]);

  return <SignInRouterCtx.Provider actorRef={ref}>{children}</SignInRouterCtx.Provider>;
}

export type SignInRootProps = SignInFlowProviderProps & { path?: string };

/**
 * Root component for the sign-in flow. It sets up providers and state management for its children.
 * Must wrap all sign-in related components.
 *
 * @example
 * import { SignIn } from "@clerk/elements/sign-in"
 *
 * export default SignInPage = () => (
 *  <SignIn>
 *  </SignIn>
 * )
 */
export function SignInRoot({ children, path = SIGN_IN_DEFAULT_BASE_PATH }: SignInRootProps): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();

  return (
    <ClerkLoaded>
      <Router
        basePath={path}
        router={router}
      >
        <FormStoreProvider>
          <SignInFlowProvider>{children}</SignInFlowProvider>
        </FormStoreProvider>
      </Router>
    </ClerkLoaded>
  );
}
