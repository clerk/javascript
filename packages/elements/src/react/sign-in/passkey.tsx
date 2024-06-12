import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { SignInRouterCtx } from '~/react/sign-in/context';

export type SignInPasskeyElement = React.ElementRef<'button'>;

export type SignInPasskeyProps = {
  asChild?: boolean;
  children: React.ReactNode;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const SIGN_IN_PASSKEY_NAME = 'SignInPasskey';

/**
 * Prompt users to select a passkey from their device in order to sign in.
 * This component must be used within the <Step name="start">.
 *
 * @example
 * <SignIn.Action passkey>Use Passkey instead</SignIn.Action>
 */
export const SignInPasskey = React.forwardRef<SignInPasskeyElement, SignInPasskeyProps>(
  ({ asChild, ...rest }, forwardedRef) => {
    const actorRef = SignInRouterCtx.useActorRef(true);

    const Comp = asChild ? Slot : 'button';
    const defaultProps = asChild ? {} : { type: 'button' as const };

    const sendEvent = React.useCallback(() => {
      actorRef?.send({ type: 'AUTHENTICATE.PASSKEY' });
    }, [actorRef]);

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

SignInPasskey.displayName = SIGN_IN_PASSKEY_NAME;
