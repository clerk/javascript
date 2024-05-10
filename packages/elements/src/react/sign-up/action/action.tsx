import * as React from 'react';

import type { FormSubmitProps } from '~/react/common';
import { Submit } from '~/react/common';

import type { SignUpNavigateProps } from './navigate';
import { SignUpNavigate } from './navigate';
import type { SignUpResendProps } from './resend';
import { SignUpResend } from './resend';

export type SignUpActionProps = { asChild?: boolean } & FormSubmitProps &
  (
    | ({
        navigate: SignUpNavigateProps['to'];
        resend?: never;
        submit?: never;
      } & Omit<SignUpNavigateProps, 'to'>)
    | { navigate?: never; resend?: never; submit: true }
    | ({ navigate?: never; resend: true; submit?: never } & SignUpResendProps)
  );

/**
 * Perform various actions during the sign-in process. This component is used to navigate between steps, submit the form, or resend a verification codes.
 *
 * @param {boolean} [submit] - If `true`, the action will submit the form.
 * @param {string} [navigate] - The name of the step to navigate to.
 * @param {boolean} [resend] - If `true`, the action will resend the verification code for the currently active strategy, if applicable.
 * @param {Function} [fallback] - Only used when `resend` is `true`. If provided, the fallback markup will be rendered before the resend delay has expired.
 *
 * @example
 * <SignUp.Action navigate="start">Go Back</SignUp.Action>
 *
 * @example
 * <SignUp.Action submit>Sign Up</SignUp.Action>
 *
 * @example
 * <SignUp.Action resend>Resend</SignUp.Action>
 */

export const SignUpAction = React.forwardRef<React.ElementRef<'button'>, SignUpActionProps>((props, forwardedRef) => {
  const { submit, navigate, resend, ...rest } = props;
  let Comp: React.ForwardRefExoticComponent<any> | undefined;

  if (submit) {
    Comp = Submit;
  } else if (navigate) {
    Comp = SignUpNavigate;
  } else if (resend) {
    Comp = SignUpResend;
  }

  return Comp ? (
    <Comp
      to={navigate}
      {...rest}
      ref={forwardedRef}
    />
  ) : null;
});

SignUpAction.displayName = 'SignUpAction';
