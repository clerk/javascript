import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import { useSelector } from '@xstate/react';
import React, { useEffect } from 'react';
import { createActor } from 'xstate';

import { ROUTING, SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { FormStoreProvider, useFormStore } from '~/internals/machines/form/form.context';
import type { SignInRouterInitEvent } from '~/internals/machines/sign-in';
import { SignInRouterMachine } from '~/internals/machines/sign-in';
import { inspect } from '~/internals/utils/inspector';
import { ClerkHostRouterContext, Router, useClerkRouter, useNextRouter, useVirtualRouter } from '~/react/router';
import { SignInRouterCtx } from '~/react/sign-in/context';

import { Form } from '../common/form';

type SignInFlowProviderProps = {
  children: React.ReactNode;
  exampleMode?: boolean;
  /**
   * Fallback markup to render while Clerk is loading
   */
  fallback?: React.ReactNode;
  isRootPath: boolean;
};

const actor = createActor(SignInRouterMachine, { inspect });
actor.start();

function SignInFlowProvider({ children, exampleMode, fallback, isRootPath }: SignInFlowProviderProps) {
  const clerk = useClerk();
  const router = useClerkRouter();
  const formRef = useFormStore();
  const isReady = useSelector(actor, state => state.value !== 'Idle');

  useEffect(() => {
    if (!clerk || !router) {
      return;
    }

    const cb = () => {
      const evt: SignInRouterInitEvent = {
        type: 'INIT',
        // @ts-expect-error - ignore error for now
        clerk,
        exampleMode,
        formRef,
        router,
        signUpPath: SIGN_UP_DEFAULT_BASE_PATH,
      };

      if (actor.getSnapshot().can(evt)) {
        actor.send(evt);
      }
    };

    if ('addOnLoaded' in clerk) {
      // @ts-expect-error - addOnLoaded doesn't exist on the clerk type, but it does on IsomorphicClerk, which can be hit when Elements is used standalone
      clerk.addOnLoaded(cb);
    } else {
      cb();
    }

    // Ensure that the latest instantiated formRef is attached to the router
    if (formRef && actor.getSnapshot().can({ type: 'RESET.STEP' })) {
      actor.send({
        type: 'FORM.ATTACH',
        formRef,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerk, exampleMode, formRef?.id, !!router, clerk.loaded]);

  return (
    <SignInRouterCtx.Provider actorRef={actor}>
      {isRootPath && !isReady && fallback ? <Form>{fallback}</Form> : null}
      {clerk.loaded && isReady ? children : null}
    </SignInRouterCtx.Provider>
  );
}

export type SignInRootProps = Omit<SignInFlowProviderProps, 'isRootPath'> & {
  /**
   * The base path for your sign-in route.
   * Will be automatically inferred in Next.js.
   * @example `/sign-in`
   */
  path?: string;
  /**
   * If you want to render Clerk Elements in e.g. a modal, use the `virtual` routing mode.
   */
  routing?: ROUTING;
};

/**
 * Root component for the sign-in flow. It sets up providers and state management for its children.
 * Must wrap all sign-in related components.
 *
 * @param {string} path - The root path the sign-in flow is mounted at. Will be automatically inferred in Next.js. You can set it to `/sign-in` for example.
 * @param {React.ReactNode} fallback - Fallback markup to render while Clerk is loading. Default: `null`
 * @param {string} routing - If you want to render Clerk Elements in e.g. a modal, use the `'virtual'` routing mode. Default: `'path'`
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
  exampleMode = false,
  fallback = null,
  path: pathProp,
  routing = ROUTING.path,
}: SignInRootProps): JSX.Element | null {
  const clerk = useClerk();
  const router = (routing === ROUTING.virtual ? useVirtualRouter : useNextRouter)();
  const pathname = router.pathname();
  const inferredPath = router.inferredBasePath?.();
  const path = pathProp || inferredPath || SIGN_IN_DEFAULT_BASE_PATH;
  const isRootPath = path === pathname;

  clerk.telemetry?.record(
    eventComponentMounted('Elements_SignInRoot', {
      exampleMode,
      fallback: Boolean(fallback),
      path,
      routing,
    }),
  );

  return (
    <ClerkHostRouterContext.Provider value={router}>
      <Router basePath={path}>
        <FormStoreProvider>
          <SignInFlowProvider
            exampleMode={exampleMode}
            fallback={fallback}
            isRootPath={isRootPath}
          >
            {children}
          </SignInFlowProvider>
        </FormStoreProvider>
      </Router>
    </ClerkHostRouterContext.Provider>
  );
}
