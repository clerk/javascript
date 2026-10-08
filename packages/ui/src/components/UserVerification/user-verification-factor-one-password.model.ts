import { useSession } from '@clerk/shared/react';

import { useAfterVerification } from './use-after-verification';
import { useUVRequestScopeModel } from './uv-request-scope.model';

export const useUserVerificationFactorOnePasswordModel = () => {
  const { session } = useSession();
  const { handleVerificationResponse } = useAfterVerification();
  const scope = useUVRequestScopeModel('first:password');

  return {
    verifyPassword: async (password: string) => {
      const response = session
        ? await scope.run(() => session.attemptFirstFactorVerification({ strategy: 'password', password }))
        : undefined;
      if (response) {
        await scope.run(() => handleVerificationResponse(response));
      }
    },
  };
};
