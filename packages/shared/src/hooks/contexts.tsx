import type {
  ActiveSessionResource,
  ClientResource,
  LoadedClerk,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
  UserResource,
} from '@clerk/types';

import { createContextAndHook } from './createContextAndHook';

const [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook<LoadedClerk>('ClerkInstanceContext');
const [UserContext, useUserContext] = createContextAndHook<UserResource | null | undefined>('UserContext');
const [ClientContext, useClientContext] = createContextAndHook<ClientResource | null | undefined>('ClientContext');
const [SessionContext, useSessionContext] = createContextAndHook<ActiveSessionResource | null | undefined>(
  'SessionContext',
);
const [OrganizationContext, useOrganizationContext] = createContextAndHook<{
  organization: OrganizationResource | null | undefined;
  lastOrganizationInvitation: OrganizationInvitationResource | null | undefined;
  lastOrganizationMember: OrganizationMembershipResource | null | undefined;
}>('OrganizationContext');

export {
  ClientContext,
  useClientContext,
  OrganizationContext,
  useOrganizationContext,
  UserContext,
  useUserContext,
  SessionContext,
  useSessionContext,
  ClerkInstanceContext,
  useClerkInstanceContext,
};
