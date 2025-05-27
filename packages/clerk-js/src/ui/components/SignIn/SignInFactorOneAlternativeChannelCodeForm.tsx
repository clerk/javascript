import { isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { PhoneCodeFactor, SignInFactor } from '@clerk/types';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import type { VerificationCodeCardProps } from '../../elements';
import { useCardState, VerificationCodeCard } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { type LocalizationKey, localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

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
  const { afterSignInUrl } = useSignInContext();
  const { setActive } = useClerk();
  const supportEmail = useSupportEmail();
  const clerk = useClerk();
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
