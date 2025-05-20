import { isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { EmailCodeFactor, PhoneCodeFactor, ResetPasswordCodeFactor, SignInFactor } from '@clerk/types';
import { useState } from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import type { VerificationCodeCardProps } from '../../elements';
import { LoadingCard, useCardState, VerificationCodeCard } from '../../elements';
import { useFetch } from '../../hooks';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { type LocalizationKey, localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

export type SignInFactorOneCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: EmailCodeFactor | PhoneCodeFactor | ResetPasswordCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  onChangePhoneCodeChannel?: (factor: SignInFactor) => void;
};

export type SignInFactorOneCodeFormProps = SignInFactorOneCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
};

export const SignInFactorOneCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigate } = useRouter();
  const { afterSignInUrl } = useSignInContext();
  const { setActive } = useClerk();
  const supportEmail = useSupportEmail();
  const clerk = useClerk();
  const [userSelectedFallbackToSMS, setUserSelectedFallbackToSMS] = useState(false);

  const shouldAvoidPrepare = signIn.firstFactorVerification.status === 'verified' && props.factorAlreadyPrepared;
  const isAlternativePhoneCodeProvider =
    props.factor.strategy === 'phone_code' ? !!props.factor.channel && props.factor.channel !== 'sms' : false;
  const channelToBeSent = isAlternativePhoneCodeProvider ? (props.factor as PhoneCodeFactor).channel : undefined;

  const goBack = () => {
    return navigate('../');
  };

  const prepare = () => {
    if (shouldAvoidPrepare) {
      return;
    }

    void signIn
      .prepareFirstFactor({ ...props.factor, channel: channelToBeSent } as PhoneCodeFactor)
      .then(() => props.onFactorPrepare())
      .catch(err => handleError(err, [], card.setError));
  };

  useFetch(
    // If an alternative phone code provider is used, we skip the prepare step
    // because the verification is already created on the Start screen
    shouldAvoidPrepare || isAlternativePhoneCodeProvider || userSelectedFallbackToSMS
      ? undefined
      : () =>
          signIn
            ?.prepareFirstFactor({ ...props.factor, channel: channelToBeSent } as PhoneCodeFactor)
            .then(() => props.onFactorPrepare())
            .catch(err => handleError(err, [], card.setError)),
    {
      name: 'signIn.prepareFirstFactor',
      factor: { ...props.factor, channel: undefined },
      id: signIn.id,
    },
    {
      staleTime: 100,
    },
  );

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    signIn
      .attemptFirstFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();

        switch (res.status) {
          case 'complete':
            return setActive({ session: res.createdSessionId, redirectUrl: afterSignInUrl });
          case 'needs_second_factor':
            return navigate('../factor-two');
          case 'needs_new_password':
            return navigate('../reset-password');
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => {
        if (isUserLockedError(err)) {
          // @ts-expect-error -- private method for the time being
          return clerk.__internal_navigateWithError('..', err.errors[0]);
        }

        return reject(err);
      });
  };

  const prepareWithSMS = () => {
    card.setLoading();
    card.setError(undefined);
    void signIn
      .prepareFirstFactor({ ...props.factor, channel: undefined } as PhoneCodeFactor)
      .then(() => setUserSelectedFallbackToSMS(true))
      .then(() => props.onFactorPrepare())
      .then(() => props.onChangePhoneCodeChannel?.({ ...props.factor, channel: 'sms' } as SignInFactor))
      .catch(err => handleError(err, [], card.setError))
      .finally(() => card.setIdle());
  };

  if (card.isLoading) {
    return <LoadingCard />;
  }

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
      // if the factor is an alternative phone code provider, we don't want to show the alternative methods
      // instead we want to go back to the start screen
      alternativeMethodsLabel={
        isAlternativePhoneCodeProvider ? localizationKeys('footerActionLink__alternativePhoneCodeProvider') : undefined
      }
      onShowAlternativeMethodsClicked={
        isAlternativePhoneCodeProvider ? prepareWithSMS : props.onShowAlternativeMethodsClicked
      }
      showAlternativeMethods={isAlternativePhoneCodeProvider ? true : props.showAlternativeMethods}
      onIdentityPreviewEditClicked={goBack}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
