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
    } & Omit<SignUpNavigateProps, 'to'>)
  | ({ navigate?: never; resend?: never; submit: true } & FormSubmitProps)
  | { navigate?: never; resend: true; submit: never }
);

/**
 * Perform various actions during the sign-in process. This component is used to navigate between steps, submit the form, or resend a verification codes.
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
