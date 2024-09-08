import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import type { SignInRouterSessionSetActiveEvent } from '~/internals/machines/sign-in';
import { SignInRouterCtx } from '~/react/sign-in/context';

import { useSignInActiveSessionContext } from '../choose-session/choose-session.hooks';

const DISPLAY_NAME = 'SignInSetActiveSession';

export type SignInSetActiveSessionElement = React.ElementRef<'button'>;
export type SignInSetActiveSessionProps = {
  asChild?: boolean;
  children: React.ReactNode;
};

/**
 * Sets the active session to the session with the provided ID.
 *
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * <SignInSetActiveSession setActiveSession>
 *    t*****m@clerk.dev
 * </SignInSetActiveSession>
 */
export const SignInSetActiveSession = React.forwardRef<SignInSetActiveSessionElement, SignInSetActiveSessionProps>(
  ({ asChild, ...rest }, forwardedRef) => {
    const actorRef = SignInRouterCtx.useActorRef();
    const session = useSignInActiveSessionContext();

    const Comp = asChild ? Slot : 'button';
    const defaultProps = asChild ? {} : { type: 'button' as const };

    const sendEvent = React.useCallback(() => {
      const event: SignInRouterSessionSetActiveEvent = { type: 'SESSION.SET_ACTIVE', id: session.id };

      if (actorRef.getSnapshot().can(event)) {
        actorRef.send(event);
      } else {
        console.warn(
          `Clerk: <SignIn.Action setActiveSession> is an invalid event. You can only choose an active session from <SignIn.Step name="choose-session">.`,
        );
      }
    }, [actorRef, session.id]);

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

SignInSetActiveSession.displayName = DISPLAY_NAME;
