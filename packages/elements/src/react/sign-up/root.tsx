import { ClerkLoaded, ClerkLoading, useClerk } from '@clerk/clerk-react';
import { useSelector } from '@xstate/react';
import { useEffect } from 'react';
import { createActor } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { FormStoreProvider, useFormStore } from '~/internals/machines/form/form.context';
import type { SignUpRouterInitEvent } from '~/internals/machines/sign-up';
import { SignUpRouterMachine } from '~/internals/machines/sign-up';
import { consoleInspector } from '~/internals/utils/inspector';
import { Router, useClerkRouter, useNextRouter } from '~/react/router';
import { SignUpRouterCtx } from '~/react/sign-up/context';

import { Form } from '../common/form';

type SignUpFlowProviderProps = {
  children: React.ReactNode;
  exampleMode?: boolean;
};

const actor = createActor(SignUpRouterMachine, { inspect: consoleInspector });
const ref = actor.start();

function SignUpFlowProvider({ children, exampleMode }: SignUpFlowProviderProps) {
  const clerk = useClerk();
  const router = useClerkRouter();
  const formRef = useFormStore();
  const isReady = useSelector(ref, state => state.value !== 'Idle');

  useEffect(() => {
    if (!clerk || !router) return;

    // @ts-expect-error -- This is actually an IsomorphicClerk instance
    clerk.addOnLoaded(() => {
      const evt: SignUpRouterInitEvent = {
        type: 'INIT',
        clerk,
        exampleMode,
        formRef,
        router,
        signInPath: SIGN_IN_DEFAULT_BASE_PATH,
      };

      if (ref.getSnapshot().can(evt)) {
        ref.send(evt);
      }
    });
  }, [clerk, exampleMode, formRef, router]);

  return isReady ? <SignUpRouterCtx.Provider actorRef={ref}>{children}</SignUpRouterCtx.Provider> : null;
}

export type SignUpRootProps = {
  path?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  exampleMode?: boolean;
};

/**
 * Root component for the sign-up flow. It sets up providers and state management for its children.
 * Must wrap all sign-up related components.
 *
 * @param {string} path - The root path the sign-up flow is mounted at. Default: `/sign-up`
 * @param {React.ReactNode} fallback - Fallback markup to render while Clerk is loading. Default: `null`
 *
 * @example
 * import * as SignUp from "@clerk/elements/sign-up"
 *
 * export default SignUpPage = () => (
 *  <SignUp.Root>
 *  </SignUp.Root>
 * )
 */
export function SignUpRoot({
  children,
  path = SIGN_UP_DEFAULT_BASE_PATH,
  fallback = null,
  exampleMode,
}: SignUpRootProps): JSX.Element | null {
  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = useNextRouter();

  return (
    <Router
      basePath={path}
      router={router}
    >
      <FormStoreProvider>
        <SignUpFlowProvider exampleMode={exampleMode}>
          <ClerkLoading>
            <Form>{fallback}</Form>
          </ClerkLoading>
          <ClerkLoaded>{children}</ClerkLoaded>
        </SignUpFlowProvider>
      </FormStoreProvider>
    </Router>
  );
}
