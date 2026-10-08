import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';

import { localizationKeys } from '../../localization';
import type { useSignInFactorOneAlternativeChannelCodeController } from './sign-in-factor-one-alternative-channel-code.controller';
import type { SignInFactorOneAlternativeChannelCodeFormProps } from './SignInFactorOneAlternativeChannelCodeForm';

type Controller = ReturnType<typeof useSignInFactorOneAlternativeChannelCodeController>;

export type SignInFactorOneAlternativeChannelCodeViewProps = Pick<
  SignInFactorOneAlternativeChannelCodeFormProps,
  'cardTitle' | 'cardSubtitle' | 'inputLabel' | 'resendButton' | 'onBackLinkClicked'
> &
  Controller;

export function SignInFactorOneAlternativeChannelCodeView(props: SignInFactorOneAlternativeChannelCodeViewProps) {
  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      inputLabel={props.inputLabel}
      resendButton={props.resendButton}
      onCodeEntryFinishedAction={props.action}
      onResendCodeClicked={props.prepare}
      safeIdentifier={props.safeIdentifier}
      profileImageUrl={props.profileImageUrl}
      identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__phoneNumber')}
      alternativeMethodsLabel={localizationKeys('footerActionLink__alternativePhoneCodeProvider')}
      onShowAlternativeMethodsClicked={props.prepareWithSMS}
      showAlternativeMethods
      onIdentityPreviewEditClicked={props.goBack}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
}
