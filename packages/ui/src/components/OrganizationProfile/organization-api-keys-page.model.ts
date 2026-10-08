import { useOrganization } from '@clerk/shared/react';

import { useOrganizationProfileContext } from '@/ui/contexts';

import type { APIKeysProfileModel } from '../APIKeys/api-keys.types';

export const useOrganizationAPIKeysPageModel = (): APIKeysProfileModel => {
  const { organization } = useOrganization();
  const { apiKeysProps } = useOrganizationProfileContext();

  return { subject: organization?.id, apiKeysProps };
};
