import { SignUpResource } from '@clerk/types';
import React from 'react';

import { useCoreClerk, useSignUpContext } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks/useNavigate';
import { completeSignUpFlow } from '../../ui/signUp/util';
import { VerificationCodeCard, VerificationCodeCardProps } from '../elements';

type SignInFactorOneCodeFormProps = {
  cardTitle: string;
  cardSubtitle: string;
  formTitle: string;
  formSubtitle: string;
  prepare: () => Promise<SignUpResource> | undefined;
  attempt: (code: string) => Promise<SignUpResource>;
  safeIdentifier: string | undefined | null;
};

export const SignUpVerificationCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const { navigateAfterSignUp } = useSignUpContext();
  const { setActive } = useCoreClerk();
  const { navigate } = useNavigate();

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    return props
      .attempt(code)
      .then(async res => {
        await resolve();
        return completeSignUpFlow({
          signUp: res,
          verifyEmailPath: '../verify-email-address',
          verifyPhonePath: '../verify-phone-number',
          handleComplete: () => setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignUp }),
          navigate,
        });
      })
      .catch(err => {
        // TODO: Check if this is enough
        return reject(err);
      });
  };

  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      formTitle={props.formTitle}
      formSubtitle={props.formSubtitle}
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={props.prepare}
      safeIdentifier={props.safeIdentifier || ''}
    />
  );
};
