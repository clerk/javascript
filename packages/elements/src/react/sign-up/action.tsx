import * as React from 'react';

import type { FormSubmitProps } from '~/react/common';
import { Submit } from '~/react/common';
import type { SignUpNavigateProps } from '~/react/sign-up/navigation';
import { SignUpNavigate } from '~/react/sign-up/navigation';

export type SignUpActionProps = { asChild?: boolean } & (
  | ({
      navigate: SignUpNavigateProps['to'];
      resend?: never;
      submit?: never;
      className?: string;
    } & Omit<SignUpNavigateProps, 'to'>)
  | ({ navigate?: never; resend?: never; submit: true } & FormSubmitProps)
  | { navigate?: never; resend: true; submit: never; className?: string }
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
 * import { Action } from '@clerk/elements/sign-up';
 * <Action navigate="start">Go Back</Action>
 *
 * @example
 * import { Action } from '@clerk/elements/sign-up';
 * <Action submit>Sign Up</Action>
 *
 * @example
 * import { Action } from '@clerk/elements/sign-up';
 * <Action resend>Resend</Action>
 */

export const SignUpAction = React.forwardRef<React.ElementRef<'button'>, SignUpActionProps>((props, forwardedRef) => {
  if (props.submit) {
    const { submit, ...rest } = props;
    return (
      <Submit
        {...rest}
        ref={forwardedRef}
      />
    );
  }

  if (props.navigate) {
    const { navigate, ...rest } = props;
    return (
      <SignUpNavigate
        {...rest}
        to={navigate}
        ref={forwardedRef}
      />
    );
  }

  return null;
});

SignUpAction.displayName = 'SignUpAction';
