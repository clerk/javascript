import { ClerkLoaded, ClerkLoading, useClerk } from '@clerk/clerk-react';
import { useSelector } from '@xstate/react';
import { useEffect } from 'react';
import { createActor } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { FormStoreProvider } from '~/internals/machines/form/form.context';
import { SignUpRouterMachine } from '~/internals/machines/sign-up/machines';
import type { SignUpRouterInitEvent } from '~/internals/machines/sign-up/types';
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
  const isReady = useSelector(ref, state => state.value !== 'Idle');

  useEffect(() => {
    if (!clerk || !router) return;

    // @ts-expect-error -- This is actually an IsomorphicClerk instance
    clerk.addOnLoaded(() => {
      const evt: SignUpRouterInitEvent = {
        type: 'INIT',
        clerk,
        router,
        signInPath: SIGN_IN_DEFAULT_BASE_PATH,
        exampleMode,
      };

      if (ref.getSnapshot().can(evt)) {
        ref.send(evt);
      }
    });
  }, [clerk, router, exampleMode]);

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
 * @example
 * import { SignUp } from "@clerk/elements/sign-up"
 *
 * export default SignUpPage = () => (
 *  <SignUp>
 *  </SignUp>
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
