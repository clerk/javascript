import {
  CreateOrganizationInvitationParams,
  OrganizationResource,
} from '@clerk/types';
import { useContext } from 'react';

import { useClerk } from '../contexts';
import { assertWrappedByClerkProvider } from '../contexts/assertHelpers';
import { StructureContext } from '../contexts/StructureContext';

type UseOrganization = {
  inviteMember: (
    params: CreateOrganizationInvitationParams,
  ) => Promise<OrganizationResource>;
};

export function useOrganization(organizationId: string): UseOrganization {
  const structureCtx = useContext(StructureContext);
  assertWrappedByClerkProvider(structureCtx);
  const clerk = useClerk();

  return {
    inviteMember: async (params: CreateOrganizationInvitationParams) =>
      // @ts-expect-error
      await clerk.__unstable_inviteMember(organizationId, params),
  };
}
