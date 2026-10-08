import { useClerk } from '@clerk/shared/react';
import { useCallback } from 'react';

export const useSignUpRedirectModel = () => {
  const clerk = useClerk();
  const redirectToSignUp = useCallback(() => clerk.redirectToSignUp(), [clerk]);

  return { redirectToSignUp };
};
