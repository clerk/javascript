import { forwardClerkQueryParams } from '@clerk/shared/internal/clerk-js/queryParams';
import type { SignUpResource } from '@clerk/shared/types';
import { useContext } from 'react';

import { SignInContext, useSignUpContext } from '../../contexts';
import { useRouter } from '../../router';
import { useCompleteSignUpFlow } from './useCompleteSignUpFlow';

export const useSignUpVerificationCodeFormModel = () => {
  const { isCombinedFlow: combinedFlowEnabled } = useSignUpContext();
  const { navigate } = useRouter();
  const completeSignUpFlow = useCompleteSignUpFlow();
  const isWithinSignInContext = !!useContext(SignInContext);
  const isCombinedFlow = !!(isWithinSignInContext && combinedFlowEnabled);

  return {
    goBack: () => {
      const params = forwardClerkQueryParams();
      return navigate(isCombinedFlow ? '../../' : '../', { searchParams: params });
    },
    complete: (resource: SignUpResource) =>
      completeSignUpFlow({
        signUp: resource,
        verifyEmailPath: '../verify-email-address',
        verifyPhonePath: '../verify-phone-number',
        protectCheckPath: '../protect-check',
        continuePath: '../continue',
      }),
  };
};
