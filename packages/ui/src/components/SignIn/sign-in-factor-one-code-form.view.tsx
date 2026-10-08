import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';

import type { SignInFactorOneCodeViewProps } from './sign-in-code-form.types';

export const SignInFactorOneCodeFormView = ({
  cardTitle,
  cardSubtitle,
  cardNotice,
  inputLabel,
  resendButton,
  action,
  prepare,
  safeIdentifier,
  profileImageUrl,
  identityPreviewEditButtonAriaLabel,
  onShowAlternativeMethodsClicked,
  showAlternativeMethods,
  goBack,
  onBackLinkClicked,
}: SignInFactorOneCodeViewProps): JSX.Element => (
  <VerificationCodeCard
    cardTitle={cardTitle}
    cardSubtitle={cardSubtitle}
    cardNotice={cardNotice}
    inputLabel={inputLabel}
    resendButton={resendButton}
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
    identityPreviewEditButtonAriaLabel={identityPreviewEditButtonAriaLabel}
    onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked}
    showAlternativeMethods={showAlternativeMethods}
    onIdentityPreviewEditClicked={() => {
      void goBack();
    }}
    onBackLinkClicked={onBackLinkClicked}
  />
);
