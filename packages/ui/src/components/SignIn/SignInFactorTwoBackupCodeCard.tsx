import type React from 'react';

import { useSignInFactorTwoBackupCodeController } from './sign-in-factor-two-backup-code.controller';
import { useSignInFactorTwoBackupCodeModel } from './sign-in-factor-two-backup-code.model';
import { SignInFactorTwoBackupCodeView } from './sign-in-factor-two-backup-code.view';

type SignInFactorTwoBackupCodeCardProps = {
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
};

export const SignInFactorTwoBackupCodeCard = (props: SignInFactorTwoBackupCodeCardProps) => {
  const model = useSignInFactorTwoBackupCodeModel();
  const controller = useSignInFactorTwoBackupCodeController(model);

  return (
    <SignInFactorTwoBackupCodeView
      {...controller}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    />
  );
};
