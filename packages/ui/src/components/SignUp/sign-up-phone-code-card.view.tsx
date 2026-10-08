import { LoadingCard } from '@/ui/elements/LoadingCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';

import { Flow, localizationKeys } from '../../customizables';
import type { SignUpPhoneCodeViewProps } from './sign-up-code-verification.types';

export const SignUpPhoneCodeCardView = ({
  cardTitleKey,
  cardSubtitleKey,
  resendButtonKey,
  prepare,
  action,
  goBack,
  prepareWithSMS,
  phoneNumber,
  isAlternativePhoneCodeProvider,
  isLoading,
}: SignUpPhoneCodeViewProps): JSX.Element => {
  if (isLoading) {
    return <LoadingCard />;
  }

  return (
    <Flow.Part part='phoneCode'>
      <VerificationCodeCard
        cardTitle={cardTitleKey}
        cardSubtitle={cardSubtitleKey}
        resendButton={resendButtonKey}
        onResendCodeClicked={() => void prepare()}
        onCodeEntryFinishedAction={action}
        onIdentityPreviewEditClicked={() => void goBack()}
        safeIdentifier={phoneNumber}
        identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__phoneNumber')}
        alternativeMethodsLabel={
          isAlternativePhoneCodeProvider
            ? localizationKeys('footerActionLink__alternativePhoneCodeProvider')
            : undefined
        }
        onShowAlternativeMethodsClicked={isAlternativePhoneCodeProvider ? prepareWithSMS : undefined}
        showAlternativeMethods={isAlternativePhoneCodeProvider ? true : undefined}
      />
    </Flow.Part>
  );
};
