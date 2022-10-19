import { createContextAndHook } from '@clerk/shared';
import { OrganizationInvitationResource, OrganizationMembershipResource, OrganizationResource } from '@clerk/types';

/**
 * @internal
 */
export const [OrganizationContext, useOrganizationContext] = createContextAndHook<{
  organization: OrganizationResource | null | undefined;
  lastOrganizationInvitation: OrganizationInvitationResource | null | undefined;
  lastOrganizationMember: OrganizationMembershipResource | null | undefined;
}>('OrganizationContext');
