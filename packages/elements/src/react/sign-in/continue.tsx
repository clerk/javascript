'use client';

import { useClerk } from '@clerk/clerk-react';
import type { SignInStrategy as ClerkSignInStrategy } from '@clerk/types';
import { createActorContext } from '@xstate/react';
import { type PropsWithChildren, useCallback } from 'react';

import { useFormStore } from '~/internals/machines/form/form.context';
import { createFirstFactorMachine, createSecondFactorMachine } from '~/internals/machines/sign-in/continue/machine';
import { matchStrategy } from '~/internals/machines/utils/strategies';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { StrategiesContext } from '~/react/sign-in/contexts';

import { SignInRouterCtx } from './contexts/router.context';

export type SignInContinueProps = PropsWithChildren<{ preferred?: ClerkSignInStrategy }>;

export const SignInFirstFactorCtx = createActorContext(createFirstFactorMachine());
export const SignInSecondFactorCtx = createActorContext(createSecondFactorMachine());

const strategiesSelector = (state: any) => state.context.currentFactor?.strategy;

export function SignInContinue(props: SignInContinueProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, ['route:first-factor', 'route:second-factor']);

  return activeState ? (
    <>
      <SignInFirstFactor {...props} />
      <SignInSecondFactor {...props} />
    </>
  ) : null;
}

export function SignInFirstFactor(props: SignInContinueProps) {
  const clerk = useClerk();
  const form = useFormStore();
  const routerRef = SignInRouterCtx.useActorRef();

  const activeState = useActiveTags(routerRef, 'route:first-factor');

  return activeState ? (
    <SignInFirstFactorCtx.Provider
      options={{
        input: {
          clerk,
          form,
          router: routerRef,
        },
      }}
    >
      <SignInFirstFactorInner {...props} />
    </SignInFirstFactorCtx.Provider>
  ) : null;
}

function SignInFirstFactorInner({ children, preferred }: SignInContinueProps) {
  const routeRef = SignInFirstFactorCtx.useActorRef();
  const current = SignInFirstFactorCtx.useSelector(strategiesSelector);

  const isActive = useCallback((name: string) => (current ? matchStrategy(current, name) : false), [current]);

  return (
    <StrategiesContext.Provider value={{ current: current, preferred, isActive }}>
      <Form flowActor={routeRef}>{children}</Form>
    </StrategiesContext.Provider>
  );
}

export function SignInSecondFactor(props: SignInContinueProps) {
  const clerk = useClerk();
  const form = useFormStore();
  const routerRef = SignInRouterCtx.useActorRef();

  const activeState = useActiveTags(routerRef, 'route:second-factor');

  return activeState ? (
    <SignInSecondFactorCtx.Provider
      options={{
        input: {
          clerk,
          form,
          router: routerRef,
        },
      }}
    >
      <SignInSecondFactorInner {...props} />
    </SignInSecondFactorCtx.Provider>
  ) : null;
}

export function SignInSecondFactorInner({ children, preferred }: SignInContinueProps) {
  const routeRef = SignInSecondFactorCtx.useActorRef();
  const current = SignInFirstFactorCtx.useSelector(strategiesSelector);

  const isActive = useCallback((name: string) => (current ? matchStrategy(current, name) : false), [current]);

  return (
    <StrategiesContext.Provider value={{ current: current, preferred, isActive }}>
      <Form flowActor={routeRef}>{children}</Form>
    </StrategiesContext.Provider>
  );
}
