import * as React from 'react';

import type { FormSubmitProps } from '~/react/common';
import { Submit } from '~/react/common';

import type { SignInNavigateProps } from './navigate';
import { SignInNavigate } from './navigate';
import type { SignInResendProps } from './resend';
import { SignInResend } from './resend';
import { SignInSetActiveSession } from './set-active-session';

export type SignInActionProps = { asChild?: boolean } & FormSubmitProps &
  (
    | ({
        navigate: SignInNavigateProps['to'];
        resend?: never;
        setActiveSession?: never;
        submit?: never;
      } & Omit<SignInNavigateProps, 'to'>)
    | { navigate?: never; resend?: never; setActiveSession?: never; submit: true }
    | { navigate?: never; resend?: never; setActiveSession: true; submit?: never }
    | ({ navigate?: never; resend: true; setActiveSession?: never; submit?: never } & SignInResendProps)
  );

const DISPLAY_NAME = 'SignInAction';

/**
 * Perform various actions during the sign-in process. This component is used to navigate between steps, submit the form, or resend a verification codes.
 *
 * @param {boolean} [submit] - If `true`, the action will submit the form.
 * @param {string} [navigate] - The name of the step to navigate to.
 * @param {boolean} [resend] - If `true`, the action will resend the verification code for the currently active strategy, if applicable.
 * @param {Function} [fallback] - Only used when `resend` is `true`. If provided, the fallback markup will be rendered before the resend delay has expired.
 *
 * @example
 * <SignIn.Action navigate="start">Go Back</SignIn.Action>
 *
 * @example
 * <SignIn.Action submit>Sign In</SignIn.Action>
 *
 * @example
 * <SignIn.Action resend>Resend</SignIn.Action>
 */
export const SignInAction = React.forwardRef<React.ElementRef<'button'>, SignInActionProps>((props, forwardedRef) => {
  const { submit, navigate, resend, setActiveSession, ...rest } = props;
  let Comp: React.ForwardRefExoticComponent<any> | undefined;

  if (submit) {
    Comp = Submit;
  } else if (navigate) {
    Comp = SignInNavigate;
  } else if (resend) {
    Comp = SignInResend;
  } else if (setActiveSession) {
    Comp = SignInSetActiveSession;
  }

  return Comp ? (
    <Comp
      to={navigate}
      {...rest}
      ref={forwardedRef}
    />
  ) : null;
});

SignInAction.displayName = DISPLAY_NAME;
