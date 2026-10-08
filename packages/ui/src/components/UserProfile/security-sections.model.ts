import { useUser } from '@clerk/shared/react';

import { useEnvironment, useUserProfileContext } from '@/ui/contexts';
import { getSecondFactors } from '@/ui/utils/mfa';

export const useSecurityPasswordModel = () => {
  const { instanceIsPasswordBased } = useEnvironment().userSettings;
  return { available: instanceIsPasswordBased };
};

export const useSecurityPasskeysModel = () => {
  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();
  return { available: !!attributes.passkey?.enabled && shouldAllowIdentificationCreation };
};

export const useSecurityMfaModel = () => {
  const { attributes } = useEnvironment().userSettings;
  return { available: getSecondFactors(attributes).length > 0 };
};

export const useSecurityDeleteModel = () => {
  const { user } = useUser();
  return { available: !!user?.deleteSelfEnabled };
};
