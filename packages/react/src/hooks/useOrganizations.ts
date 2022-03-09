import {
  CreateOrganizationParams,
  OrganizationMembershipResource,
  OrganizationResource,
} from '@clerk/types';
import { useContext } from 'react';

import { assertWrappedByClerkProvider } from '../contexts/assertHelpers';
import { StructureContext } from '../contexts/StructureContext';
import { useClerk } from '../hooks';

type UseOrganizations = {
  createOrganization: (
    params: CreateOrganizationParams,
  ) => Promise<OrganizationResource>;
  getOrganizationMemberships: () => Promise<OrganizationMembershipResource[]>;
  getOrganization: (
    organizationId: string,
  ) => Promise<OrganizationResource | undefined>;
};

export function useOrganizations(): UseOrganizations {
  const structureCtx = useContext(StructureContext);
  assertWrappedByClerkProvider(structureCtx);
  const clerk = useClerk();

  return {
    createOrganization: clerk.createOrganization,
    getOrganizationMemberships: clerk.getOrganizationMemberships,
    getOrganization: clerk.getOrganization,
  };
}
