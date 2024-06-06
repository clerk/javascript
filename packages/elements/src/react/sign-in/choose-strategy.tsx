import type { SignInFactor, SignInFirstFactor, SignInStrategy as TSignInStrategy } from '@clerk/types';
import { Slot } from '@radix-ui/react-slot';
import { useSelector } from '@xstate/react';
import * as React from 'react';
import type { ActorRefFrom } from 'xstate';

import type { TSignInFirstFactorMachine } from '~/internals/machines/sign-in';
import { SignInRouterSystemId } from '~/internals/machines/sign-in';

import { useActiveTags } from '../hooks';
import { ActiveTagsMode } from '../hooks/use-active-tags.hook';
import { createContextForDomValidation } from '../utils/create-context-for-dom-validation';
import { SignInRouterCtx } from './context';

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
  return resetPasswordStrategies.has(strategy as TSignInStrategy);
}

export function factorHasLocalStrategy(factor: SignInFactor | undefined | null): boolean {
  if (!factor) {
    return false;
  }
  return localStrategies.has(factor.strategy);
}

// --------------------------------- COMPONENTS ---------------------------------

export type SignInChooseStrategyProps = React.HTMLAttributes<HTMLDivElement>;
export type SignInForgotPasswordProps = React.HTMLAttributes<HTMLDivElement>;

export const SignInChooseStrategyCtx = createContextForDomValidation('SignInChooseStrategyCtx');

export function SignInChooseStrategy({ children, ...props }: SignInChooseStrategyProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, ['route:first-factor', 'route:choose-strategy'], ActiveTagsMode.all);

  return activeState ? (
    <SignInChooseStrategyCtx.Provider>
      <div {...props}>{children}</div>
    </SignInChooseStrategyCtx.Provider>
  ) : null;
}

export function SignInForgotPassword({ children, ...props }: SignInForgotPasswordProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, ['route:first-factor', 'route:forgot-password'], ActiveTagsMode.all);

  return activeState ? (
    <SignInChooseStrategyCtx.Provider>
      <div {...props}>{children}</div>
    </SignInChooseStrategyCtx.Provider>
  ) : null;
}

const SUPPORTED_STRATEGY_NAME = 'SignInSupportedStrategy';

export type SignInSupportedStrategyElement = React.ElementRef<'button'>;
export type SignInSupportedStrategyProps = {
  asChild?: boolean;
  name: Exclude<SignInFirstFactor['strategy'], `oauth_${string}` | 'saml'>;
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

    const supportedFirstFactors = snapshot.context.clerk.client.signIn.supportedFirstFactors;
    const factor = supportedFirstFactors.find(factor => name === factor.strategy);

    const currentFirstFactor = useSelector(
      snapshot.children[SignInRouterSystemId.firstFactor] as unknown as ActorRefFrom<TSignInFirstFactorMachine>,
      state => state?.context.currentFactor?.strategy,
    );

    const sendUpdateStrategyEvent = React.useCallback(
      () => routerRef.send({ type: 'STRATEGY.UPDATE', factor }),
      [routerRef, factor],
    );

    // Don't render if the current factor is the same as the one we're trying to render
    if (currentFirstFactor === name) {
      return null;
    }

    const Comp = asChild ? Slot : 'button';
    const defaultProps = asChild ? {} : { type: 'button' as const };

    return factor ? (
      <Comp
        {...defaultProps}
        {...rest}
        ref={forwardedRef}
        onClick={sendUpdateStrategyEvent}
      >
        {children || factor.strategy}
      </Comp>
    ) : null;
  },
);

SignInSupportedStrategy.displayName = SUPPORTED_STRATEGY_NAME;
