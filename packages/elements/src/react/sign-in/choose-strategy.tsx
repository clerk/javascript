import type { SignInFactor, SignInStrategy as TSignInStrategy } from '@clerk/shared/types';
import { Slot } from '@radix-ui/react-slot';
import { useSelector } from '@xstate/react';
import * as React from 'react';
import type { ActorRefFrom } from 'xstate';

import type { TSignInFirstFactorMachine, TSignInSecondFactorMachine } from '~/internals/machines/sign-in';
import { SignInRouterSystemId } from '~/internals/machines/sign-in';

import { useActiveTags } from '../hooks';
import { ActiveTagsMode } from '../hooks/use-active-tags.hook';
import { createContextForDomValidation } from '../utils/create-context-for-dom-validation';
import { SignInRouterCtx, SignInStrategyContext } from './context';

// --------------------------------- HELPERS ---------------------------------

const localStrategies: Set<TSignInStrategy> = new Set(['email_code', 'password', 'phone_code', 'email_link']);
const resetPasswordStrategies: Set<TSignInStrategy> = new Set([
  'reset_password_phone_code',
  'reset_password_email_code',
]);

export function isResetPasswordStrategy(strategy: TSignInStrategy | null | undefined): boolean {
  if (!strategy) {
    return false;
  }
  return resetPasswordStrategies.has(strategy);
}

export function factorHasLocalStrategy(factor: SignInFactor | undefined | null): boolean {
  if (!factor) {
    return false;
  }
  return localStrategies.has(factor.strategy);
}

// --------------------------------- COMPONENTS ---------------------------------

export type SignInChooseStrategyProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};
export type SignInForgotPasswordProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

export const SignInChooseStrategyCtx = createContextForDomValidation('SignInChooseStrategyCtx');

export function SignInChooseStrategy({ asChild, children, ...props }: SignInChooseStrategyProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeStateFirstFactor = useActiveTags(
    routerRef,
    ['step:verifications', 'step:first-factor', 'step:choose-strategy'],
    ActiveTagsMode.all,
  );

  const activeStateSecondFactor = useActiveTags(
    routerRef,
    ['step:verifications', 'step:second-factor', 'step:choose-strategy'],
    ActiveTagsMode.all,
  );

  const activeState = activeStateFirstFactor || activeStateSecondFactor;
  const Comp = asChild ? Slot : 'div';

  return activeState ? (
    <SignInChooseStrategyCtx.Provider>
      <Comp {...props}>{children}</Comp>
    </SignInChooseStrategyCtx.Provider>
  ) : null;
}

export function SignInForgotPassword({ asChild, children, ...props }: SignInForgotPasswordProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(
    routerRef,
    ['step:verifications', 'step:first-factor', 'step:forgot-password'],
    ActiveTagsMode.all,
  );
  const Comp = asChild ? Slot : 'div';

  return activeState ? (
    <SignInChooseStrategyCtx.Provider>
      <Comp {...props}>{children}</Comp>
    </SignInChooseStrategyCtx.Provider>
  ) : null;
}

const SUPPORTED_STRATEGY_NAME = 'SignInSupportedStrategy';

export type SignInSupportedStrategyElement = React.ElementRef<'button'>;
export type SignInSupportedStrategyProps = {
  asChild?: boolean;
  name: Exclude<SignInFactor['strategy'], `oauth_${string}` | 'saml'>;
  children: React.ReactNode;
};

/**
 * By default, renders a button which will trigger a change in the chosen sign-in strategy. It **must** be used within a `<Step name='choose-strategy'>` component.
 *
 * @description This component will only render its contents if the chosen strategy is enabled (in the Clerk dashboard) and if it's not the current strategy.
 *
 * @param name - Define a strategy to be used.
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * <SignIn.Step name='choose-strategy'>
 *   <SignIn.SupportedStrategy name='password'>
 *     Sign in with password
 *   </SignIn.SupportedStrategy>
 * </SignIn.Step>
 */
export const SignInSupportedStrategy = React.forwardRef<SignInSupportedStrategyElement, SignInSupportedStrategyProps>(
  ({ asChild, children, name, ...rest }, forwardedRef) => {
    const routerRef = SignInRouterCtx.useActorRef();
    const snapshot = routerRef.getSnapshot();

    const status = snapshot.context.clerk.client.signIn.status;
    const supportedFirstFactors =
      status === 'needs_first_factor' ? snapshot.context.clerk.client.signIn.supportedFirstFactors || [] : [];
    const supportedSecondFactors =
      status === 'needs_second_factor' ? snapshot.context.clerk.client.signIn.supportedSecondFactors || [] : [];
    const factor = [...supportedFirstFactors, ...supportedSecondFactors].find(factor => name === factor.strategy);

    const currentFactor = useSelector(
      (snapshot.children[SignInRouterSystemId.firstFactor] ||
        snapshot.children[SignInRouterSystemId.secondFactor]) as unknown as ActorRefFrom<
        TSignInFirstFactorMachine | TSignInSecondFactorMachine
      >,
      state => state?.context.currentFactor?.strategy,
    );

    const sendUpdateStrategyEvent = React.useCallback(
      () => routerRef.send({ type: 'STRATEGY.UPDATE', factor }),
      [routerRef, factor],
    );

    // Don't render if the current factor is the same as the one we're trying to render
    if (currentFactor === name) {
      return null;
    }

    const Comp = asChild ? Slot : 'button';
    const defaultProps = asChild ? {} : { type: 'button' as const };

    return factor ? (
      <SignInStrategyContext.Provider value={{ strategy: name }}>
        <Comp
          {...defaultProps}
          {...rest}
          ref={forwardedRef}
          onClick={sendUpdateStrategyEvent}
        >
          {children || factor.strategy}
        </Comp>
      </SignInStrategyContext.Provider>
    ) : null;
  },
);

SignInSupportedStrategy.displayName = SUPPORTED_STRATEGY_NAME;
