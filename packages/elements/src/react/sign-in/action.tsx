import { Slot } from '@radix-ui/react-slot';
import { useSelector } from '@xstate/react';
import * as React from 'react';

import type { FormSubmitProps } from '~/react/common';
import { Submit } from '~/react/common';
import type { SignInNavigateElementKey, SignInNavigateProps } from '~/react/sign-in/navigation';
import { SignInNavigate } from '~/react/sign-in/navigation';

import { SignInFirstFactorCtx, SignInSecondFactorCtx } from './verifications';

export type SignInActionProps = { asChild?: boolean } & FormSubmitProps &
  (
    | ({
        navigate: SignInNavigateProps['to'];
        resend?: never;
        submit?: never;
      } & Omit<SignInNavigateProps, 'to'>)
    | { navigate?: never; resend?: never; submit: true }
    | ({ navigate?: never; resend: true; submit?: never } & SignInResendProps)
  );

export type SignInActionCompProps = React.ForwardRefExoticComponent<
  Exclude<SignInActionProps, 'navigate'> & {
    to: SignInNavigateElementKey;
  } & React.RefAttributes<HTMLButtonElement>
>;

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
      throw new Error('The resend action must be used within <Step name="verifications">.');
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

const SIGN_IN_ACTION_NAME = 'SignInAction';

/**
 * Perform various actions during the sign-in process. This component is used to navigate between steps, submit the form, or resend a verification codes.
 *
 * @example
 * import { Action } from '@clerk/elements/sign-in';
 * <Action navigate="start">Go Back</Action>
 *
 * @example
 * import { Action } from '@clerk/elements/sign-in';
 * <Action submit>Sign In</Action>
 *
 * @example
 * import { Action } from '@clerk/elements/sign-in';
 * <Action resend>Resend</Action>
 */
export const SignInAction = React.forwardRef<React.ElementRef<'button'>, SignInActionProps>((props, forwardedRef) => {
  const { submit, navigate, resend, ...rest } = props;
  let Comp: React.ForwardRefExoticComponent<any> | undefined;

  if (submit) {
    Comp = Submit;
  } else if (navigate) {
    Comp = SignInNavigate;
  } else if (resend) {
    Comp = SignInResend;
  }

  return Comp ? (
    <Comp
      to={navigate}
      {...rest}
      ref={forwardedRef}
    />
  ) : null;
});

SignInAction.displayName = SIGN_IN_ACTION_NAME;
