import { useSession } from '@clerk/shared/react';

import { useAfterVerification } from './use-after-verification';
import { useUVRequestScopeModel } from './uv-request-scope.model';

export const useUVFactorOnePasskeysModel = () => {
  const { session } = useSession();
  const { handleVerificationResponse } = useAfterVerification();
  const scope = useUVRequestScopeModel('first:passkey');

  return {
    verifyWithPasskey: async () => {
      const response = session ? await scope.run(() => session.verifyWithPasskey()) : undefined;
      if (response) {
        await scope.run(() => handleVerificationResponse(response));
      }
    },
  };
};
