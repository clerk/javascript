'use client';

import type { SignInStrategy as ClerkSignInStrategy } from '@clerk/types';
import { useSelector } from '@xstate/react';
import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';
import type { ActorRefFrom, SnapshotFrom } from 'xstate';

import { SignInFirstFactorMachine, type TSignInFirstFactorMachine } from '~/internals/machines/sign-in/machines';
import type { SignInStrategyName } from '~/internals/machines/sign-in/types';
import { matchStrategy } from '~/internals/machines/utils/strategies';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignInRouterCtx, StrategiesContext, useSignInRouteRegistration, useStrategy } from '~/react/sign-in/context';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SignInVerifyProps = Required<PropsWithChildren> & { preferred?: ClerkSignInStrategy };

export const SignInFirstFactorCtx = createContextFromActorRef<TSignInFirstFactorMachine>('SignInFirstFactorCtx');
export const SignInSecondFactorCtx = createContextFromActorRef<TSignInFirstFactorMachine>('SignInSecondFactorCtx');

const strategiesSelector = (state: SnapshotFrom<TSignInFirstFactorMachine>) => state.context.currentFactor?.strategy;

function SignInStrategiesProvider({
  children,
  preferred,
  actorRef,
}: SignInVerifyProps & { actorRef: ActorRefFrom<TSignInFirstFactorMachine> }) {
  const current = useSelector(actorRef, strategiesSelector);
  const isActive = useCallback((name: string) => (current ? matchStrategy(current, name) : false), [current]);

  return (
    <StrategiesContext.Provider value={{ current: current, preferred, isActive }}>
      <Form flowActor={actorRef}>{children}</Form>
    </StrategiesContext.Provider>
  );
}

export type SignInVerificationProps = React.PropsWithChildren<{ name: SignInStrategyName }>;

export function SignInVerification({ children, name }: SignInVerificationProps) {
  const { active } = useStrategy(name);
  console.log('SignInVerification', name, active);
  return active ? children : null;
}

export function SignInVerify(props: SignInVerifyProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, ['route:first-factor', 'route:second-factor']);

  return activeState ? (
    <>
      <SignInFirstFactor {...props} />
      <SignInSecondFactor {...props} />
    </>
  ) : null;
}

export function SignInFirstFactor(props: SignInVerifyProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:first-factor');

  return activeState ? <SignInFirstFactorInner {...props} /> : null;
}

export function SignInSecondFactor(props: SignInVerifyProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:second-factor');

  return activeState ? <SignInSecondFactorInner {...props} /> : null;
}

export function SignInFirstFactorInner(props: SignInVerifyProps) {
  const ref = useSignInRouteRegistration('firstFactor', SignInFirstFactorMachine);

  if (!ref) {
    return null;
  }

  return ref ? (
    <SignInFirstFactorCtx.Provider actorRef={ref}>
      <SignInStrategiesProvider
        actorRef={ref}
        {...props}
      />
    </SignInFirstFactorCtx.Provider>
  ) : null;
}

export function SignInSecondFactorInner(props: SignInVerifyProps) {
  const ref = useSignInRouteRegistration('secondFactor', SignInFirstFactorMachine);

  if (!ref) {
    return null;
  }

  return ref ? (
    <SignInSecondFactorCtx.Provider actorRef={ref}>
      <SignInStrategiesProvider
        actorRef={ref}
        {...props}
      />
    </SignInSecondFactorCtx.Provider>
  ) : null;
}
