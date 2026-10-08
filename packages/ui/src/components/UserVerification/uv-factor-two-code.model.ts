import { useSession } from '@clerk/shared/react';
import type { PhoneCodeFactor, TOTPFactor } from '@clerk/shared/types';

import { useAfterVerification } from './use-after-verification';
import { useUVRequestScopeModel } from './uv-request-scope.model';

export const useUVFactorTwoCodeModel = (factor: PhoneCodeFactor | TOTPFactor) => {
  const { session } = useSession();
  const { handleVerificationResponse } = useAfterVerification();
  const scope = useUVRequestScopeModel(
    JSON.stringify([
      'second',
      factor.strategy,
      'phoneNumberId' in factor ? factor.phoneNumberId : 'emailAddressId' in factor ? factor.emailAddressId : null,
    ]),
  );

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    safeIdentifier: 'safeIdentifier' in factor ? factor.safeIdentifier : undefined,
    profileImageUrl: session?.user?.imageUrl,
    attempt: async (code: string) => {
      const response = session
        ? await scope.run(() => session.attemptSecondFactorVerification({ strategy: factor.strategy, code }))
        : undefined;
      return async () => {
        if (response && scope.canRun()) {
          await handleVerificationResponse(response);
        }
      };
    },
  };
};
