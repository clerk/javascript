import { PhoneCodeFactor, SignInResource, TOTPFactor } from '@clerk/types';
import React from 'react';

import { useCoreClerk, useCoreSignIn, useSignInContext } from '../../ui/contexts';
import { useSupportEmail } from '../../ui/hooks/useSupportEmail';
import { useCardState, VerificationCodeCard, VerificationCodeCardProps } from '../elements';
import { handleError } from '../utils';

export type SignInFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: PhoneCodeFactor | TOTPFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  prepare?: () => Promise<SignInResource>;
};

type SignInFactorTwoCodeFormProps = SignInFactorTwoCodeCard & {
  cardTitle: string;
  cardSubtitle: string;
  formTitle: string;
  formSubtitle: string;
};

export const SignInFactorTwoCodeForm = (props: SignInFactorTwoCodeFormProps) => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigateAfterSignIn } = useSignInContext();
  const { setActive } = useCoreClerk();
  const supportEmail = useSupportEmail();

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
    return signIn
      .attemptSecondFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();
        switch (res.status) {
          case 'complete':
            return setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignIn });
          default:
            return alert(
              `Response: ${res.status} not supported yet.\nFor more information contact us at ${supportEmail}`,
            );
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
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={prepare}
      safeIdentifier={'safeIdentifier' in props.factor ? props.factor.safeIdentifier : undefined}
      profileImageUrl={signIn.userData.profileImageUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    />
  );
};
