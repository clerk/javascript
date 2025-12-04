import type { ResetPasswordCodeFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneCodeCard, SignInFactorOneCodeFormProps } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInForgotPasswordCardProps = SignInFactorOneCodeCard &
  Pick<SignInFactorOneCodeFormProps, 'cardSubtitle'> & {
    factor: ResetPasswordCodeFactor;
  };

export const SignInFactorOneForgotPasswordCard = (props: SignInForgotPasswordCardProps) => {
  return (
    <Flow.Part part='resetPassword'>
      <SignInFactorOneCodeForm
        {...props}
        showAlternativeMethods={false}
        cardTitle={localizationKeys('signIn.forgotPassword.title')}
        inputLabel={localizationKeys('signIn.forgotPassword.formTitle')}
        resendButton={localizationKeys('signIn.forgotPassword.resendButton')}
      />
    </Flow.Part>
  );
};
