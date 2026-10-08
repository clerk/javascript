import { useSession } from '@clerk/shared/react';
import type { EmailCodeFactor, PhoneCodeFactor } from '@clerk/shared/types';

import { useAfterVerification } from './use-after-verification';
import { useUVRequestScopeModel } from './uv-request-scope.model';

export const useUVFactorOneCodeModel = (factor: EmailCodeFactor | PhoneCodeFactor) => {
  const { session } = useSession();
  const { handleVerificationResponse } = useAfterVerification();
  const scope = useUVRequestScopeModel(
    JSON.stringify([
      'first',
      factor.strategy,
      'phoneNumberId' in factor ? factor.phoneNumberId : 'emailAddressId' in factor ? factor.emailAddressId : null,
    ]),
  );

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    safeIdentifier: factor.safeIdentifier,
    profileImageUrl: session?.user?.imageUrl,
    prepare: async () => {
      if (session) {
        await scope.run(() => session.prepareFirstFactorVerification(factor));
      }
    },
    attempt: async (code: string) => {
      const response = session
        ? await scope.run(() => session.attemptFirstFactorVerification({ strategy: factor.strategy, code }))
        : undefined;
      return async () => {
        if (response && scope.canRun()) {
          await handleVerificationResponse(response);
        }
      };
    },
  };
};
