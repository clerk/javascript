import type { ResetPasswordCodeFactor } from '@clerk/shared/types';
import type React from 'react';

import { useSignInFactorOnePasskeyController } from './sign-in-factor-one-passkey.controller';
import { useSignInFactorOnePasskeyModel } from './sign-in-factor-one-passkey.model';
import { SignInFactorOnePasskeyView } from './sign-in-factor-one-passkey.view';

type SignInFactorOnePasswordProps = {
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
  onFactorPrepare: (f: ResetPasswordCodeFactor) => void;
};

export const SignInFactorOnePasskey = (props: SignInFactorOnePasswordProps) => {
  const model = useSignInFactorOnePasskeyModel();
  const controller = useSignInFactorOnePasskeyController(model);

  return (
    <SignInFactorOnePasskeyView
      {...controller}
      onShowAlternativeMethodsClick={props.onShowAlternativeMethodsClick}
    />
  );
};
