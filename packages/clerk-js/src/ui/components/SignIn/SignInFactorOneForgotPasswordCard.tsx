import type { ResetPasswordCodeFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneCodeCard, SignInFactorOneCodeFormProps } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInForgotPasswordCardProps = SignInFactorOneCodeCard &
  Pick<SignInFactorOneCodeFormProps, 'cardTitle' | 'formSubtitle'> & {
    factor: ResetPasswordCodeFactor;
  };

export const SignInFactorOneForgotPasswordCard = (props: SignInForgotPasswordCardProps) => {
  return (
    <Flow.Part part='resetPassword'>
      <SignInFactorOneCodeForm
        {...props}
        showAlternativeMethods={false}
        cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle')}
        formTitle={localizationKeys('signIn.forgotPassword.formTitle')}
        resendButton={localizationKeys('signIn.forgotPassword.resendButton')}
      />
    </Flow.Part>
  );
};
