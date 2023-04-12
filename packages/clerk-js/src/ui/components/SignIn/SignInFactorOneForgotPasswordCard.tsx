import type { ResetPasswordCodeFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneCodeCard } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInForgotPasswordCardProps = SignInFactorOneCodeCard & { factor: ResetPasswordCodeFactor };

export const SignInFactorOneForgotPasswordCard = (props: SignInForgotPasswordCardProps) => {
  return (
    <Flow.Part part='resetPassword'>
      <SignInFactorOneCodeForm
        {...props}
        showAlternativeMethods={false}
        cardTitle={localizationKeys('signIn.forgotPassword.title_email')}
        cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle')}
        formTitle={localizationKeys('signIn.forgotPassword.formTitle')}
        formSubtitle={localizationKeys('signIn.forgotPassword.formSubtitle')}
        resendButton={localizationKeys('signIn.forgotPassword.resendButton')}
      />
    </Flow.Part>
  );
};
