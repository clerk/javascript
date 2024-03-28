import * as React from 'react';

import type { FormSubmitProps } from '~/react/common';
import { Submit } from '~/react/common';
import type { SignInNavigateProps } from '~/react/sign-in/navigation';
import { SignInNavigate } from '~/react/sign-in/navigation';

export type SignInActionProps = { asChild?: boolean } & (
  | ({
      navigate: SignInNavigateProps['to'];
      resend?: never;
      submit?: never;
      className?: string;
    } & Omit<SignInNavigateProps, 'to'>)
  | ({ navigate?: never; resend?: never; submit: true } & FormSubmitProps)
  | { navigate?: never; resend: true; submit: never; className?: string }
);

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
      <SignInNavigate
        {...rest}
        to={navigate}
        ref={forwardedRef}
      />
    );
  }

  return null;
});

SignInAction.displayName = 'SignInAction';
