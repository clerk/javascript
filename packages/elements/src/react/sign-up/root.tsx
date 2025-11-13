import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import { useSelector } from '@xstate/react';
import { useEffect } from 'react';
import { createActor } from 'xstate';

import { ROUTING, SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { FormStoreProvider, useFormStore } from '~/internals/machines/form/form.context';
import type { SignUpRouterInitEvent } from '~/internals/machines/sign-up';
import { SignUpRouterMachine } from '~/internals/machines/sign-up';
import { inspect } from '~/internals/utils/inspector';
import { ClerkHostRouterContext, Router, useClerkRouter, useNextRouter, useVirtualRouter } from '~/react/router';
import { SignUpRouterCtx } from '~/react/sign-up/context';

import { Form } from '../common/form';

type SignUpFlowProviderProps = {
  children: React.ReactNode;
  exampleMode?: boolean;
  /**
   * Fallback markup to render while Clerk is loading
   */
  fallback?: React.ReactNode;
  isRootPath: boolean;
};

const actor = createActor(SignUpRouterMachine, { inspect });
actor.start();

function SignUpFlowProvider({ children, exampleMode, fallback, isRootPath }: SignUpFlowProviderProps) {
  const clerk = useClerk();
  const router = useClerkRouter();
  const formRef = useFormStore();
  const isReady = useSelector(actor, state => state.value !== 'Idle');

  useEffect(() => {
    if (!clerk || !router) {
      return;
    }

    const cb = () => {
      const evt: SignUpRouterInitEvent = {
        type: 'INIT',
        // @ts-expect-error - ignore error for now
        clerk,
        exampleMode,
        formRef,
        router,
        signInPath: SIGN_IN_DEFAULT_BASE_PATH,
      };

      if (actor.getSnapshot().can(evt)) {
        actor.send(evt);
      }

      // Ensure that the latest instantiated formRef is attached to the router
      if (formRef && actor.getSnapshot().can({ type: 'RESET.STEP' })) {
        actor.send({
          type: 'FORM.ATTACH',
          formRef,
        });
      }
    };

    if ('addOnLoaded' in clerk) {
      // @ts-expect-error - addOnLoaded doesn't exist on the clerk type, but it does on IsomorphicClerk, which can be hit when Elements is used standalone
      clerk.addOnLoaded(cb);
    } else {
      cb();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerk, exampleMode, formRef?.id, !!router, clerk.loaded]);

  return (
    <SignUpRouterCtx.Provider actorRef={actor}>
      {isRootPath && !isReady && fallback ? <Form>{fallback}</Form> : null}
      {clerk.loaded && isReady ? children : null}
    </SignUpRouterCtx.Provider>
  );
}

export type SignUpRootProps = Omit<SignUpFlowProviderProps, 'isRootPath'> & {
  /**
   * The base path for your sign-up route.
   * Will be automatically inferred in Next.js.
   * @example `/sign-up`
   */
  path?: string;
  /**
   * If you want to render Clerk Elements in e.g. a modal, use the `virtual` routing mode.
   */
  routing?: ROUTING;
};

/**
 * Root component for the sign-up flow. It sets up providers and state management for its children.
 * Must wrap all sign-up related components.
 *
 * @param {string} path - The root path the sign-up flow is mounted at. Will be automatically inferred in Next.js. You can set it to `/sign-up` for example.
 * @param {React.ReactNode} fallback - Fallback markup to render while Clerk is loading. Default: `null`
 * @param {string} routing - If you want to render Clerk Elements in e.g. a modal, use the `'virtual'` routing mode. Default: `'path'`
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
  exampleMode = false,
  fallback = null,
  path: pathProp,
  routing = ROUTING.path,
}: SignUpRootProps): JSX.Element | null {
  const clerk = useClerk();
  const router = (routing === ROUTING.virtual ? useVirtualRouter : useNextRouter)();
  const pathname = router.pathname();
  const inferredPath = router.inferredBasePath?.();
  const path = pathProp || inferredPath || SIGN_UP_DEFAULT_BASE_PATH;
  const isRootPath = path === pathname;

  clerk.telemetry?.record(
    eventComponentMounted('Elements_SignUpRoot', {
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
          <SignUpFlowProvider
            exampleMode={exampleMode}
            fallback={fallback}
            isRootPath={isRootPath}
          >
            {children}
          </SignUpFlowProvider>
        </FormStoreProvider>
      </Router>
    </ClerkHostRouterContext.Provider>
  );
}
