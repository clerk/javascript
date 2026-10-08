import type React from 'react';

import { useSignInFactorOnePasswordController } from './sign-in-factor-one-password.controller';
import { useSignInFactorOnePasswordModel } from './sign-in-factor-one-password.model';
import { SignInFactorOnePasswordView } from './sign-in-factor-one-password.view';

export type PasswordErrorCode = 'compromised' | 'pwned';

type SignInFactorOnePasswordProps = {
  onForgotPasswordMethodClick: React.MouseEventHandler | undefined;
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
  onPasswordError?: (errorCode: PasswordErrorCode) => void;
};

export const SignInFactorOnePasswordCard = (props: SignInFactorOnePasswordProps) => {
  const model = useSignInFactorOnePasswordModel();
  const controller = useSignInFactorOnePasswordController(model, props);

  return (
    <SignInFactorOnePasswordView
      {...controller}
      onShowAlternativeMethodsClick={props.onShowAlternativeMethodsClick}
    />
  );
};
