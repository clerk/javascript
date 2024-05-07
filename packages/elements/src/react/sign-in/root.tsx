import { ClerkLoaded, ClerkLoading, useClerk } from '@clerk/clerk-react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import React, { useEffect } from 'react';
import { createActor } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { FormStoreProvider, useFormStore } from '~/internals/machines/form/form.context';
import type { SignInRouterInitEvent } from '~/internals/machines/sign-in';
import { SignInRouterMachine } from '~/internals/machines/sign-in';
import { consoleInspector } from '~/internals/utils/inspector';
import { Router, useClerkRouter, useNextRouter } from '~/react/router';
import { SignInRouterCtx } from '~/react/sign-in/context';

import { Form } from '../common/form';

type SignInFlowProviderProps = {
  children: React.ReactNode;
  exampleMode?: boolean;
};

const actor = createActor(SignInRouterMachine, { inspect: consoleInspector });
actor.start();

function SignInFlowProvider({ children, exampleMode }: SignInFlowProviderProps) {
  const clerk = useClerk();
  const router = useClerkRouter();
  const formRef = useFormStore();

  useEffect(() => {
    if (!clerk || !router) return;

    // @ts-expect-error -- This is actually an IsomorphicClerk instance
    clerk.addOnLoaded(() => {
      const evt: SignInRouterInitEvent = {
        type: 'INIT',
        clerk,
        exampleMode,
        formRef,
        router,
        signUpPath: SIGN_UP_DEFAULT_BASE_PATH,
      };

      if (actor.getSnapshot().can(evt)) {
        actor.send(evt);
      }
    });
  }, [clerk, exampleMode, formRef, router]);

  return <SignInRouterCtx.Provider actorRef={actor}>{children}</SignInRouterCtx.Provider>;
}

export type SignInRootProps = {
  /**
   * The base path for your sign-in route. Defaults to `/sign-in`.
   *
   * TODO: re-use usePathnameWithoutCatchAll from the next SDK
   */
  path?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  exampleMode?: boolean;
};

/**
 * Root component for the sign-in flow. It sets up providers and state management for its children.
 * Must wrap all sign-in related components.
 *
 * @param {string} path - The root path the sign-in flow is mounted at. Default: `/sign-in`
 * @param {React.ReactNode} fallback - Fallback markup to render while Clerk is loading. Default: `null`
 *
 * @example
 * import * as SignIn from "@clerk/elements/sign-in"
 *
 * export default SignInPage = () => (
 *  <SignIn.Root>
 *  </SignIn.Root>
 * )
 */
export function SignInRoot({
  children,
  path = SIGN_IN_DEFAULT_BASE_PATH,
  fallback = null,
  exampleMode,
}: SignInRootProps): JSX.Element | null {
  const clerk = useClerk();

  clerk.telemetry?.record(
    eventComponentMounted('Elements_SignInRoot', {
      path,
      fallback: Boolean(fallback),
      exampleMode: Boolean(exampleMode),
    }),
  );

  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();

  return (
    <Router
      basePath={path}
      router={router}
    >
      <FormStoreProvider>
        <SignInFlowProvider exampleMode={exampleMode}>
          <ClerkLoading>
            <Form>{fallback}</Form>
          </ClerkLoading>
          <ClerkLoaded>{children}</ClerkLoaded>
        </SignInFlowProvider>
      </FormStoreProvider>
    </Router>
  );
}
