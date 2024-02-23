'use client';

import type { SignInFactor, SignInFirstFactor, SignInStrategy as TSignInStrategy } from '@clerk/types';
import { Slot } from '@radix-ui/react-slot';
import { useSelector } from '@xstate/react';
import * as React from 'react';
import type { ActorRefFrom } from 'xstate';

import type { TSignInFirstFactorMachine } from '~/internals/machines/sign-in/machines';
import { SignInRouterSystemId } from '~/internals/machines/sign-in/types';

import { useActiveTags } from '../hooks';
import { ActiveTagsMode } from '../hooks/use-active-tags.hook';
import { SignInRouterCtx } from './context';

// --------------------------------- HELPERS ---------------------------------

const localStrategies: Set<TSignInStrategy> = new Set(['email_code', 'password', 'phone_code', 'email_link']);
const resetPasswordStrategies: Set<TSignInStrategy> = new Set([
  'reset_password_phone_code',
  'reset_password_email_code',
]);

export function isResetPasswordStrategy(strategy: TSignInStrategy | null | undefined): boolean {
  return !!strategy && resetPasswordStrategies.has(strategy as TSignInStrategy);
}

export function factorHasLocalStrategy(factor: SignInFactor | undefined | null): boolean {
  if (!factor) return false;
  return localStrategies.has(factor.strategy);
}

// --------------------------------- COMPONENTS ---------------------------------

export type SignInVerificationsProps = WithChildrenProp<{ preferred?: TSignInStrategy }>;
export type SignInChooseStrategyProps = WithChildrenProp;

export function SignInChooseStrategy({ children }: SignInChooseStrategyProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, ['route:first-factor', 'route:choose-strategy'], ActiveTagsMode.all);

  return activeState ? children : null;
}

const AVAILABLE_STRATEGY_NAME = 'SignInAvailableStrategy';

export type SignInAvailableStrategyElement = React.ElementRef<'button'>;
export type SignInAvailableStrategyProps = WithChildrenProp<{ asChild?: boolean; name: SignInFirstFactor['strategy'] }>;

/**
 * Renders a button which will trigger a change in sign-in strategies. It must be used within the `choose-strategy` Step.
 *
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * <Step name='choose-strategy'>
 *   <AvailableStrategy name="pasword">
 *     Password
 *   </AvailableStrategy>
 * </Step
 */
export const SignInAvailableStrategy = React.forwardRef<SignInAvailableStrategyElement, SignInAvailableStrategyProps>(
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
    if (currentFirstFactor === name) return null;

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

SignInAvailableStrategy.displayName = AVAILABLE_STRATEGY_NAME;

// ----------------------------------------------------------------------------------------

const CHOOSE_ALTERNATE_STRATEGY_NAME = 'SignInChooseAlternateStrategy';

type ChooseAlternateStrategyElement = React.ElementRef<'button'>;
type ChooseAlternateStrategyProps = WithChildrenProp<{ asChild?: boolean }>;

/**
 * Renders a button which will trigger the choose strategy step. It must be used within the `verifications` Step.
 *
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * <Step name='verifications'>
 *   <ChooseAlternateStrategy name="pasword">
 *     Password
 *   </ChooseAlternateStrategy>
 * </Step>
 */

export const SignInChooseAlternateStrategy = React.forwardRef<
  ChooseAlternateStrategyElement,
  ChooseAlternateStrategyProps
>(({ asChild, ...rest }, forwardedRef) => {
  const ref = SignInRouterCtx.useActorRef();
  const canChooseStrategy = useSelector(ref, state => state.can({ type: 'STRATEGY.SELECT' }));

  if (!canChooseStrategy) return null;

  const Comp = asChild ? Slot : 'button';
  const defaultProps = asChild ? {} : { type: 'button' as const };

  const sendChooseStrategyEvent = () => ref.send({ type: 'STRATEGY.SELECT' });

  return (
    <Comp
      {...defaultProps}
      {...rest}
      ref={forwardedRef}
      onClick={sendChooseStrategyEvent}
    />
  );
});

SignInChooseAlternateStrategy.displayName = CHOOSE_ALTERNATE_STRATEGY_NAME;
