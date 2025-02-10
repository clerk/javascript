import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { SignInRouterCtx } from '~/react/sign-in/context';

const SIGN_IN_NAVIGATE_NAME = 'SignInNavigate';
const SignInNavigationEventMap = {
  start: 'NAVIGATE.START',
  previous: 'NAVIGATE.PREVIOUS',
  'choose-strategy': 'NAVIGATE.CHOOSE_STRATEGY',
  'forgot-password': 'NAVIGATE.FORGOT_PASSWORD',
} as const;

export type SignInNavigateElementKey = keyof typeof SignInNavigationEventMap;

export type SignInNavigateElement = React.ElementRef<'button'>;
export type SignInNavigateProps = {
  asChild?: boolean;
  to: SignInNavigateElementKey;
  children: React.ReactNode;
};

/**
 * Renders a button which will navigate to a different step in the sign-in flow.
 *
 * @param {SignInNavigateElementKey} to - The step to navigate to.
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * <Navigate to="choose-strategy">
 *    Choose a different sign-in method...
 * </Navigate>
 */
export const SignInNavigate = React.forwardRef<SignInNavigateElement, SignInNavigateProps>(
  ({ asChild, to, ...rest }, forwardedRef) => {
    const actorRef = SignInRouterCtx.useActorRef();

    const Comp = asChild ? Slot : 'button';
    const defaultProps = asChild ? {} : { type: 'button' as const };

    const sendEvent = React.useCallback(() => {
      const type = SignInNavigationEventMap[to];

      if (actorRef.getSnapshot().can({ type })) {
        actorRef.send({ type });
      } else {
        console.warn(
          `Clerk: <SignIn.Action navigate="${to}"> is an invalid navigation event. You can only navigate to: ${Object.keys(SignInNavigationEventMap).join(', ')}.`,
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

SignInNavigate.displayName = SIGN_IN_NAVIGATE_NAME;
