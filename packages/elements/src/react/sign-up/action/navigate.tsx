import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { SignUpRouterCtx } from '~/react/sign-up/context';

const SIGN_UP_NAVIGATE_NAME = 'SignInNavigate';
const SignUpNavigationEventMap = {
  start: `NAVIGATE.START`,
  previous: `NAVIGATE.PREVIOUS`,
} as const;

export type SignUpNavigateElementKey = keyof typeof SignUpNavigationEventMap;

export type SignUpNavigateElement = React.ElementRef<'button'>;
export type SignUpNavigateProps = {
  asChild?: boolean;
  to: SignUpNavigateElementKey;
  children: React.ReactNode;
};

/**
 * Renders a button which will navigate to a different step in the sign-up flow.
 *
 * @param {SignUpNavigateElementKey} to - The step to navigate to.
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * <Navigate to="start">
 *    Start over...
 * </Navigate>
 */
export const SignUpNavigate = React.forwardRef<SignUpNavigateElement, SignUpNavigateProps>(
  ({ asChild, to, ...rest }, forwardedRef) => {
    const actorRef = SignUpRouterCtx.useActorRef();

    const Comp = asChild ? Slot : 'button';
    const defaultProps = asChild ? {} : { type: 'button' as const };

    const sendEvent = React.useCallback(() => {
      const type = SignUpNavigationEventMap[to];

      if (actorRef.getSnapshot().can({ type })) {
        actorRef.send({ type });
      } else {
        console.warn(
          `Clerk: <SignUp.Action navigate="${to}"> is an invalid navigation event. You can only navigate to: ${Object.keys(SignUpNavigationEventMap).join(', ')}.`,
        );
      }
    }, [actorRef, to]);

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

SignUpNavigate.displayName = SIGN_UP_NAVIGATE_NAME;
