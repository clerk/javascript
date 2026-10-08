import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';

import { localizationKeys, Text } from '../../customizables';
import type { SignInFactorTwoCodeViewProps } from './sign-in-code-form.types';

export const SignInFactorTwoCodeFormView = ({
  cardTitle,
  cardSubtitle,
  cardNotice,
  resendButton,
  inputLabel,
  action,
  prepare,
  safeIdentifier,
  profileImageUrl,
  onShowAlternativeMethodsClicked,
  onDifferentAccountClicked,
  resettingPassword,
}: SignInFactorTwoCodeViewProps): JSX.Element => (
  <VerificationCodeCard
    cardTitle={cardTitle}
    cardSubtitle={cardSubtitle}
    cardNotice={cardNotice}
    resendButton={resendButton}
    inputLabel={inputLabel}
    onCodeEntryFinishedAction={action}
    onResendCodeClicked={
      prepare
        ? () => {
            void prepare();
          }
        : undefined
    }
    safeIdentifier={safeIdentifier}
    profileImageUrl={profileImageUrl}
    identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__identifier')}
    onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked}
    onDifferentAccountClicked={() => {
      void onDifferentAccountClicked();
    }}
  >
    {resettingPassword && (
      <Text
        localizationKey={localizationKeys('signIn.resetPasswordMfa.detailsLabel')}
        colorScheme='secondary'
      />
    )}
  </VerificationCodeCard>
);
