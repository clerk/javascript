import { Slot } from '@radix-ui/react-slot';
import { useSelector } from '@xstate/react';
import * as React from 'react';

import { SignInFirstFactorCtx, SignInSecondFactorCtx } from '../verifications';

export type SignInResendElement = React.ElementRef<'button'>;
export type SignInResendFallbackProps = {
  resendable: boolean;
  resendableAfter: number;
};
export type SignInResendProps = {
  asChild?: boolean;
  children: React.ReactNode;
  /**
   * A fallback component to render when the resend action is not available.
   * This can be a React element or a function that receives the `resendableAfter` prop.
   */
  fallback?: React.ReactNode | ((props: SignInResendFallbackProps) => React.ReactNode);
};

const SIGN_IN_RESEND_NAME = 'SignInResend';

/**
 * Resend verification codes during the sign-in process.
 * This component must be used within the <Step name="verifications">.
 *
 * @note This component is not intended to be used directly. Instead, use the <Action resend> component.
 *
 * @example
 * import { Action } from '@clerk/elements/sign-in';
 * <Action resend fallback={({ resendableAfter }) => <p>Resendable in: {resendableAfter}s</p>}>Resend</Action>;
 */
export const SignInResend = React.forwardRef<SignInResendElement, SignInResendProps>(
  ({ asChild, fallback, ...rest }, forwardedRef) => {
    const firstFactorRef = SignInFirstFactorCtx.useActorRef(true);
    const secondFactorRef = SignInSecondFactorCtx.useActorRef(true);
    const actorRef = firstFactorRef || secondFactorRef;

    if (!actorRef) {
      throw new Error('The resend action must be used within <SignIn.Step name="verifications">.');
    }

    const fallbackProps: SignInResendFallbackProps = useSelector(
      actorRef,
      state => ({
        resendable: state.context.resendable,
        resendableAfter: state.context.resendableAfter,
      }),
      (a, b) => a.resendableAfter === b.resendableAfter && a.resendable === b.resendable,
    );

    if (fallback && !fallbackProps.resendable) {
      return typeof fallback === 'function' ? fallback(fallbackProps) : fallback;
    }

    const Comp = asChild ? Slot : 'button';
    const defaultProps = asChild ? {} : { type: 'button' as const };

    return (
      <Comp
        {...defaultProps}
        {...rest}
        disabled={!fallbackProps.resendable}
        onClick={() => actorRef.send({ type: 'RETRY' })}
        ref={forwardedRef}
      />
    );
  },
);

SignInResend.displayName = SIGN_IN_RESEND_NAME;
