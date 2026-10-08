import { useOrganization } from '@clerk/shared/react';

export const useOrganizationProfileModel = () => {
  const { organization } = useOrganization();
  return { hasOrganization: Boolean(organization) };
};
