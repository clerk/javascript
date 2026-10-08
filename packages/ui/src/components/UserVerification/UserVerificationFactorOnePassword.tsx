import React from 'react';

import { useUserVerificationFactorOnePasswordController } from './user-verification-factor-one-password.controller';
import { useUserVerificationFactorOnePasswordModel } from './user-verification-factor-one-password.model';
import { UserVerificationFactorOnePasswordView } from './user-verification-factor-one-password.view';

type UserVerificationFactorOnePasswordProps = {
  onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
};

export function UserVerificationFactorOnePasswordCard(props: UserVerificationFactorOnePasswordProps): JSX.Element {
  const model = useUserVerificationFactorOnePasswordModel();
  const controller = useUserVerificationFactorOnePasswordController(model);
  return (
    <UserVerificationFactorOnePasswordView
      controller={controller}
      onShowAlternativeMethodsClick={props.onShowAlternativeMethodsClick}
    />
  );
}
