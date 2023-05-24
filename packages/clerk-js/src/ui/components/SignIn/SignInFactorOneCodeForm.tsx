import type { EmailCodeFactor, PhoneCodeFactor, ResetPasswordCodeFactor } from '@clerk/types';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useCoreClerk, useCoreSignIn, useSignInContext } from '../../contexts';
import type { VerificationCodeCardProps } from '../../elements';
import { useCardState, VerificationCodeCard } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import type { LocalizationKey } from '../../localization';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

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
  formTitle: LocalizationKey;
  formSubtitle: LocalizationKey;
  resendButton: LocalizationKey;
};

export const SignInFactorOneCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigate } = useRouter();
  const { navigateAfterSignIn } = useSignInContext();
  const { setActive } = useCoreClerk();
  const supportEmail = useSupportEmail();

  const goBack = () => {
    return navigate('../');
  };

  React.useEffect(() => {
    if (!props.factorAlreadyPrepared) {
      prepare();
    }
  }, []);

  const prepare = () => {
    void signIn
      .prepareFirstFactor(props.factor)
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
            return setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignIn });
          case 'needs_second_factor':
            return navigate('../factor-two');
          case 'needs_new_password':
            return navigate('../reset-password');
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => reject(err));
  };

  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      formTitle={props.formTitle}
      formSubtitle={props.formSubtitle}
      resendButton={props.resendButton}
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={prepare}
      safeIdentifier={props.factor.safeIdentifier}
      profileImageUrl={signIn.userData.imageUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
      onIdentityPreviewEditClicked={goBack}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
