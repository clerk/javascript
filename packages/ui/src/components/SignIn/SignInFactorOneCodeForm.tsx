import type { EmailCodeFactor, PhoneCodeFactor, ResetPasswordCodeFactor } from '@clerk/shared/types';

import { useCodePreparationController } from '@/ui/common/useCodePreparationController';
import { useCodeSubmissionController } from '@/ui/common/useCodeSubmissionController';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';

import type { LocalizationKey } from '../../localization';
import { useSignInFactorOneCodeFormModel } from './sign-in-factor-one-code-form.model';
import { SignInFactorOneCodeFormView } from './sign-in-factor-one-code-form.view';

export type SignInFactorOneCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: EmailCodeFactor | PhoneCodeFactor | ResetPasswordCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

export type SignInFactorOneCodeFormProps = SignInFactorOneCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  cardNotice?: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
  identityPreviewEditButtonAriaLabel: LocalizationKey;
};

export const SignInFactorOneCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const model = useSignInFactorOneCodeFormModel(props);
  const { prepare } = useCodePreparationController(model);
  const action = useCodeSubmissionController(model);
  return (
    <SignInFactorOneCodeFormView
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      cardNotice={props.cardNotice}
      inputLabel={props.inputLabel}
      resendButton={props.resendButton}
      identityPreviewEditButtonAriaLabel={props.identityPreviewEditButtonAriaLabel}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
      onBackLinkClicked={props.onBackLinkClicked}
      action={action}
      prepare={prepare}
      goBack={model.goBack}
      safeIdentifier={model.safeIdentifier}
      profileImageUrl={model.profileImageUrl}
    />
  );
};
