import { useSession } from '@clerk/shared/react';
import type { PhoneCodeFactor } from '@clerk/shared/types';

import { useUVRequestScopeModel } from './uv-request-scope.model';

export const useUVFactorTwoPhoneCodeCardModel = (factor: PhoneCodeFactor) => {
  const { session } = useSession();
  const scope = useUVRequestScopeModel(JSON.stringify(['second', factor.strategy, factor.phoneNumberId]));

  return {
    prepare: async () => {
      const { phoneNumberId, strategy } = factor;
      if (session) {
        await scope.run(() => session.prepareSecondFactorVerification({ phoneNumberId, strategy }));
      }
    },
  };
};
