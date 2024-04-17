import type { SignInFactor, SignInStrategy as ClerkSignInStrategy } from '@clerk/types';
import { useSelector } from '@xstate/react';
import { useCallback, useEffect } from 'react';
import type { ActorRefFrom, SnapshotFrom } from 'xstate';

import type { SignInStrategyName } from '~/internals/machines/shared';
import type { TSignInFirstFactorMachine, TSignInSecondFactorMachine } from '~/internals/machines/sign-in';
import { SignInFirstFactorMachine, SignInSecondFactorMachine } from '~/internals/machines/sign-in';
import { matchStrategy } from '~/internals/machines/utils/strategies';
import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignInRouterCtx, StrategiesContext, useSignInRouteRegistration, useStrategy } from '~/react/sign-in/context';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SignInVerificationsProps = { preferred?: ClerkSignInStrategy; children: React.ReactNode } & FormProps;

export const SignInFirstFactorCtx = createContextFromActorRef<TSignInFirstFactorMachine>('SignInFirstFactorCtx');
export const SignInSecondFactorCtx = createContextFromActorRef<TSignInSecondFactorMachine>('SignInSecondFactorCtx');

const strategiesSelector = (state: SnapshotFrom<TSignInFirstFactorMachine>) => state.context.currentFactor?.strategy;

function SignInStrategiesProvider({
  children,
  preferred,
  actorRef,
  ...props
}: SignInVerificationsProps & { actorRef: ActorRefFrom<TSignInFirstFactorMachine> }) {
  const routerRef = SignInRouterCtx.useActorRef();
  const current = useSelector(actorRef, strategiesSelector);
  const isChoosingAltStrategy = useActiveTags(routerRef, ['route:choose-strategy', 'route:forgot-password']);
  const isActive = useCallback((name: string) => (current ? matchStrategy(current, name) : false), [current]);

  return (
    <StrategiesContext.Provider value={{ current: current, preferred, isActive }}>
      {isChoosingAltStrategy.active ? null : (
        <Form
          flowActor={actorRef}
          {...props}
        >
          {children}
        </Form>
      )}
    </StrategiesContext.Provider>
  );
}

export type SignInStrategyProps = { name: SignInStrategyName; children: React.ReactNode };

function useFactorCtx() {
  const firstFactorRef = SignInFirstFactorCtx.useActorRef(true);
  const secondFactorRef = SignInSecondFactorCtx.useActorRef(true);

  return firstFactorRef || secondFactorRef;
}

/**
 * Generic component to handle both first and second factor verifications.
 *
 * @example
 * <Step name="verifications">
 *   <Strategy name="password">...<Strategy />
 * </Step>
 */
export function SignInStrategy({ children, name }: SignInStrategyProps) {
  const { active } = useStrategy(name);
  const factorCtx = useFactorCtx();

  useEffect(() => {
    if (factorCtx) {
      factorCtx.send({ type: 'STRATEGY.REGISTER', factor: name as unknown as SignInFactor });
    }

    return () => {
      if (factorCtx) {
        factorCtx.send({ type: 'STRATEGY.UNREGISTER', factor: name as unknown as SignInFactor });
      }
    };
  }, [factorCtx, name]);

  return active ? children : null;
}

/**
 * Generic component to handle both first and second factor verifications.
 *
 * @example
 * <Step name="verifications">...</Step>
 */
export function SignInVerifications(props: SignInVerificationsProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const { activeTags: activeRoutes } = useActiveTags(routerRef, ['route:first-factor', 'route:second-factor']);

  if (activeRoutes.has('route:first-factor')) {
    return <SignInFirstFactorInner {...props} />;
  }

  if (activeRoutes.has('route:second-factor')) {
    return <SignInSecondFactorInner {...props} />;
  }

  return null;
}

/**
 * Component to handle specifically first factor verifications.
 * Generally, you should use the <SignInVerifications> component instead via <Step name="verifications">.
 *
 * @example
 * <FirstFactor>...</FirstFactor>
 */
export function SignInFirstFactor(props: SignInVerificationsProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:first-factor');

  return activeState ? <SignInFirstFactorInner {...props} /> : null;
}

/**
 * Component to handle specifically second factor verifications.
 * Generally, you should use the <SignInVerifications> component instead via <Step name="verifications">.
 *
 * @example
 * <SecondFactor>...</SecondFactor>
 */
export function SignInSecondFactor(props: SignInVerificationsProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:second-factor');

  return activeState ? <SignInSecondFactorInner {...props} /> : null;
}

export function SignInFirstFactorInner(props: SignInVerificationsProps) {
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

export function SignInSecondFactorInner(props: SignInVerificationsProps) {
  const ref = useSignInRouteRegistration('secondFactor', SignInSecondFactorMachine);

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

export type SignInVerificationResendableRenderProps = {
  resendable: boolean;
  resendableAfter: number;
};

export type SignInVerificationResendableProps = {
  children: (props: SignInVerificationResendableRenderProps) => React.ReactNode;
};
