import type { PhoneCodeFactor, SignInFactor } from '@clerk/shared/types';

import { useCardState } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import { useCoreSignIn } from '../../contexts';
import { type LocalizationKey, localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { useHandleFirstFactorResult, useHandleUserLockedError } from './useHandleAttemptResult';

export type SignInFactorOneAlternativeChannelCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: PhoneCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  onChangePhoneCodeChannel: (factor: SignInFactor) => void;
};

export type SignInFactorOneAlternativeChannelCodeFormProps = SignInFactorOneAlternativeChannelCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
};

export const SignInFactorOneAlternativeChannelCodeForm = (props: SignInFactorOneAlternativeChannelCodeFormProps) => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigate } = useRouter();
  const handleFirstFactorResult = useHandleFirstFactorResult();
  const handleUserLockedError = useHandleUserLockedError();
  const channel = props.factor.channel;

  const shouldAvoidPrepare = signIn.firstFactorVerification.status === 'verified' && props.factorAlreadyPrepared;

  const goBack = () => {
    return navigate('../');
  };

  const prepare = () => {
    if (shouldAvoidPrepare) {
      return;
    }

    void signIn
      .prepareFirstFactor({ ...props.factor, channel } as PhoneCodeFactor)
      .then(() => props.onFactorPrepare())
      .catch(err => handleError(err, [], card.setError));
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    signIn
      .attemptFirstFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();
        return handleFirstFactorResult(res);
      })
      .catch(err => {
        if (handleUserLockedError(err)) {
          return;
        }
        return reject(err);
      });
  };

  // This is used on clicking "Send code via SMS instead"
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
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={prepare}
      safeIdentifier={props.factor.safeIdentifier}
      profileImageUrl={signIn.userData.imageUrl}
      alternativeMethodsLabel={localizationKeys('footerActionLink__alternativePhoneCodeProvider')}
      onShowAlternativeMethodsClicked={prepareWithSMS}
      showAlternativeMethods
      onIdentityPreviewEditClicked={goBack}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
