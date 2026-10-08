import { useUser } from '@clerk/shared/react';

import { useUserProfileContext } from '@/ui/contexts';

import type { APIKeysProfileModel } from '../APIKeys/api-keys.types';

export const useUserAPIKeysPageModel = (): APIKeysProfileModel => {
  const { user } = useUser();
  const { apiKeysProps } = useUserProfileContext();

  return { subject: user?.id, apiKeysProps };
};
