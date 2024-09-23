import type { SignInStrategy as ClerkSignInStrategy } from '@clerk/types';
import { useSelector } from '@xstate/react';
import { useCallback, useEffect } from 'react';

import type { SignInStrategyName } from '~/internals/machines/shared';
import { SignInCurrentStrategy } from '~/internals/machines/sign-in/router.selectors';
import { matchStrategy } from '~/internals/machines/utils/strategies';
import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignInRouterCtx, SignInStrategyContext, StrategiesContext, useStrategy } from '~/react/sign-in/context';

export type SignInVerificationsProps = { preferred?: ClerkSignInStrategy } & FormProps;

function SignInStrategiesProvider({ children, preferred, ...props }: SignInVerificationsProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const current = useSelector(routerRef, SignInCurrentStrategy);
  const isChoosingAltStrategy = useActiveTags(routerRef, ['step:choose-strategy', 'step:forgot-password']);

  const isActive = useCallback((name: string) => (current ? matchStrategy(current, name) : false), [current]);

  return (
    <StrategiesContext.Provider value={{ current: current, preferred, isActive }}>
      {isChoosingAltStrategy.active ? null : (
        <Form
          flowActor={routerRef}
          {...props}
        >
          {children}
        </Form>
      )}
    </StrategiesContext.Provider>
  );
}

export type SignInStrategyProps = { name: SignInStrategyName; children: React.ReactNode };

/**
 * Generic component to handle both first and second factor verifications.
 *
 * @param {string} name - The name of the strategy for which its children will be rendered.
 *
 * @example
 * <SignIn.Step name="verifications">
 *   <SignIn.Strategy name="password">...</SignIn.Strategy>
 * </SignIn.Step>
 */
export function SignInStrategy({ children, name }: SignInStrategyProps) {
  const { active } = useStrategy(name);
  const routerRef = SignInRouterCtx.useActorRef();

  useEffect(() => {
    routerRef.send({ type: 'STRATEGY.REGISTER', factor: name });

    return () => {
      routerRef.send({ type: 'STRATEGY.UNREGISTER', factor: name });
    };
  }, [routerRef, name]);

  return active ? (
    <SignInStrategyContext.Provider value={{ strategy: name }}>{children}</SignInStrategyContext.Provider>
  ) : null;
}

/**
 * Generic component to handle both first and second factor verifications.
 *
 * @example
 * <Step name="verifications">...</Step>
 */
export function SignInVerifications(props: SignInVerificationsProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'step:verifications');

  return activeState ? <SignInStrategiesProvider {...props} /> : null;
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
  const activeState = useActiveTags(routerRef, 'step:first-factor');

  return activeState ? <SignInStrategiesProvider {...props} /> : null;
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
  const activeState = useActiveTags(routerRef, 'step:second-factor');

  return activeState ? <SignInStrategiesProvider {...props} /> : null;
}

export type SignInVerificationResendableRenderProps = {
  resendable: boolean;
  resendableAfter: number;
};

export type SignInVerificationResendableProps = {
  children: (props: SignInVerificationResendableRenderProps) => React.ReactNode;
};
