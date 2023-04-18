import type { PhoneCodeFactor, SignInResource, TOTPFactor } from '@clerk/types';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useCoreSignIn, useOptions } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import type { VerificationCodeCardProps } from '../../elements';
import { useCardState, VerificationCodeCard } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import type { LocalizationKey } from '../../localization';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

export type SignInFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: PhoneCodeFactor | TOTPFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  prepare?: () => Promise<SignInResource>;
};

type SignInFactorTwoCodeFormProps = SignInFactorTwoCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  formTitle: LocalizationKey;
  formSubtitle: LocalizationKey;
  resendButton?: LocalizationKey;
};

export const SignInFactorTwoCodeForm = (props: SignInFactorTwoCodeFormProps) => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const { experimental_enableClerkImages } = useOptions();

  React.useEffect(() => {
    if (props.factorAlreadyPrepared) {
      return;
    }

    void prepare?.();
  }, []);

  const prepare = props.prepare
    ? () => {
        return props
          .prepare?.()
          .then(() => props.onFactorPrepare())
          .catch(err => handleError(err, [], card.setError));
      }
    : undefined;

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    signIn
      .attemptSecondFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();
        switch (res.status) {
          case 'complete':
            return navigate(`../reset-password-success?createdSessionId=${res.createdSessionId}`);
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => reject(err));
  };

  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={signIn?.resetPasswordFlow ? localizationKeys('signIn.forgotPassword.subtitle') : props.cardSubtitle}
      formTitle={props.formTitle}
      formSubtitle={props.formSubtitle}
      resendButton={props.resendButton}
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={prepare}
      safeIdentifier={'safeIdentifier' in props.factor ? props.factor.safeIdentifier : undefined}
      profileImageUrl={
        experimental_enableClerkImages ? signIn.userData.experimental_imageUrl : signIn.userData.profileImageUrl
      }
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    >
      {/* TODO:  Conditionally render + localization */}
      <Text
        localizationKey={'We need to verify your identity before resetting your password.'}
        variant='smallRegular'
        colorScheme='neutral'
      />
    </VerificationCodeCard>
  );
};
