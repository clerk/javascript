import { useEffect } from 'react';

import type { useSignUpRedirectModel } from './sign-up-redirect.model';

export const useSignUpRedirectController = (model: ReturnType<typeof useSignUpRedirectModel>) => {
  const { redirectToSignUp } = model;

  useEffect(() => {
    void redirectToSignUp();
  }, [redirectToSignUp]);
};
