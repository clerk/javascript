import {
  CreateOrganizationParams,
  LoadedClerk,
  OrganizationMembershipResource,
  OrganizationResource,
} from '@clerk/types';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

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
  const isomorphicClerk = useIsomorphicClerkContext();

  if (!isomorphicClerk.loaded) {
    return {
      isLoaded: false,
      createOrganization: undefined,
      getOrganizationMemberships: undefined,
      getOrganization: undefined,
    };
  }

  const clerk = isomorphicClerk as unknown as LoadedClerk;
  return {
    isLoaded: true,
    createOrganization: clerk.createOrganization,
    getOrganizationMemberships: clerk.getOrganizationMemberships,
    getOrganization: clerk.getOrganization,
  };
};
