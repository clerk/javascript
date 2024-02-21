'use client';

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import type { ActorRefFrom } from 'xstate';

import type { TSignInRouterMachine } from '~/internals/machines/sign-in/machines';

import { SignInRouterCtx } from './context';

const GO_BACK_NAME = 'SignInGoBack';

export type SignInGoBackElement = React.ElementRef<'button'>;
export type SignInGoBackProps = WithChildrenProp<{
  actorRef: ActorRefFrom<TSignInRouterMachine>;
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
