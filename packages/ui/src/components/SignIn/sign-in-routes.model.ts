import { useClerk } from '@clerk/shared/react';
import { useCallback } from 'react';

import { useSignInContext, useSignUpContext } from '../../contexts';

export const useSignInRoutesModel = () => {
  const signInContext = useSignInContext();
  const signUpContext = useSignUpContext();
  return { signInContext, signUpContext };
};

export const useRedirectToSignInModel = () => {
  const clerk = useClerk();
  const redirectToSignIn = useCallback(() => clerk.redirectToSignIn(), [clerk]);
  return { redirectToSignIn };
};
