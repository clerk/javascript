import { Slot } from '@radix-ui/react-slot';
import { useSelector } from '@xstate/react';
import * as React from 'react';

import { SignUpVerificationCtx } from '../verifications';

export type SignUpResendElement = React.ElementRef<'button'>;
export type SignUpResendFallbackProps = {
  resendable: boolean;
  resendableAfter: number;
};
export type SignUpResendProps = {
  asChild?: boolean;
  children: React.ReactNode;
  /**
   * A fallback component to render when the resend action is not available.
   * This can be a React element or a function that receives the `resendableAfter` prop.
   */
  fallback?: React.ReactNode | ((props: SignUpResendFallbackProps) => React.ReactNode);
};

const SIGN_UP_RESEND_NAME = 'SignUpResend';

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
export const SignUpResend = React.forwardRef<SignUpResendElement, SignUpResendProps>(
  ({ asChild, fallback, ...rest }, forwardedRef) => {
    const ref = SignUpVerificationCtx.useActorRef(true);

    if (!ref) {
      throw new Error('The resend action must be used within <SignUp.Step name="verifications">.');
    }

    const fallbackProps: SignUpResendFallbackProps = useSelector(
      ref,
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
        onClick={() => ref.send({ type: 'RETRY' })}
        ref={forwardedRef}
      />
    );
  },
);

SignUpResend.displayName = SIGN_UP_RESEND_NAME;
