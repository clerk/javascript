import { ClerkLoaded, ClerkLoading, useClerk } from '@clerk/clerk-react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import { useSelector } from '@xstate/react';
import { useEffect } from 'react';
import { createActor } from 'xstate';

import { ROUTING, SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { FormStoreProvider, useFormStore } from '~/internals/machines/form/form.context';
import type { SignUpRouterInitEvent } from '~/internals/machines/sign-up';
import { SignUpRouterMachine } from '~/internals/machines/sign-up';
import { inspect } from '~/internals/utils/inspector';
import { Router, useClerkRouter, useNextRouter, useVirtualRouter } from '~/react/router';
import { SignUpRouterCtx } from '~/react/sign-up/context';

import { Form } from '../common/form';

type SignUpFlowProviderProps = {
  children: React.ReactNode;
  exampleMode?: boolean;
};

const actor = createActor(SignUpRouterMachine, { inspect });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerk, exampleMode, formRef?.id, !!router]);

  return isReady ? <SignUpRouterCtx.Provider actorRef={ref}>{children}</SignUpRouterCtx.Provider> : null;
}

export type SignUpRootProps = SignUpFlowProviderProps & {
  fallback?: React.ReactNode;
  path?: string;
  routing?: ROUTING;
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
  exampleMode,
  fallback = null,
  path = SIGN_UP_DEFAULT_BASE_PATH,
  routing,
}: SignUpRootProps): JSX.Element | null {
  const clerk = useClerk();

  clerk.telemetry?.record(
    eventComponentMounted('Elements_SignUpRoot', {
      path,
      fallback: Boolean(fallback),
      exampleMode: Boolean(exampleMode),
    }),
  );

  // TODO: eventually we'll rely on the framework SDK to specify its host router, but for now we'll default to Next.js
  const router = (routing === ROUTING.virtual ? useVirtualRouter : useNextRouter)();
  const isRootPath = path === router.pathname();

  return (
    <Router
      basePath={path}
      router={router}
    >
      <FormStoreProvider>
        <SignUpFlowProvider exampleMode={exampleMode}>
          {isRootPath ? (
            <ClerkLoading>
              <Form>{fallback}</Form>
            </ClerkLoading>
          ) : null}
          <ClerkLoaded>{children}</ClerkLoaded>
        </SignUpFlowProvider>
      </FormStoreProvider>
    </Router>
  );
}
