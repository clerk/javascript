import type { PhoneCodeFactor, SignInFactor, SignInResource } from '@clerk/shared/types';

import { useCardState } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import { type LocalizationKey, localizationKeys } from '../../localization';

export type SignInFactorOneAlternativeChannelCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: PhoneCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  onChangePhoneCodeChannel: (factor: SignInFactor) => void;
  onAttemptCode: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  onPrepare: (factor: PhoneCodeFactor) => Promise<SignInResource>;
  onGoBack: () => void;
  avatarUrl: string | undefined;
  shouldAvoidPrepare: boolean;
};

export type SignInFactorOneAlternativeChannelCodeFormProps = SignInFactorOneAlternativeChannelCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
};

export const SignInFactorOneAlternativeChannelCodeForm = (props: SignInFactorOneAlternativeChannelCodeFormProps) => {
  const card = useCardState();
  const channel = props.factor.channel;

  const prepare = () => {
    if (props.shouldAvoidPrepare) {
      return;
    }

    void props
      .onPrepare({ ...props.factor, channel } as PhoneCodeFactor)
      .then(() => props.onFactorPrepare())
      .catch(err => handleError(err, [], card.setError));
  };

  const prepareWithSMS = () => {
    card.setError(undefined);
    props.onChangePhoneCodeChannel({ ...props.factor, channel: undefined } as SignInFactor);
  };

  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      inputLabel={props.inputLabel}
      resendButton={props.resendButton}
      onCodeEntryFinishedAction={props.onAttemptCode}
      onResendCodeClicked={prepare}
      safeIdentifier={props.factor.safeIdentifier}
      profileImageUrl={props.avatarUrl}
      alternativeMethodsLabel={localizationKeys('footerActionLink__alternativePhoneCodeProvider')}
      onShowAlternativeMethodsClicked={prepareWithSMS}
      showAlternativeMethods
      onIdentityPreviewEditClicked={props.onGoBack}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
