import type { ResetPasswordCodeFactor } from '@clerk/types';

import { useCoreSignIn } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneCodeCard } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInForgotPasswordCardProps = SignInFactorOneCodeCard & { factor: ResetPasswordCodeFactor };

export const SignInFactorOneForgotPasswordCard = (props: SignInForgotPasswordCardProps) => {
  const { supportedFirstFactors, identifier } = useCoreSignIn();

  const strategy = supportedFirstFactors.find(factor => (factor as any)?.safeIdentifier === identifier)?.strategy;
  const isPhoneStrategy = strategy === 'phone_code';

  return (
    <Flow.Part part='resetPassword'>
      <SignInFactorOneCodeForm
        {...props}
        showAlternativeMethods={false}
        cardTitle={
          isPhoneStrategy
            ? localizationKeys('signIn.forgotPassword.title_phone')
            : localizationKeys('signIn.forgotPassword.title_email')
        }
        cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle')}
        formTitle={localizationKeys('signIn.forgotPassword.formTitle')}
        formSubtitle={localizationKeys('signIn.forgotPassword.formSubtitle')}
        resendButton={localizationKeys('signIn.forgotPassword.resendButton')}
      />
    </Flow.Part>
  );
};
