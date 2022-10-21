import { CreateOrganizationParams, OrganizationMembershipResource, OrganizationResource } from '@clerk/types';

import { useClerkInstanceContext } from './contexts';

type UseOrganizationsReturn =
  | {
      isLoaded: false;
      createOrganization: undefined;
      getOrganizationMemberships: undefined;
      getOrganization: undefined;
    }
  | {
      isLoaded: true;
      createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;
      getOrganizationMemberships: () => Promise<OrganizationMembershipResource[]>;
      getOrganization: (organizationId: string) => Promise<OrganizationResource | undefined>;
    };

type UseOrganizations = () => UseOrganizationsReturn;

export const useOrganizations: UseOrganizations = () => {
  const clerk = useClerkInstanceContext();
  if (!clerk.loaded) {
    return {
      isLoaded: false,
      createOrganization: undefined,
      getOrganizationMemberships: undefined,
      getOrganization: undefined,
    };
  }

  return {
    isLoaded: true,
    createOrganization: clerk.createOrganization,
    getOrganizationMemberships: clerk.getOrganizationMemberships,
    getOrganization: clerk.getOrganization,
  };
};
