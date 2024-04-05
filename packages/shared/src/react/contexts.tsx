'use client';

import type {
  ActiveSessionResource,
  ClientResource,
  LoadedClerk,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
  UserResource,
} from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { deprecated } from '../deprecated';
import { createContextAndHook } from './hooks/createContextAndHook';

const [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook<LoadedClerk>('ClerkInstanceContext');
const [UserContext, useUserContext] = createContextAndHook<UserResource | null | undefined>('UserContext');
const [ClientContext, useClientContext] = createContextAndHook<ClientResource | null | undefined>('ClientContext');
const [SessionContext, useSessionContext] = createContextAndHook<ActiveSessionResource | null | undefined>(
  'SessionContext',
);

type OrganizationContextProps = {
  organization: OrganizationResource | null | undefined;

  /**
   * @deprecated This property will be dropped in the next major release.
   * This property is only used in another deprecated part: `invitationList` from useOrganization
   */
  lastOrganizationInvitation: OrganizationInvitationResource | null | undefined;
  /**
   * @deprecated This property will be dropped in the next major release.
   * This property is only used in another deprecated part: `membershipList` from useOrganization
   */
  lastOrganizationMember: OrganizationMembershipResource | null | undefined;
};
const [OrganizationContextInternal, useOrganizationContext] = createContextAndHook<{
  organization: OrganizationResource | null | undefined;
  lastOrganizationInvitation: OrganizationInvitationResource | null | undefined;
  lastOrganizationMember: OrganizationMembershipResource | null | undefined;
}>('OrganizationContext');

const OrganizationProvider = ({
  children,
  organization,
  lastOrganizationMember,
  lastOrganizationInvitation,
}: PropsWithChildren<OrganizationContextProps>) => {
  return (
    <OrganizationContextInternal.Provider
      value={{
        value: {
          organization,
          lastOrganizationMember,
          lastOrganizationInvitation,
        },
      }}
    >
      {children}
    </OrganizationContextInternal.Provider>
  );
};

/**
 * @deprecated use OrganizationProvider instead
 */
export const OrganizationContext = (...args: Parameters<typeof OrganizationProvider>) => {
  deprecated('OrganizationContext', 'Use `OrganizationProvider` instead');
  return OrganizationProvider(...args);
};

export {
  ClientContext,
  useClientContext,
  OrganizationProvider,
  useOrganizationContext,
  UserContext,
  useUserContext,
  SessionContext,
  useSessionContext,
  ClerkInstanceContext,
  useClerkInstanceContext,
};
