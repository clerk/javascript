import { EmailCodeFactor, PhoneCodeFactor } from '@clerk/types';
import React from 'react';

import { useCoreClerk, useCoreSignIn, useSignInContext } from '../../ui/contexts';
import { useSupportEmail } from '../../ui/hooks/useSupportEmail';
import { useRouter } from '../../ui/router';
import { VerificationCodeCard, VerificationCodeCardProps } from '../elements';
import { useCardState } from '../elements/contexts';
import { handleError } from '../utils';

export type SignInFactorOneCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: EmailCodeFactor | PhoneCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

type SignInFactorOneCodeFormProps = SignInFactorOneCodeCard & {
  cardTitle: string;
  cardSubtitle: string;
  formTitle: string;
  formSubtitle: string;
};

export const SignInFactorOneCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigate } = useRouter();
  const { navigateAfterSignIn } = useSignInContext();
  const { setActive } = useCoreClerk();
  const supportEmail = useSupportEmail();

  React.useEffect(() => {
    if (signIn.firstFactorVerification.status === null && !props.factorAlreadyPrepared) {
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
    return signIn
      .attemptFirstFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();
        switch (res.status) {
          case 'complete':
            return setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignIn });
          case 'needs_second_factor':
            return navigate('../factor-two');
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
      safeIdentifier={props.factor.safeIdentifier}
      profileImageUrl={signIn.userData.profileImageUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    />
  );
};
