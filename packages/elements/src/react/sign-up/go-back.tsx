'use client';

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import type { ActorRefFrom } from 'xstate';

import type { TSignUpRouterMachine } from '~/internals/machines/sign-up/machines';

import { SignUpRouterCtx } from './context';

const GO_BACK_NAME = 'SignInGoBack';

export type SignUpGoBackElement = React.ElementRef<'button'>;
export type SignUpGoBackProps = WithChildrenProp<{
  actorRef: ActorRefFrom<TSignUpRouterMachine>;
  asChild?: boolean;
}>;

export const SignUpGoBack = React.forwardRef<SignUpGoBackElement, SignUpGoBackProps>(
  ({ asChild, ...rest }, forwardedRef) => {
    const actorRef = SignUpRouterCtx.useActorRef();

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

SignUpGoBack.displayName = GO_BACK_NAME;
