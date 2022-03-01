import { CreateOrganizationParams, OrganizationResource } from '@clerk/types';
import { useContext } from 'react';

import { useClerk } from '../contexts';
import { assertWrappedByClerkProvider } from '../contexts/assertHelpers';
import { StructureContext } from '../contexts/StructureContext';

type UseOrganizations = {
  createOrganization: (
    params: CreateOrganizationParams,
  ) => Promise<OrganizationResource>;
};

export function useOrganizations(): UseOrganizations {
  const structureCtx = useContext(StructureContext);
  assertWrappedByClerkProvider(structureCtx);
  const clerk = useClerk();

  return {
    createOrganization: clerk.createOrganization,
  };
}
