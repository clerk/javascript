import * as React from 'react';

import type { FormSubmitProps } from '~/react/common';
import { Submit } from '~/react/common';

import type { SignInNavigateElementKey, SignInNavigateProps } from './navigate';
import { SignInNavigate } from './navigate';
import type { SignInResendProps } from './resend';
import { SignInResend } from './resend';

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

const SIGN_IN_ACTION_NAME = 'SignInAction';

/**
 * Perform various actions during the sign-in process. This component is used to navigate between steps, submit the form, or resend a verification codes.
 *
 * @param {boolean} [submit] - If `true`, the action will submit the form.
 * @param {string} [navigate] - The name of the step to navigate to.
 * @param {boolean} [resend] - If `true`, the action will resend the verification code for the currently active strategy, if applicable.
 * @param {Function} [fallback] - Only used when `resend` is `true`. If provided, the fallback markup will be rendered before the resend delay has expired.
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
