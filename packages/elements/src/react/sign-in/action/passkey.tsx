import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { SignInRouterCtx } from '~/react/sign-in/context';

export type SignInPasskeyElement = React.ElementRef<'button'>;

export type SignInPasskeyProps = {
  asChild?: boolean;
  children: React.ReactNode;
};

const SIGN_IN_PASSKEY_NAME = 'SignInPasskey';

/**
 * Resend verification codes during the sign-in process.
 * This component must be used within the <Step name="start">.
 *
 * @note This component is not intended to be used directly. Instead, use the <Action resend> component.
 *
 * @example
 * import { Action } from '@clerk/elements/sign-in';
 * <Action passkey>Use passkey instead</Action>;
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
