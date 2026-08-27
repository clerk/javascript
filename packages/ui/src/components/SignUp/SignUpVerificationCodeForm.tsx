import { forwardClerkQueryParams } from '@clerk/shared/internal/clerk-js/queryParams';
import type { SignUpResource } from '@clerk/shared/types';
import React from 'react';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';

import { SignInContext, useSignUpContext } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { useRouter } from '../../router';
import { useCompleteSignUpFlow } from './useCompleteSignUpFlow';

type SignInFactorOneCodeFormProps = {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel?: LocalizationKey;
  resendButton: LocalizationKey;
  prepare: () => Promise<SignUpResource | void> | undefined;
  attempt: (code: string) => Promise<SignUpResource>;
  safeIdentifier?: string | undefined | null;
  identityPreviewEditButtonAriaLabel: LocalizationKey;
  alternativeMethodsLabel?: LocalizationKey;
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
  showAlternativeMethods?: boolean;
};

export const SignUpVerificationCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const { isCombinedFlow: _isCombinedFlow } = useSignUpContext();
  const { navigate } = useRouter();
  const completeSignUpFlow = useCompleteSignUpFlow();

  const isWithinSignInContext = !!React.useContext(SignInContext);
  const isCombinedFlow = !!(isWithinSignInContext && _isCombinedFlow);

  const goBack = () => {
    const params = forwardClerkQueryParams();
    return navigate(isCombinedFlow ? '../../' : '../', { searchParams: params });
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    void props
      .attempt(code)
      .then(async res => {
        await resolve();
        return completeSignUpFlow({
          signUp: res,
          verifyEmailPath: '../verify-email-address',
          verifyPhonePath: '../verify-phone-number',
          protectCheckPath: '../protect-check',
          continuePath: '../continue',
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
      resendButton={props.resendButton}
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={props.prepare}
      safeIdentifier={props.safeIdentifier}
      onIdentityPreviewEditClicked={goBack}
      identityPreviewEditButtonAriaLabel={props.identityPreviewEditButtonAriaLabel}
      alternativeMethodsLabel={props.alternativeMethodsLabel}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
    />
  );
};
