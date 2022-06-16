import { OrganizationInvitationResource, OrganizationMembershipResource, OrganizationResource } from '@clerk/types';

import { makeContextAndHook } from '../utils/makeContextAndHook';

/**
 * @internal
 */
export const [OrganizationContext, useOrganizationContext] = makeContextAndHook<{
  organization: OrganizationResource | null | undefined;
  lastOrganizationInvitation: OrganizationInvitationResource | null | undefined;
  lastOrganizationMember: OrganizationMembershipResource | null | undefined;
}>('OrganizationContext');
