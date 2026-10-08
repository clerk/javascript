import { useClerk } from '@clerk/shared/react';

import { useSignUpContext } from '@/contexts';
import { usePreloadTasks } from '@/hooks/usePreloadTasks';

import type { SignUpRoutesData } from './sign-up-routes.types';

export const useSignUpRoutesModel = (): SignUpRoutesData => {
  usePreloadTasks();
  const clerk = useClerk();
  const signUpContext = useSignUpContext();

  return {
    signUpUrl: signUpContext.signUpUrl,
    signInUrl: signUpContext.signInUrl,
    afterSignUpUrl: signUpContext.afterSignUpUrl,
    afterSignInUrl: signUpContext.afterSignInUrl,
    secondFactorUrl: signUpContext.secondFactorUrl,
    ssoCallbackUrl: signUpContext.ssoCallbackUrl,
    oidcPrompt: signUpContext.oidcPrompt,
    unsafeMetadata: signUpContext.unsafeMetadata,
    canVerifyEmail: () => !!clerk.client.signUp.emailAddress,
    canVerifyPhone: () => !!clerk.client.signUp.phoneNumber,
  };
};
