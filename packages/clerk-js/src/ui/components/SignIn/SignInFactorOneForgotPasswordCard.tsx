import type { ResetPasswordCodeFactor } from '@clerk/types';

import { useCoreSignIn } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneCodeCard } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInForgotPasswordCardProps = SignInFactorOneCodeCard & { factor: ResetPasswordCodeFactor };

export const SignInFactorOneForgotPasswordCard = (props: SignInForgotPasswordCardProps) => {
  const { supportedFirstFactors } = useCoreSignIn();
  const resetPasswordFactor = supportedFirstFactors.find(({ strategy }) => strategy === 'reset_password_code') as
    | ResetPasswordCodeFactor
    | undefined;

  return (
    <Flow.Part part='resetPassword'>
      <SignInFactorOneCodeForm
        {...props}
        showAlternativeMethods={false}
        cardTitle={
          resetPasswordFactor?.phoneNumberId
            ? localizationKeys('signIn.forgotPassword.title_phone')
            : localizationKeys('signIn.forgotPassword.title_email')
        }
        cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle')}
        formTitle={localizationKeys('signIn.forgotPassword.formTitle')}
        formSubtitle={
          resetPasswordFactor?.phoneNumberId
            ? localizationKeys('signIn.forgotPassword.formSubtitle_phone')
            : localizationKeys('signIn.forgotPassword.formSubtitle_email')
        }
        resendButton={localizationKeys('signIn.forgotPassword.resendButton')}
      />
    </Flow.Part>
  );
};
