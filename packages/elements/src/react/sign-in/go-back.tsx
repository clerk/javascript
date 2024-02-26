'use client';

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { SignInRouterCtx } from './context';

const GO_BACK_NAME = 'SignInGoBack';

export type SignInGoBackElement = React.ElementRef<'button'>;
export type SignInGoBackProps = WithChildrenProp<{
  asChild?: boolean;
}>;

/**
 * By default, renders a button which will try to navigate to the previous step of the current sign-in flow (if possible). One use case is inside the `<Step name='choose-strategy'>` component to allow getting back to the previous input (e.g. reverting the "Use another method" action).
 *
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * <Step name='choose-strategy'>
 *  <AvailableStrategy name='password'>
 *    Sign in with password
 *  </AvailableStrategy>
 *  <GoBack>Go back</GoBack>
 * </Step>
 */
export const SignInGoBack = React.forwardRef<SignInGoBackElement, SignInGoBackProps>(
  ({ asChild, ...rest }, forwardedRef) => {
    const actorRef = SignInRouterCtx.useActorRef();

    const Comp = asChild ? Slot : 'button';
    const defaultProps = asChild ? {} : { type: 'button' as const };

    const sendEvent = () => {
      if (actorRef.getSnapshot().can({ type: 'PREV' })) {
        actorRef.send({ type: 'PREV' });
      }
    };

    return (
      <Comp
        {...defaultProps}
        {...rest}
        onClick={sendEvent}
        ref={forwardedRef}
      />
    );
  },
);

SignInGoBack.displayName = GO_BACK_NAME;
