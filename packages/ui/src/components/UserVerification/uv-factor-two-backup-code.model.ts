import { useSession } from '@clerk/shared/react';

import { useAfterVerification } from './use-after-verification';
import { useUVRequestScopeModel } from './uv-request-scope.model';

export const useUVFactorTwoBackupCodeModel = () => {
  const { session } = useSession();
  const { handleVerificationResponse } = useAfterVerification();
  const scope = useUVRequestScopeModel('second:backup_code');

  return {
    verifyBackupCode: async (code: string) => {
      const response = session
        ? await scope.run(() => session.attemptSecondFactorVerification({ strategy: 'backup_code', code }))
        : undefined;
      if (response) {
        await scope.run(() => handleVerificationResponse(response));
      }
    },
  };
};
