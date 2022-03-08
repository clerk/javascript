import { CreateOrganizationParams, OrganizationResource } from '@clerk/types';
import { useContext } from 'react';

import { assertWrappedByClerkProvider } from '../contexts/assertHelpers';
import { StructureContext } from '../contexts/StructureContext';
import { useClerk } from './useClerk';

type UseOrganizations = {
  createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;
  getOrganizations: () => Promise<OrganizationResource[]>;
  getOrganization: (organizationId: string) => Promise<OrganizationResource | undefined>;
};

export function useOrganizations(): UseOrganizations {
  const structureCtx = useContext(StructureContext);
  assertWrappedByClerkProvider(structureCtx);
  const clerk = useClerk();

  return {
    createOrganization: clerk.createOrganization,
    getOrganizations: clerk.getOrganizations,
    getOrganization: clerk.getOrganization,
  };
}
