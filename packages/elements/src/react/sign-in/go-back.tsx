'use client';

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { SignInRouterCtx } from './context';

const GO_BACK_NAME = 'SignInGoBack';

export type SignInGoBackElement = React.ElementRef<'button'>;
export type SignInGoBackProps = WithChildrenProp<{
  asChild?: boolean;
}>;

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
